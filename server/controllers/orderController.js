const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Sipariş oluştur
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, itemsPrice, shippingPrice, totalPrice, notes } = req.body;
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'Sepet boş' });
    }
    // Stok kontrolü
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Ürün bulunamadı: ${item.name}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `${product.name} için yeterli stok yok` });
      }
    }
    // Stok düşür
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      totalPrice,
      notes,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Kullanıcının siparişleri
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sipariş detayı
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Yetki yok' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tüm siparişler (Admin)
// @route   GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sipariş durumu güncelle (Admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status;
      if (req.body.status === 'teslim_edildi') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      const updated = await order.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
