const express = require("express");
const Coupon = require("../models/Coupon");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin: tüm kuponları getir
router.get("/", protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Admin: kupon oluştur
router.post("/", protect, admin, async (req, res) => {
  const { code, discountPercent, minQuantity, expiresAt, usageLimit } =
    req.body;
  if (!code || !discountPercent)
    return res.status(400).json({ message: "Kod ve indirim oranı zorunlu" });
  try {
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercent,
      minQuantity: minQuantity || 20,
      expiresAt: expiresAt || null,
      usageLimit: usageLimit || null,
    });
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "Bu kupon kodu zaten var" });
    res.status(500).json({ message: "Oluşturulamadı" });
  }
});

// Admin: kupon sil
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Silinemedi" });
  }
});

// Admin: kupon aktif/pasif toggle
router.patch("/:id/toggle", protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Bulunamadı" });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: "Güncellenemedi" });
  }
});

// Müşteri: kupon doğrula
router.post("/validate", async (req, res) => {
  const { code, cartItems } = req.body;
  if (!code) return res.status(400).json({ message: "Kupon kodu gerekli" });

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon || !coupon.isActive)
      return res.status(404).json({ message: "Geçersiz kupon kodu" });

    if (coupon.expiresAt && new Date() > coupon.expiresAt)
      return res.status(400).json({ message: "Kuponun süresi dolmuş" });

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit)
      return res
        .status(400)
        .json({ message: "Kupon kullanım limitine ulaşmış" });

    const qualifies = cartItems.some(
      (item) => item.quantity >= coupon.minQuantity,
    );

    if (!qualifies)
      return res.status(400).json({
        message: `Bu kupon tek bir üründen en az ${coupon.minQuantity} adet alımda geçerlidir`,
      });

    res.json({
      valid: true,
      discountPercent: coupon.discountPercent,
      message: `%${coupon.discountPercent} indirim uygulandı!`,
    });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
