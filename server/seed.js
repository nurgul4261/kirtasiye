const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/Category");
const Product = require("./models/Product");

dotenv.config();

const categories = [
  {
    name: "Defter",
    slug: "defter",
    description: "Not defterleri, ajandalar ve planlayıcılar",
  },
  {
    name: "Kalem",
    slug: "kalem",
    description: "Boyalar, eskiz kalemleri ve yazı araçları",
  },
  {
    name: "Kutu Oyunları",
    slug: "kutu-oyunlari",
    description: "Strateji, akıl ve zeka oyunları",
  },
  {
    name: "Hobi",
    slug: "hobi",
    description: "Yağlı boya, akrilik, epoksi hazır kitler",
  },
  {
    name: "Hediyelik",
    slug: "hediyelik",
    description: "Yağlı boya kutular, tepsiler, bambu ürünler",
  },
];

const getProducts = (cats) => {
  const defter = cats.find((c) => c.slug === "defter")._id;
  const kalem = cats.find((c) => c.slug === "kalem")._id;
  const kutu = cats.find((c) => c.slug === "kutu-oyunlari")._id;
  const hobi = cats.find((c) => c.slug === "hobi")._id;
  const hediyelik = cats.find((c) => c.slug === "hediyelik")._id;

  return [
    // ── DEFTER ──
    {
      name: "A5 Noktalı Not Defteri",
      description:
        "Bullet journal ve not almak için ideal, 160 sayfa noktalı A5 defter. Sert kapak, şeritli ayraç.",
      stock: 2, // Son 2 ürün uyarısı için
      brand: "Kovan",
      category: defter,
      image: "",
      rating: 4.7,
      numReviews: 12,
    },
    {
      name: "A4 Çizgili Not Defteri",
      description:
        "200 sayfa çizgili A4 defter. Okul ve ofis kullanımına uygun, spiralli.",
      stock: 15,
      brand: "Kovan",
      category: defter,
      image: "",
      rating: 4.3,
      numReviews: 8,
    },
    {
      name: "Tarihsiz Haftalık Planlayıcı",
      description:
        "Haftalık ve aylık planlama sayfaları, alışkanlık takip alanı. Hardcover, 192 sayfa.",
      stock: 2,
      brand: "Kovan",
      category: defter,
      image: "",
      rating: 4.9,
      numReviews: 21,
    },
    {
      name: "Tarihsiz Günlük Ajanda",
      description:
        "Her gün için ayrı sayfa, öncelik listesi ve notlar bölümü. A5 boyut, 365 sayfa.",
      stock: 20,
      brand: "Kovan",
      category: defter,
      image: "",
      rating: 4.8,
      numReviews: 15,
    },
    {
      name: "Mini Cep Defteri Seti (3'lü)",
      description:
        "Çanta içine sığan 3 adet cep defteri seti. Kareli, çizgili ve düz seçenekli.",
      stock: 2,
      brand: "Kovan",
      category: defter,
      image: "",
      rating: 4.5,
      numReviews: 9,
    },

    // ── KALEM ──
    {
      name: "Profesyonel Eskiz Kalem Seti (12'li)",
      description:
        "2H'den 8B'ye 12 farklı sertlikte eskiz kalemi. Sanatçılar ve tasarımcılar için ideal.",
      stock: 10,
      brand: "Faber",
      category: kalem,
      image: "",
      rating: 4.8,
      numReviews: 18,
    },
    {
      name: "Suluboya Boya Kalemi Seti (24'lü)",
      description:
        "Su bazlı, canlı renkli 24 adet suluboya kalemi. Boyama kitapları ve illüstrasyon için.",
      stock: 2,
      brand: "Staedtler",
      category: kalem,
      image: "",
      rating: 4.6,
      numReviews: 14,
    },
    {
      name: "Kuru Boya Seti (36'lı)",
      description:
        "36 renk profesyonel kuru boya. Ahşap kutuda, yumuşak ve solmaz pigmentli.",
      stock: 8,
      brand: "Koh-i-noor",
      category: kalem,
      image: "",
      rating: 4.7,
      numReviews: 11,
    },
    {
      name: "Keçeli Kalem Seti (20'li)",
      description:
        "20 canlı renk, çift uçlu (ince ve kalın). Planlayıcı ve bullet journal için mükemmel.",
      stock: 2,
      brand: "Stabilo",
      category: kalem,
      image: "",
      rating: 4.5,
      numReviews: 22,
    },
    {
      name: "Pastel Boya Seti (12'li)",
      description:
        "Yumuşak pastel boyalar. Zemin boya ve karıştırma teknikleri için ideal.",
      stock: 12,
      brand: "Mungyo",
      category: kalem,
      image: "",
      rating: 4.4,
      numReviews: 7,
    },

    // ── KUTU OYUNLARI ──
    {
      name: "Catan - Strateji Kutu Oyunu",
      description:
        "Dünyaca ünlü kaynak yönetimi ve strateji oyunu. 3-4 oyuncu, 10+ yaş. Ortalama süre: 60-120 dk.",
      stock: 2,
      brand: "Mayfair Games",
      category: kutu,
      image: "",
      rating: 4.9,
      numReviews: 34,
    },
    {
      name: "Dixit - Hayal Gücü Oyunu",
      description:
        "Yaratıcılığı ve hayal gücünü geliştiren kart oyunu. 3-6 oyuncu, 8+ yaş.",
      stock: 5,
      brand: "Libellud",
      category: kutu,
      image: "",
      rating: 4.8,
      numReviews: 28,
    },
    {
      name: "Azul - Taş Döşeme Oyunu",
      description:
        "Mozaik taş döşeme temalı strateji oyunu. 2-4 oyuncu, 8+ yaş. Soyut strateji.",
      stock: 2,
      brand: "Plan B Games",
      category: kutu,
      image: "",
      rating: 4.9,
      numReviews: 19,
    },
    {
      name: "Dobble - Refleks Kart Oyunu",
      description:
        "Hızlı refleks ve dikkat oyunu. 2-8 oyuncu, 6+ yaş. Ailece oynanabilir.",
      stock: 15,
      brand: "Asmodee",
      category: kutu,
      image: "",
      rating: 4.7,
      numReviews: 41,
    },
    {
      name: "Pandemic - İşbirliği Oyunu",
      description:
        "Dünyayı salgın hastalıklardan kurtarın! 2-4 oyuncu, 8+ yaş. Kooperatif strateji.",
      stock: 2,
      brand: "Z-Man Games",
      category: kutu,
      image: "",
      rating: 4.8,
      numReviews: 16,
    },

    // ── HOBİ ──
    {
      name: "Yağlı Boya Başlangıç Kiti",
      description:
        "24 renk yağlı boya, 3 fırça, palet, tuval ve tiner dahil. Başlangıç için eksiksiz set.",
      stock: 2,
      brand: "Kovan Hobi",
      category: hobi,
      image: "",
      rating: 4.7,
      numReviews: 13,
    },
    {
      name: "Akrilik Boya Profesyonel Kit",
      description:
        "36 renk akrilik boya, 5 fırça, 2 tuval, palet. Hızlı kurur, su ile temizlenir.",
      stock: 10,
      brand: "Kovan Hobi",
      category: hobi,
      image: "",
      rating: 4.8,
      numReviews: 17,
    },
    {
      name: "Epoksi Reçine Başlangıç Seti",
      description:
        "500gr A+B epoksi reçine, pigment boyalar, silikon kalıplar ve karıştırma araçları.",
      stock: 2,
      brand: "Kovan Hobi",
      category: hobi,
      image: "",
      rating: 4.9,
      numReviews: 24,
    },

    // ── HEDİYELİK ──
    {
      name: "El Yapımı Yağlı Boya Kutu",
      description:
        "Ahşap üzerine el boyaması çiçek desenli dekoratif kutu. 20x15x8 cm. Her biri özgün.",
      stock: 2,
      brand: "Kovan Atölye",
      category: hediyelik,
      image: "",
      rating: 5.0,
      numReviews: 6,
    },
    {
      name: "Bambu Servis Tepsisi",
      description:
        "Doğal bambu, el yapımı oval servis tepsisi. 40x28 cm, saplı model. Kahvaltı ve sunum için.",
      stock: 6,
      brand: "Kovan Atölye",
      category: hediyelik,
      image: "",
      rating: 4.8,
      numReviews: 9,
    },
    {
      name: "Özel Tasarım Hediye Seti",
      description:
        "Yağlı boya kutu + bambu tepsi + mini defter kombini. Özel ambalajlı hediye seti.",
      stock: 2,
      brand: "Kovan Atölye",
      category: hediyelik,
      image: "",
      rating: 5.0,
      numReviews: 4,
    },
  ];
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB bağlandı");

    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Eski veriler silindi");

    const createdCats = await Category.insertMany(categories);
    console.log(`${createdCats.length} kategori eklendi`);

    const products = getProducts(createdCats);
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} ürün eklendi`);

    console.log("\n✅ Seed tamamlandı!");
    process.exit(0);
  } catch (error) {
    console.error("Seed hatası:", error);
    process.exit(1);
  }
};

seedDB();
