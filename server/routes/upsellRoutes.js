const express = require("express");
const mongoose = require("mongoose");
const Upsell = require("../models/Upsell");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin route'ları aynı kalıyor
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

router.delete("/admin/:id", protect, admin, async (req, res) => {
  try {
    await Upsell.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Silinemedi" });
  }
});

// ── Akıllı hibrit öneri ──
router.post("/cart", async (req, res) => {
  const { product_ids } = req.body;
  if (!product_ids?.length) return res.json([]);

  const objectIds = product_ids.map((id) => new mongoose.Types.ObjectId(id));
  const excluded = new Set(product_ids.map(String));
  const result = [];

  try {
    // ── 1. Birlikte satın alınanlar ──
    // Sepetteki ürünlerden en az birini içeren siparişleri bul
    const orders = await Order.find({
      "orderItems.product": { $in: objectIds },
    })
      .select("orderItems.product")
      .lean();

    // Birlikte kaç kez sipariş edildiğini say
    const coScore = {};
    for (const order of orders) {
      const ids = order.orderItems.map((i) => String(i.product));
      for (const id of ids) {
        if (!excluded.has(id)) {
          coScore[id] = (coScore[id] || 0) + 1;
        }
      }
    }

    // En çok birlikte sipariş edilenleri sırala
    const topCo = Object.entries(coScore)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => id);

    if (topCo.length) {
      const coProducts = await Product.find({
        _id: { $in: topCo },
        isActive: true,
      })
        .select("name price image")
        .lean();

      for (const p of coProducts) {
        excluded.add(String(p._id));
        result.push({
          id: String(p._id),
          name: p.name,
          price: p.price,
          image: p.image,
        });
      }
    }

    // ── 2. Aynı kategoriden tamamla (6'ya kadar) ──
    if (result.length < 6) {
      const cartProducts = await Product.find({
        _id: { $in: objectIds },
      })
        .select("category")
        .lean();

      const categoryIds = [
        ...new Set(cartProducts.map((p) => String(p.category))),
      ];

      const categoryProducts = await Product.find({
        category: { $in: categoryIds },
        _id: {
          $nin: [...excluded].map((id) => new mongoose.Types.ObjectId(id)),
        },
        isActive: true,
      })
        .select("name price image")
        .limit(6 - result.length)
        .lean();

      for (const p of categoryProducts) {
        result.push({
          id: String(p._id),
          name: p.name,
          price: p.price,
          image: p.image,
        });
      }
    }

    res.json(result.slice(0, 6));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
