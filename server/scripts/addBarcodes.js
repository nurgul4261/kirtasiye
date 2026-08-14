// Tek seferlik script: barkodu olmayan mevcut ürünlere otomatik,
// benzersiz barkod atar (TASTOZU-000001, TASTOZU-000002, ...).
//
// Çalıştırma: backend klasöründe  ->  node scripts/addBarcodes.js
// (dotenv ve MONGO_URI kendi backend yapına göre ayarlıdır; farklıysa
// aşağıdaki require('dotenv').config() ve process.env.MONGO_URI satırlarını
// kendi bağlantı dosyandaki isimlerle değiştir.)

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Veritabanına bağlanıldı.");

  const missing = await Product.find({
    $or: [{ barcode: { $exists: false } }, { barcode: null }, { barcode: "" }],
  }).sort({ createdAt: 1 });

  console.log(`${missing.length} ürün barkodsuz, atama yapılıyor...`);

  // Barkodu zaten olan ürün sayısından devam et ki numaralar çakışmasın
  let counter = await Product.countDocuments({
    barcode: { $exists: true, $nin: [null, ""] },
  });

  for (const p of missing) {
    counter += 1;
    const code = `TASTOZU-${String(counter).padStart(6, "0")}`;
    // updateOne kullanıyoruz ki pre-save hook'u tekrar tetiklenmesin
    await Product.updateOne({ _id: p._id }, { $set: { barcode: code } });
    console.log(`${p.name}  ->  ${code}`);
  }

  console.log("Tamamlandı.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
