const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    image: { type: String },
    images: [{ type: String }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: { type: String },
    stock: { type: Number, required: true, default: 0 },
    barcode: { type: String, unique: true, sparse: true, trim: true },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Barkod girilmemişse, kayıt öncesi otomatik benzersiz bir barkod üret.
// Format: TASTOZU-000001 (en az 13 karakter, sadece harf/rakam/tire — pazaryeri kurallarına uygun)
productSchema.pre("save", async function (next) {
  if (this.barcode) return next();

  const Product = this.constructor;
  const prefix = "TASTOZU";
  let candidate;
  let exists = true;

  while (exists) {
    const count = await Product.countDocuments();
    const number = String(count + 1).padStart(6, "0");
    candidate = `${prefix}-${number}`;
    exists = await Product.findOne({ barcode: candidate });
    if (exists) {
      // Çok nadir bir çakışma durumunda rastgele bir ek ile tekrar dene
      candidate = `${prefix}-${number}-${Math.floor(Math.random() * 900 + 100)}`;
      exists = await Product.findOne({ barcode: candidate });
    }
  }

  this.barcode = candidate;
  next();
});

module.exports = mongoose.model("Product", productSchema);
