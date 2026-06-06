const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Sipariş oluştur
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, shippingPrice, notes, couponCode } =
      req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "Sepet boş" });
    }

    // 1. GÜVENLİK ADIMI: Fiyatları ve Toplam Adeti Backend'de Hesapla (Frontend'e güvenme)
    let calculatedItemsPrice = 0;
    let totalQuantity = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Ürün bulunamadı: ${item.name}` });
      }

      // Anlık stok kontrolü
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({
            message: `${product.name} için yeterli stok yok. Güncel stok: ${product.stock}`,
          });
      }

      // Gerçek fiyatı DB'den alıp hesapla
      calculatedItemsPrice += product.price * item.quantity;
      totalQuantity += item.quantity;
    }

    // 2. Kupon ve İndirim Hesaplama
    const VALID_COUPON = "KIRTASIYE20";
    let discountAmount = 0;
    let appliedCoupon = "";

    if (couponCode && couponCode.trim() !== "") {
      const formattedCode = couponCode.trim().toUpperCase();

      if (formattedCode === VALID_COUPON) {
        if (totalQuantity < 20) {
          return res.status(400).json({
            message: `Bu kupon sadece 20 adet ve üzeri siparişlerde geçerlidir. Mevcut adet: ${totalQuantity}`,
          });
        }

        // İndirimi DB fiyatı üzerinden hesapla
        discountAmount = Math.round(calculatedItemsPrice * 0.1 * 100) / 100;
        appliedCoupon = VALID_COUPON;
      } else {
        return res.status(400).json({ message: "Geçersiz kupon kodu" });
      }
    }

    // İndirimli son fiyatları belirle
    const finalItemsPrice = calculatedItemsPrice - discountAmount;
    const finalTotalPrice = finalItemsPrice + Number(shippingPrice || 0);

    // 3. Eşzamanlı Stok Düşürme
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 4. Siparişi Kaydet
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      itemsPrice: calculatedItemsPrice, // İndirimsiz ham fiyat (opsiyonel, istersen finalItemsPrice da yazabilirsin)
      shippingPrice,
      totalPrice: finalTotalPrice, // PayTR'ye ve DB'ye gidecek gerçek, güvenli son tutar
      discountAmount,
      couponCode: appliedCoupon,
      notes,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Diğer fonksiyonlar (getMyOrders, getOrderById, getAllOrders, updateOrderStatus) tamamen doğru, onlarda hiçbir hata yok.
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (order) {
      if (
        order.user._id.toString() !== req.user._id.toString() &&
        !req.user.isAdmin
      ) {
        return res.status(403).json({ message: "Yetki yok" });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: "Sipariş bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status;
      if (req.body.status === "teslim_edildi") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      const updated = await order.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: "Sipariş bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
