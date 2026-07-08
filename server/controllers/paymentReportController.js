const { getTransactionDetail, getPaymentStatement } = require("../utils/paytr");

// @desc    Belirtilen tarih aralığındaki (en fazla 3 gün) satış/iade işlem dökümü
// @route   GET /api/payment/report/transactions?start_date=YYYY-MM-DD HH:mm:ss&end_date=YYYY-MM-DD HH:mm:ss
const getTransactionReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ message: "start_date ve end_date zorunludur" });
    }

    const result = await getTransactionDetail(start_date, end_date);

    if (result.status === "failed") {
      return res.json({
        message: "Bu tarih aralığında işlem bulunamadı",
        transactions: [],
      });
    }
    if (result.status === "error") {
      return res.status(400).json({ message: result.err_msg });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// @desc    Hesaba yatırılan/yatırılacak tutarların özeti
// @route   GET /api/payment/report/statement?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
const getStatementReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ message: "start_date ve end_date zorunludur" });
    }

    const result = await getPaymentStatement(start_date, end_date);

    if (result.status === "failed") {
      return res.json({
        message: "Bu tarih aralığında ödeme özeti bulunamadı",
        statement: [],
      });
    }
    if (result.status === "error") {
      return res.status(400).json({ message: result.err_msg });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

module.exports = { getTransactionReport, getStatementReport };
