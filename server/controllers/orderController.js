const Order = require("../models/Order");
const Product = require("../models/Product");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const MAIL_FROM = "Kovan Kırtasiye <bilgi@kovankirtasiye.com.tr>";

// Kargo ücreti ve ücretsiz kargo eşiği sunucu tarafında sabitlenir — client'tan gelen değere güvenilmez
const SHIPPING_PRICE = 100;
const FREE_SHIPPING_THRESHOLD = 2000;

// ── Yardımcılar ──

// Kullanıcıdan gelen metinleri HTML'e basmadan önce temizler
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const orderNoOf = (order) => order._id.toString().slice(-6).toUpperCase();

const buildItemsHtml = (items) =>
  items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${escapeHtml(item.quantity)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${(item.price * item.quantity).toFixed(2)} ₺</td>
        </tr>`,
    )
    .join("");

const itemsTableHtml = (items) => `
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <thead>
      <tr style="background:#f5f5f5">
        <th style="padding:8px;text-align:left">Ürün</th>
        <th style="padding:8px;text-align:center">Adet</th>
        <th style="padding:8px;text-align:right">Tutar</th>
      </tr>
    </thead>
    <tbody>${buildItemsHtml(items)}</tbody>
  </table>`;

// @desc    Sipariş oluştur
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, notes, couponCode, invoiceInfo } =
      req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "Sepet boş" });
    }

    // ── Fatura bilgileri (opsiyonel) doğrulama ──
    const tcKimlikNo = String(invoiceInfo?.tcKimlikNo || "").trim();
    const vergiNo = String(invoiceInfo?.vergiNo || "").trim();
    const vergiDairesi = String(invoiceInfo?.vergiDairesi || "").trim();

    if (tcKimlikNo && !/^[1-9]\d{10}$/.test(tcKimlikNo)) {
      return res
        .status(400)
        .json({ message: "TC kimlik numarası 11 haneli olmalıdır" });
    }
    if (vergiNo && !/^\d{10}$/.test(vergiNo)) {
      return res
        .status(400)
        .json({ message: "Vergi numarası 10 haneli olmalıdır" });
    }

    // ── Fatura adresi ──
    // Aynıysa teslimat adresinin kopyası saklanır, farklıysa gönderilen adres kullanılır
    const sameAsShipping = invoiceInfo?.sameAsShipping !== false;
    const rawAddr = sameAsShipping
      ? shippingAddress
      : invoiceInfo?.address || {};
    const invoiceAddress = {
      street: String(rawAddr?.street || "").trim(),
      city: String(rawAddr?.city || "").trim(),
      district: String(rawAddr?.district || "").trim(),
      zipCode: String(rawAddr?.zipCode || "").trim(),
    };

    if (
      !sameAsShipping &&
      (!invoiceAddress.street ||
        !invoiceAddress.city ||
        !invoiceAddress.district)
    ) {
      return res.status(400).json({
        message: "Fatura adresi için adres, il ve ilçe zorunludur",
      });
    }

    // ── Ürünleri doğrula; ad ve fiyatı sunucudaki Product kaydından al ──
    let calculatedItemsPrice = 0;
    let totalQuantity = 0;
    const verifiedItems = [];

    for (const item of orderItems) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Geçersiz ürün adedi" });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Ürün bulunamadı: ${item.name}` });
      }
      if (product.stock < quantity) {
        return res.status(400).json({
          message: `"${product.name}" için yeterli stok bulunmamaktadır.`,
        });
      }

      calculatedItemsPrice += product.price * quantity;
      totalQuantity += quantity;

      // Ürün, ad, fiyat ve adet sunucu değerlerinden gelir; görsel de üründen alınır
      verifiedItems.push({
        product: product._id,
        name: product.name,
        image: item.image || product.image,
        price: product.price,
        quantity,
      });
    }

    const shippingPrice =
      calculatedItemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;

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
    const finalTotalPrice = finalItemsPrice + shippingPrice;

    // ── Siparişi oluştur (stok, sipariş başarılı olduktan sonra düşülür) ──
    const order = await Order.create({
      user: req.user._id,
      orderItems: verifiedItems,
      shippingAddress,
      invoiceInfo: {
        tcKimlikNo,
        vergiNo,
        vergiDairesi,
        sameAsShipping,
        address: invoiceAddress,
      },
      itemsPrice: calculatedItemsPrice,
      shippingPrice,
      totalPrice: finalTotalPrice,
      discountAmount,
      couponCode: appliedCoupon,
      notes,
    });

    for (const item of verifiedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    const orderNo = orderNoOf(order);

    // ── Admin email bildirimi ──
    // Not: TC kimlik no gizlilik gereği e-postaya eklenmez, admin panelinden görülür.
    try {
      const invoiceAddressHtml = sameAsShipping
        ? `<p><strong>Fatura Adresi:</strong> Teslimat adresi ile aynı</p>`
        : `<p><strong>Fatura Adresi:</strong> ${escapeHtml(invoiceAddress.street)}, ${escapeHtml(invoiceAddress.district)} / ${escapeHtml(invoiceAddress.city)}</p>`;

      const invoiceHtml =
        vergiNo || vergiDairesi
          ? `<p><strong>Fatura:</strong> Vergi No: ${escapeHtml(vergiNo || "-")} / Vergi Dairesi: ${escapeHtml(vergiDairesi || "-")}</p>`
          : tcKimlikNo
            ? `<p><strong>Fatura:</strong> Bireysel (TC bilgisi admin panelinde)</p>`
            : "";

      await resend.emails.send({
        from: MAIL_FROM,
        to: process.env.EMAIL_USER,
        subject: `🛒 Yeni Sipariş! #${orderNo}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px">
            <h2 style="color:#1a2744">🛒 Yeni Sipariş Geldi!</h2>
            <p><strong>Sipariş No:</strong> #${orderNo}</p>
            <p><strong>Müşteri:</strong> ${escapeHtml(shippingAddress?.name)}</p>
            <p><strong>Telefon:</strong> ${escapeHtml(shippingAddress?.phone)}</p>
            <p><strong>Adres:</strong> ${escapeHtml(shippingAddress?.street)}, ${escapeHtml(shippingAddress?.district)} / ${escapeHtml(shippingAddress?.city)}</p>
            ${invoiceHtml}
            ${invoiceAddressHtml}
            ${notes ? `<p><strong>Not:</strong> ${escapeHtml(notes)}</p>` : ""}
            ${itemsTableHtml(verifiedItems)}
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

    // Not: Müşteriye "Siparişiniz alındı" maili ödeme onaylanınca (paymentController) gönderilir.

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

  const orderNo = orderNoOf(order);

  await resend.emails.send({
    from: MAIL_FROM,
    to: order.user.email,
    subject: `${content.subject} — Sipariş #${orderNo}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px">
        <h2 style="color:${content.color}">${content.title}</h2>
        <p><strong>Sipariş No:</strong> #${orderNo}</p>
        <p style="color:#444;line-height:1.6">${content.message}</p>
        ${itemsTableHtml(order.orderItems)}
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
