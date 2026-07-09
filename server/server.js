const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// 1. CORS Yapılandırmasını Güçlendirdik
app.use(
  cors({
    origin: [
      "https://kovankirtasiye.com.tr",
      "https://www.kovankirtasiye.com.tr",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// 2. Tarayıcıların gönderdiği OPTIONS (Preflight) isteklerini rotalara girmeden en üstte yanıtla
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // PayTR bildirimi form-data (x-www-form-urlencoded) olarak gelir
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/upsell", require("./routes/upsellRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes")); // ← PayTR

app.get("/", (req, res) => res.send("Kırtasiye API çalışıyor"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
