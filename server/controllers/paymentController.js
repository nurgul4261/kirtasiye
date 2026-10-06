const Order = require("../models/Order");
const Product = require("../models/Product");
const {
  generatePaytrToken,
  verifyCallbackHash,
  refundPayment,
  queryPaymentStatus,
  generateEftToken,
} = require("../utils/paytr");
const {
  sendOrderReceivedToCustomer,
  sendPaymentReceivedToAdmin,
} = require("../utils/orderMails");

// Siparişi "ödendi" olarak işaretler ve mailleri gönderir.
// Atomik güncelleme sayesinde callback ve durum sorgusu aynı anda gelse bile mail tek kez gider.
const markOrderPaid = async (orderId) => {
  const paidOrder = await Order.findOneAndUpdate(
    { _id: orderId, isPaid: false },
    { isPaid: true, paidAt: new Date(), status: "onaylandi" },
    { new: true },
  ).populate("user", "name email");

  if (!paidOrder) return null; // zaten ödenmiş

  try {
    await sendPaymentReceivedToAdmin(paidOrder);
  } catch (err) {
    console.error("Admin ödeme maili gönderilemedi:", err.message);
  }
  try {
    await sendOrderReceivedToCustomer(paidOrder);
  } catch (err) {
    console.error("Müşteri sipariş maili gönderilemedi:", err.message);
  }

  return paidOrder;
};

// @desc    Sipariş için PayTR ödeme token'ı oluştur
// @route   POST /api/payment/init
const initPaytrPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body; // paymentMethod: 'card' (varsayılan) | 'eft'
    const order = await Order.findById(orderId).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });
    if (order.isPaid)
      return res.status(400).json({ message: "Bu sipariş zaten ödenmiş" });

    const merchantOid =
      "ORD" + order._id.toString().slice(-10) + Date.now().toString().slice(-4);
    order.paytrMerchantOid = merchantOid;
    order.paymentMethod = paymentMethod === "eft" ? "eft" : "paytr";
    await order.save();

    // ── Havale/EFT ile ödeme ──
    // NOT: Bu seçeneği kullanabilmek için önce PayTR'den Havale/EFT yetkisi almanız gerekir
    // (Mağaza Paneli > Destek & Kurulum > Destek talebi ile istenir).
    if (paymentMethod === "eft") {
      const eftResult = await generateEftToken({
        merchantOid,
        userIp: req.ip,
        email: order.user.email,
        amount: order.totalPrice,
        userName: order.shippingAddress.name,
        userPhone: order.shippingAddress.phone,
      });

      if (eftResult.status === "success") {
        return res.json({ token: eftResult.token, method: "eft" });
      }
      return res.status(400).json({
        message: eftResult.reason || "Havale/EFT ödemesi başlatılamadı",
      });
    }

    // ── Kredi kartı ile ödeme (varsayılan) ──
    const userBasket = order.orderItems.map((item) => [
      item.name,
      item.price.toFixed(2),
      item.quantity,
    ]);

    const result = await generatePaytrToken({
      merchantOid,
      userIp: req.ip,
      email: order.user.email,
      amount: order.totalPrice,
      userBasket,
      userName: order.shippingAddress.name,
      userAddress: `${order.shippingAddress.street}, ${order.shippingAddress.district}/${order.shippingAddress.city}`,
      userPhone: order.shippingAddress.phone,
    });

    if (result.status === "success") {
      return res.json({ token: result.token, method: "card" });
    }
    return res
      .status(400)
      .json({ message: result.reason || "Ödeme başlatılamadı" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// @desc    PayTR'nin ödeme sonucunu bildirdiği webhook
// @route   POST /api/payment/callback  (PUBLIC - PayTR sunucusu çağırır)
const paytrCallback = async (req, res) => {
  try {
    const isValid = verifyCallbackHash(req.body);
    if (!isValid)
      return res.status(400).send("PAYTR notification failed: bad hash");

    const { merchant_oid, status } = req.body;
    const order = await Order.findOne({ paytrMerchantOid: merchant_oid });

    if (order && !order.isPaid) {
      if (status === "success") {
        await markOrderPaid(order._id);
      } else if (order.status !== "iptal_edildi") {
        // Ödeme başarısız → stoğu geri yükle, siparişi iptal et
        // (iptal_edildi kontrolü: tekrarlayan callback'te stok iki kez eklenmesin)
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
        order.status = "iptal_edildi";
        await order.save();
      }
    }

    // PayTR'ye MUTLAKA "OK" dönülmeli, aksi halde tekrar tekrar dener
    res.send("OK");
  } catch (err) {
    console.error(err);
    res.send("OK");
  }
};

// @desc    Siparişi kısmen veya tamamen iade et (admin)
// @route   POST /api/payment/refund
const refundOrder = async (req, res) => {
  try {
    const { orderId, amount } = req.body; // amount verilmezse tam iade yapılır
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });
    if (!order.isPaid)
      return res
        .status(400)
        .json({ message: "Bu sipariş için ödeme alınmamış" });
    if (!order.paytrMerchantOid) {
      return res
        .status(400)
        .json({ message: "Bu siparişin PayTR sipariş numarası yok" });
    }

    const refundAmount = amount
      ? Number(amount)
      : order.totalPrice - order.refundAmount;
    if (
      refundAmount <= 0 ||
      refundAmount > order.totalPrice - order.refundAmount
    ) {
      return res.status(400).json({ message: "Geçersiz iade tutarı" });
    }

    const result = await refundPayment({
      merchantOid: order.paytrMerchantOid,
      returnAmount: refundAmount,
    });

    if (result.status === "success") {
      order.refundAmount += refundAmount;
      order.isRefunded = order.refundAmount >= order.totalPrice;
      order.refundedAt = new Date();
      if (order.isRefunded) order.status = "iptal_edildi";
      await order.save();
      return res.json({ message: "İade işlemi başarılı", order });
    }

    return res
      .status(400)
      .json({ message: result.err_msg || "İade işlemi başarısız" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// @desc    Siparişin PayTR'deki güncel durumunu sorgula (callback gelmediyse yedek kontrol)
// @route   GET /api/payment/status/:orderId
const checkPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });
    if (!order.paytrMerchantOid) {
      return res
        .status(400)
        .json({ message: "Bu sipariş için PayTR sorgusu yapılamaz" });
    }

    const result = await queryPaymentStatus(order.paytrMerchantOid);

    // PayTR'de ödeme başarılı görünüyor ama bizde hâlâ "ödenmedi" ise senkronize et
    if (result.status === "success" && !order.isPaid) {
      await markOrderPaid(order._id);
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

module.exports = {
  initPaytrPayment,
  paytrCallback,
  refundOrder,
  checkPaymentStatus,
};
