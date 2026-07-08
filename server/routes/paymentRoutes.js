const express = require("express");
const router = express.Router();
const {
  initPaytrPayment,
  paytrCallback,
  refundOrder,
  checkPaymentStatus,
} = require("../controllers/paymentController");
const {
  getTransactionReport,
  getStatementReport,
} = require("../controllers/paymentReportController");
const { protect, admin } = require("../middleware/authMiddleware");

// Ödeme başlatma (kart veya EFT) — kullanıcı
router.post("/init", protect, initPaytrPayment);

// PayTR webhook — PUBLIC, protect YOK
router.post("/callback", paytrCallback);

// Admin işlemleri
router.post("/refund", protect, admin, refundOrder);
router.get("/status/:orderId", protect, admin, checkPaymentStatus);
router.get("/report/transactions", protect, admin, getTransactionReport);
router.get("/report/statement", protect, admin, getStatementReport);

module.exports = router;
