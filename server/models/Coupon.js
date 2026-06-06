const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercent: { type: Number, required: true }, // örn. 10
    minQuantity: { type: Number, default: 20 }, // minimum ürün adedi
    expiresAt: { type: Date }, // opsiyonel son kullanma tarihi
    usageLimit: { type: Number, default: null }, // null = sınırsız
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Coupon", couponSchema);
