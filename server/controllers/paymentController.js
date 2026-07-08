const Order = require("../models/Order");
const Product = require("../models/Product");
const { Resend } = require("resend");
const {
  generatePaytrToken,
  verifyCallbackHash,
  refundPayment,
  queryPaymentStatus,
  generateEftToken,
} = require("../utils/paytr");

const resend = new Resend(process.env.RESEND_API_KEY);

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
      return res
        .status(400)
        .json({
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
    const order = await Order.findOne({
      paytrMerchantOid: merchant_oid,
    }).populate("user", "name email");

    if (order && !order.isPaid) {
      if (status === "success") {
        order.isPaid = true;
        order.paidAt = new Date();
        order.status = "onaylandi";
        await order.save();

        // ── Ödeme onay maili (admin'e) ──
        try {
          const itemsHtml = order.orderItems
            .map(
              (item) =>
                `<tr>
              <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
              <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
              <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${(item.price * item.quantity).toFixed(2)} ₺</td>
            </tr>`,
            )
            .join("");

          await resend.emails.send({
            from: "Kovan Kırtasiye <onboarding@resend.dev>",
            to: process.env.EMAIL_USER,
            subject: `✅ Ödeme Alındı! Sipariş #${order._id.toString().slice(-6).toUpperCase()}`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px">
                <h2 style="color:#16a34a">✅ Ödeme Başarıyla Alındı</h2>
                <p><strong>Sipariş No:</strong> #${order._id.toString().slice(-6).toUpperCase()}</p>
                <p><strong>Müşteri:</strong> ${order.shippingAddress.name}</p>
                <p><strong>Telefon:</strong> ${order.shippingAddress.phone}</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                  <thead>
                    <tr style="background:#f5f5f5">
                      <th style="padding:8px;text-align:left">Ürün</th>
                      <th style="padding:8px;text-align:center">Adet</th>
                      <th style="padding:8px;text-align:right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
                <p style="font-size:18px;font-weight:bold;color:#1a2744">Tahsil Edilen Tutar: ${order.totalPrice.toFixed(2)} ₺</p>
                <a href="https://www.kovankirtasiye.com.tr/admin/orders"
                   style="display:inline-block;margin-top:16px;padding:12px 24px;background:#16a34a;color:white;text-decoration:none;border-radius:8px;font-weight:600">
                  Admin Panele Git
                </a>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error("Ödeme onay maili gönderilemedi:", emailErr.message);
        }
      } else {
        // Ödeme başarısız → stoğu geri yükle, siparişi iptal et
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
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = "onaylandi";
      await order.save();
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
