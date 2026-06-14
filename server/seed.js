const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/Category");

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB bağlandı");

    // Hobi ana kategorisini bul veya oluştur
    let hobi = await Category.findOne({ slug: "hobi" });
    if (!hobi) {
      hobi = await Category.create({
        name: "Hobi",
        slug: "hobi",
        description: "Hobi kitleri ve boyama setleri",
        order: 3,
      });
      console.log("✅ Hobi ana kategorisi oluşturuldu");
    } else {
      console.log("⏭️  Hobi zaten var");
    }

    // Alt kategoriler
    const altKategoriler = [
      {
        name: "Çim Adam",
        slug: "cim-adam",
        description: "Çim adam ve toprak oyuncak setleri",
        order: 1,
      },
      {
        name: "Taş Tozu Boyama",
        slug: "tas-tozu-boyama",
        description: "Taş tozu boyama kitleri ve setleri",
        order: 2,
      },
      {
        name: "Çocuk Tuval Boyama",
        slug: "cocuk-tuval-boyama",
        description: "Çocuklar için tuval boyama kitleri",
        order: 3,
      },
      {
        name: "Sayılarla Tuval Boyama",
        slug: "sayilarla-tuval-boyama",
        description: "Sayılarla tuval boyama setleri",
        order: 4,
      },
      {
        name: "Çocuk Ahşap Boyama",
        slug: "cocuk-ahsap-boyama",
        description: "Çocuklar için ahşap boyama kitleri",
        order: 5,
      },
    ];

    for (const kat of altKategoriler) {
      const varMi = await Category.findOne({ slug: kat.slug });
      if (varMi) {
        // Varsa parent'ını güncelle
        await Category.findByIdAndUpdate(varMi._id, { parent: hobi._id });
        console.log(`🔄 Güncellendi (parent eklendi): ${kat.name}`);
      } else {
        await Category.create({ ...kat, parent: hobi._id });
        console.log(`✅ Eklendi: ${kat.name}`);
      }
    }

    console.log("\n✅ Tamamlandı! Mevcut ürünler korundu.");
    process.exit(0);
  } catch (error) {
    console.error("Hata:", error);
    process.exit(1);
  }
};

seedDB();
