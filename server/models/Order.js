const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      zipCode: { type: String },
    },
    // ── Fatura bilgileri (opsiyonel) ──
    // Sipariş anındaki değer saklanır; kullanıcı sonradan profilini değiştirse bile fatura bilgisi korunur.
    invoiceInfo: {
      tcKimlikNo: { type: String, default: "" },
      vergiNo: { type: String, default: "" },
      vergiDairesi: { type: String, default: "" },
      // Fatura adresi teslimat adresi ile aynı mı?
      sameAsShipping: { type: Boolean, default: true },
      // Her durumda dolu saklanır (aynıysa teslimat adresinin kopyası)
      address: {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        district: { type: String, default: "" },
        zipCode: { type: String, default: "" },
      },
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: [
        "beklemede",
        "onaylandi",
        "kargoda",
        "teslim_edildi",
        "iptal_edildi",
      ],
      default: "beklemede",
    },
    // ── Ödeme bilgileri (PayTR) ──
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentMethod: { type: String, default: "paytr" },
    paytrMerchantOid: { type: String },
    isRefunded: { type: Boolean, default: false },
    refundAmount: { type: Number, default: 0 },
    refundedAt: { type: Date },
    // ─────────────────────────────
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
