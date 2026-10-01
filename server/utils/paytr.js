const crypto = require("crypto");
const axios = require("axios");

// --------------------------------------------------
// PAYTR iFRAME TOKEN
// --------------------------------------------------
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

  const test_mode = String(process.env.PAYTR_TEST_MODE ?? "1");

  // Gerekli env kontrolü
  if (!merchant_id || !merchant_key || !merchant_salt) {
    throw new Error(
      "PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY veya PAYTR_MERCHANT_SALT eksik.",
    );
  }

  // PayTR payment_amount kuruş cinsinden ister
  const payment_amount = Math.round(Number(amount) * 100);

  if (!Number.isFinite(payment_amount) || payment_amount <= 0) {
    throw new Error("Geçersiz ödeme tutarı.");
  }

  // PayTR user_basket:
  // [["Ürün", "100.00", 2], ...]
  const basketJson = JSON.stringify(userBasket);

  const user_basket = Buffer.from(basketJson, "utf8").toString("base64");

  const no_installment = "0";
  const max_installment = "0";
  const currency = "TL";

  // PayTR resmi hash sırası
  const hashStr =
    `${merchant_id}` +
    `${userIp}` +
    `${merchantOid}` +
    `${email}` +
    `${payment_amount}` +
    `${user_basket}` +
    `${no_installment}` +
    `${max_installment}` +
    `${currency}` +
    `${test_mode}`;

  const paytr_token = crypto
    .createHmac("sha256", merchant_key)
    .update(hashStr + merchant_salt)
    .digest("base64");

  const params = new URLSearchParams();

  params.append("merchant_id", merchant_id);
  params.append("user_ip", userIp);
  params.append("merchant_oid", merchantOid);
  params.append("email", email);
  params.append("payment_amount", String(payment_amount));
  params.append("paytr_token", paytr_token);
  params.append("user_basket", user_basket);

  params.append("debug_on", "1");
  params.append("no_installment", no_installment);
  params.append("max_installment", max_installment);

  params.append("user_name", userName || "");
  params.append("user_address", userAddress || "");
  params.append("user_phone", userPhone || "");

  params.append("merchant_ok_url", `${process.env.CLIENT_URL}/odeme-basarili`);

  params.append(
    "merchant_fail_url",
    `${process.env.CLIENT_URL}/odeme-basarisiz`,
  );

  params.append("timeout_limit", "30");
  params.append("currency", currency);
  params.append("test_mode", test_mode);
  params.append("lang", "tr");

  console.log("========== PAYTR TOKEN ==========");
  console.log("merchant_id:", merchant_id);
  console.log("merchant_oid:", merchantOid);
  console.log("user_ip:", userIp);
  console.log("email:", email);
  console.log("payment_amount:", payment_amount);
  console.log("currency:", currency);
  console.log("test_mode:", test_mode);
  console.log("basket:", basketJson);
  console.log("=================================");

  try {
    const response = await axios.post(
      "https://www.paytr.com/odeme/api/get-token",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 20000,
      },
    );

    console.log("========== PAYTR RESPONSE ==========");
    console.log(response.data);
    console.log("====================================");

    return response.data;
  } catch (error) {
    console.error("========== PAYTR API ERROR ==========");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }

    console.error("=====================================");

    throw error;
  }
};

// --------------------------------------------------
// PAYTR CALLBACK HASH
// --------------------------------------------------
const verifyCallbackHash = (body) => {
  const { merchant_oid, status, total_amount, hash } = body;

  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;

  if (!merchant_salt || !merchant_key) {
    return false;
  }

  const hashStr = `${merchant_oid}${merchant_salt}${status}${total_amount}`;

  const calculatedHash = crypto
    .createHmac("sha256", merchant_key)
    .update(hashStr)
    .digest("base64");

  return calculatedHash === hash;
};

// --------------------------------------------------
// PAYTR İADE
// --------------------------------------------------
const refundPayment = async ({ merchantOid, returnAmount }) => {
  const merchant_id = process.env.PAYTR_MERCHANT_ID;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

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

  const response = await axios.post(
    "https://www.paytr.com/odeme/iade",
    params.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
};

// --------------------------------------------------
// PAYTR DURUM SORGU
// --------------------------------------------------
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
    params.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
};

// --------------------------------------------------
// İŞLEM DÖKÜMÜ
// --------------------------------------------------
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
    params.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
};

// --------------------------------------------------
// ÖDEME RAPORU
// --------------------------------------------------
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
    params.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
};

// --------------------------------------------------
// HAVALE / EFT
// --------------------------------------------------
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

  const test_mode = String(process.env.PAYTR_TEST_MODE ?? "1");

  const payment_amount = Math.round(Number(amount) * 100);
  const payment_type = "eft";

  const hashStr =
    `${merchant_id}` +
    `${userIp}` +
    `${merchantOid}` +
    `${email}` +
    `${payment_amount}` +
    `${payment_type}` +
    `${test_mode}`;

  const paytr_token = crypto
    .createHmac("sha256", merchant_key)
    .update(hashStr + merchant_salt)
    .digest("base64");

  const params = new URLSearchParams({
    merchant_id,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email,
    payment_amount: String(payment_amount),
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
    params.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 20000,
    },
  );

  return response.data;
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
