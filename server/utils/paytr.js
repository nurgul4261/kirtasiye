const crypto = require("crypto");
const axios = require("axios");

// Sipariş ödemesi için PayTR'den iframe token'ı ister
const generatePaytrToken = async ({
  merchantOid,
  userIp,
  email,
  amount,
  userBasket,
  userName,
  userAddress,
  userPhone,
}) => {
  const merchant_id = process.env.PAYTR_MERCHANT_ID;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;
  const test_mode = process.env.PAYTR_TEST_MODE || "1";

  const payment_amount = Math.round(amount * 100); // kuruş cinsinden
  const user_basket = Buffer.from(JSON.stringify(userBasket)).toString(
    "base64",
  );
  const no_installment = "0";
  const max_installment = "0";
  const currency = "TL";

  const hashStr = `${merchant_id}${userIp}${merchantOid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
  const paytr_token = crypto
    .createHmac("sha256", merchant_key)
    .update(hashStr + merchant_salt)
    .digest("base64");

  const params = new URLSearchParams({
    merchant_id,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email,
    payment_amount,
    paytr_token,
    user_basket,
    debug_on: "1",
    no_installment,
    max_installment,
    user_name: userName,
    user_address: userAddress,
    user_phone: userPhone,
    merchant_ok_url: `${process.env.CLIENT_URL}/odeme-basarili`,
    merchant_fail_url: `${process.env.CLIENT_URL}/odeme-basarisiz`,
    timeout_limit: "30",
    currency,
    test_mode,
  });

  const response = await axios.post(
    "https://www.paytr.com/odeme/api/get-token",
    params,
  );
  return response.data; // { status: 'success', token } veya { status: 'failed', reason }
};

// PayTR'nin callback (webhook) isteğindeki hash'i doğrular
const verifyCallbackHash = (body) => {
  const { merchant_oid, status, total_amount, hash } = body;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;

  const hashStr = `${merchant_oid}${merchant_salt}${status}${total_amount}`;
  const calculatedHash = crypto
    .createHmac("sha256", merchant_key)
    .update(hashStr)
    .digest("base64");

  return calculatedHash === hash;
};

// ── İADE API ──
// Sipariş için kısmi veya tam iade işlemi başlatır
// https://dev.paytr.com/en/iade-api
const refundPayment = async ({ merchantOid, returnAmount }) => {
  const merchant_id = process.env.PAYTR_MERCHANT_ID;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

  // returnAmount TL cinsinden ondalıklı gönderilir (örn. "11.90")
  const return_amount = Number(returnAmount).toFixed(2);

  const hashStr = `${merchant_id}${merchantOid}${return_amount}${merchant_salt}`;
  const paytr_token = crypto
    .createHmac("sha256", merchant_key)
    .update(hashStr)
    .digest("base64");

  const params = new URLSearchParams({
    merchant_id,
    merchant_oid: merchantOid,
    return_amount,
    paytr_token,
  });

  const response = await axios.post("https://www.paytr.com/odeme/iade", params);
  return response.data; // { status: 'success', ... } veya { status: 'error', err_no, err_msg }
};

// ── DURUM SORGU API ──
// Bir siparişin PayTR üzerindeki güncel ödeme durumunu sorgular (callback'e yedek doğrulama)
// https://dev.paytr.com/en/durum-sorgu
const queryPaymentStatus = async (merchantOid) => {
  const merchant_id = process.env.PAYTR_MERCHANT_ID;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

  const hashStr = `${merchant_id}${merchantOid}${merchant_salt}`;
  const paytr_token = crypto
    .createHmac("sha256", merchant_key)
    .update(hashStr)
    .digest("base64");

  const params = new URLSearchParams({
    merchant_id,
    merchant_oid: merchantOid,
    paytr_token,
  });

  const response = await axios.post(
    "https://www.paytr.com/odeme/durum-sorgu",
    params,
  );
  return response.data; // { status: 'success', payment_amount, payment_total, returns, ... }
};

// ── İŞLEM DÖKÜMÜ API ──
// Belirtilen tarih aralığındaki (en fazla 3 gün) satış/iade işlemlerinin dökümü
// https://dev.paytr.com/en/islem-dokumu
// startDate/endDate formatı: "YYYY-MM-DD HH:mm:ss"
const getTransactionDetail = async (startDate, endDate) => {
  const merchant_id = process.env.PAYTR_MERCHANT_ID;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

  const hashStr = `${merchant_id}${startDate}${endDate}${merchant_salt}`;
  const paytr_token = crypto
    .createHmac("sha256", merchant_key)
    .update(hashStr)
    .digest("base64");

  const params = new URLSearchParams({
    merchant_id,
    start_date: startDate,
    end_date: endDate,
    paytr_token,
  });

  const response = await axios.post(
    "https://www.paytr.com/rapor/islem-dokumu",
    params,
  );
  return response.data; // { status: 'success' | 'failed' | 'error', ... }
};

// ── ÖDEME RAPOR (ÖZET) API ──
// Hesabınıza yatırılan/yatırılacak tutarların özetini verir
// https://dev.paytr.com/en/odeme-rapor-servisi/odeme-ozeti
// startDate/endDate formatı: "YYYY-MM-DD"
const getPaymentStatement = async (startDate, endDate) => {
  const merchant_id = process.env.PAYTR_MERCHANT_ID;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

  const hashStr = `${merchant_id}${startDate}${endDate}${merchant_salt}`;
  const paytr_token = crypto
    .createHmac("sha256", merchant_key)
    .update(hashStr)
    .digest("base64");

  const params = new URLSearchParams({
    merchant_id,
    start_date: startDate,
    end_date: endDate,
    paytr_token,
  });

  const response = await axios.post(
    "https://www.paytr.com/rapor/odeme-dokumu",
    params,
  );
  return response.data; // { status: 'success' | 'failed' | 'error', ... }
};

// ── HAVALE/EFT iFRAME API ──
// Kredi kartı yerine banka havalesi/EFT ile ödeme almak için token oluşturur
// ÖNEMLİ: Bu özelliği kullanabilmek için önce PayTR Mağaza Paneli > Destek & Kurulum
// üzerinden PayTR'den Havale/EFT yetkisi talep etmeniz gerekir.
// https://dev.paytr.com/en/havale-eft-iframe-api
const generateEftToken = async ({
  merchantOid,
  userIp,
  email,
  amount,
  userName,
  userPhone,
}) => {
  const merchant_id = process.env.PAYTR_MERCHANT_ID;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;
  const test_mode = process.env.PAYTR_TEST_MODE || "1";

  const payment_amount = Math.round(amount * 100); // kuruş cinsinden
  const payment_type = "eft";

  const hashStr = `${merchant_id}${userIp}${merchantOid}${email}${payment_amount}${payment_type}${test_mode}`;
  const paytr_token = crypto
    .createHmac("sha256", merchant_key)
    .update(hashStr + merchant_salt)
    .digest("base64");

  const params = new URLSearchParams({
    merchant_id,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email,
    payment_amount,
    payment_type,
    paytr_token,
    user_name: userName || "",
    user_phone: userPhone || "",
    debug_on: "1",
    timeout_limit: "30",
    test_mode,
  });

  const response = await axios.post(
    "https://www.paytr.com/odeme/api/get-token",
    params,
  );
  return response.data; // { status: 'success', token } veya { status: 'failed', reason }
};

module.exports = {
  generatePaytrToken,
  verifyCallbackHash,
  refundPayment,
  queryPaymentStatus,
  getTransactionDetail,
  getPaymentStatement,
  generateEftToken,
};
