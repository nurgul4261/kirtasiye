const Order = require("../models/Order");
const Product = require("../models/Product");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// @desc    Sipariş oluştur
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, shippingPrice, notes, couponCode } =
      req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "Sepet boş" });
    }

    let calculatedItemsPrice = 0;
    let totalQuantity = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Ürün bulunamadı: ${item.name}` });
      }
      // ✅ Stok sayısı mesajdan kaldırıldı
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `"${product.name}" için yeterli stok bulunmamaktadır.`,
        });
      }
      calculatedItemsPrice += product.price * item.quantity;
      totalQuantity += item.quantity;
    }

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
        discountAmount = Math.round(calculatedItemsPrice * 0.1 * 100) / 100;
        appliedCoupon = VALID_COUPON;
      } else {
        return res.status(400).json({ message: "Geçersiz kupon kodu" });
      }
    }

    const finalItemsPrice = calculatedItemsPrice - discountAmount;
    const finalTotalPrice = finalItemsPrice + Number(shippingPrice || 0);

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      itemsPrice: calculatedItemsPrice,
      shippingPrice,
      totalPrice: finalTotalPrice,
      discountAmount,
      couponCode: appliedCoupon,
      notes,
    });

    // ── Admin email bildirimi ──
    try {
      const itemsHtml = orderItems
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
        from: "Kovan Kırtasiye <bilgi@kovankirtasiye.com.tr>",
        to: process.env.EMAIL_USER,
        subject: `🛒 Yeni Sipariş! #${order._id.toString().slice(-6).toUpperCase()}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px">
            <h2 style="color:#1a2744">🛒 Yeni Sipariş Geldi!</h2>
            <p><strong>Sipariş No:</strong> #${order._id.toString().slice(-6).toUpperCase()}</p>
            <p><strong>Müşteri:</strong> ${shippingAddress.name}</p>
            <p><strong>Telefon:</strong> ${shippingAddress.phone}</p>
            <p><strong>Adres:</strong> ${shippingAddress.street}, ${shippingAddress.district} / ${shippingAddress.city}</p>
            ${notes ? `<p><strong>Not:</strong> ${notes}</p>` : ""}
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
            ${discountAmount > 0 ? `<p style="color:#16a34a"><strong>İndirim:</strong> -${discountAmount.toFixed(2)} ₺</p>` : ""}
            <p><strong>Kargo:</strong> ${shippingPrice === 0 ? "Ücretsiz" : `${shippingPrice} ₺`}</p>
            <p style="font-size:18px;font-weight:bold;color:#1a2744">Toplam: ${finalTotalPrice.toFixed(2)} ₺</p>
            <a href="https://www.kovankirtasiye.com.tr/admin/orders" 
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a2744;color:white;text-decoration:none;border-radius:8px;font-weight:600">
              Admin Panele Git
            </a>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Bildirim emaili gönderilemedi:", emailErr.message);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

// Durum değişince müşteriye gönderilecek mail içerikleri
const STATUS_EMAIL_CONTENT = {
  onaylandi: {
    subject: "✅ Siparişiniz Onaylandı",
    title: "Siparişiniz Onaylandı!",
    color: "#2563eb",
    message:
      "Siparişiniz onaylandı ve hazırlanmaya başlandı. Kargoya verildiğinde tekrar bilgilendirileceksiniz.",
  },
  kargoda: {
    subject: "🚚 Siparişiniz Kargoya Verildi",
    title: "Siparişiniz Yola Çıktı!",
    color: "#f59e0b",
    message:
      "Siparişiniz kargoya teslim edildi ve size doğru yola çıktı. En kısa sürede elinize ulaşacak.",
  },
  teslim_edildi: {
    subject: "📦 Siparişiniz Teslim Edildi",
    title: "Siparişiniz Teslim Edildi!",
    color: "#16a34a",
    message:
      "Siparişiniz teslim edildi. Bizi tercih ettiğiniz için teşekkür ederiz! Ürünlerimizle ilgili görüşlerinizi bizimle paylaşmaktan çekinmeyin.",
  },
};

// Müşteriye durum güncelleme maili gönderir (varsa)
const sendStatusEmailToCustomer = async (order, status) => {
  const content = STATUS_EMAIL_CONTENT[status];
  if (!content || !order.user?.email) return;

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
    from: "Kovan Kırtasiye <bilgi@kovankirtasiye.com.tr>",
    to: order.user.email,
    subject: `${content.subject} — Sipariş #${order._id.toString().slice(-6).toUpperCase()}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px">
        <h2 style="color:${content.color}">${content.title}</h2>
        <p><strong>Sipariş No:</strong> #${order._id.toString().slice(-6).toUpperCase()}</p>
        <p style="color:#444;line-height:1.6">${content.message}</p>
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
        <p style="font-size:16px;font-weight:bold;color:#1a2744">Toplam: ${order.totalPrice.toFixed(2)} ₺</p>
        <a href="https://www.kovankirtasiye.com.tr/profile"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1a2744;color:white;text-decoration:none;border-radius:8px;font-weight:600">
          Siparişimi Görüntüle
        </a>
      </div>
    `,
  });
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (order) {
      const newStatus = req.body.status;
      const statusChanged = order.status !== newStatus;

      order.status = newStatus;
      if (newStatus === "teslim_edildi") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      const updated = await order.save();

      // Durum gerçekten değiştiyse müşteriye mail gönder
      if (statusChanged) {
        try {
          await sendStatusEmailToCustomer(order, newStatus);
        } catch (emailErr) {
          console.error(
            "Müşteriye durum bildirimi maili gönderilemedi:",
            emailErr.message,
          );
        }
      }

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
