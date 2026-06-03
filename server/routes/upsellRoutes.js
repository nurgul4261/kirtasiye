const express = require("express");
const Upsell = require("../models/Upsell");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin: bir ürüne bağlı upsell'leri getir
router.get("/admin/:productId", protect, admin, async (req, res) => {
  try {
    const upsells = await Upsell.find({ mainProduct: req.params.productId })
      .populate("suggestedProduct", "name price image")
      .sort("sortOrder");
    res.json(upsells);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Admin: upsell ekle
router.post("/admin", protect, admin, async (req, res) => {
  const { main_product_id, suggested_product_id, sort_order = 0 } = req.body;
  if (!main_product_id || !suggested_product_id)
    return res.status(400).json({ message: "Eksik alan" });

  try {
    const exists = await Upsell.findOne({
      mainProduct: main_product_id,
      suggestedProduct: suggested_product_id,
    });
    if (exists) return res.status(409).json({ message: "Bu öneri zaten ekli" });

    await Upsell.create({
      mainProduct: main_product_id,
      suggestedProduct: suggested_product_id,
      sortOrder: sort_order,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Eklenemedi" });
  }
});

// Admin: upsell sil
router.delete("/admin/:id", protect, admin, async (req, res) => {
  try {
    await Upsell.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Silinemedi" });
  }
});

// Sepet: önerileri getir (public)
router.post("/cart", async (req, res) => {
  const { product_ids } = req.body;
  if (!product_ids?.length) return res.json([]);

  try {
    const upsells = await Upsell.find({ mainProduct: { $in: product_ids } })
      .populate("suggestedProduct", "name price image")
      .sort("sortOrder");

    const seen = new Set();
    const result = [];
    for (const u of upsells) {
      const p = u.suggestedProduct;
      if (!p) continue;
      const idStr = p._id.toString();
      if (product_ids.includes(idStr)) continue;
      if (seen.has(idStr)) continue;
      seen.add(idStr);
      result.push({ id: idStr, name: p.name, price: p.price, image: p.image });
    }

    res.json(result.slice(0, 6));
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
