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
    name: "Kutu Oyunları",
    slug: "kutu-oyunlari",
    description: "Strateji, akıl ve zeka oyunları",
  },
  {
    name: "Çim Adam",
    slug: "cim-adam",
    description: "Çim adam ve toprak oyuncak setleri",
  },
  {
    name: "Taş Tozu Boyama",
    slug: "tas-tozu-boyama",
    description: "Taş tozu boyama kitleri ve setleri",
  },
  {
    name: "Çocuk Tuval Boyama",
    slug: "cocuk-tuval-boyama",
    description: "Çocuklar için tuval boyama kitleri",
  },
  {
    name: "Sayılarla Tuval Boyama",
    slug: "sayilarla-tuval-boyama",
    description: "Sayılarla tuval boyama setleri",
  },
  {
    name: "Çocuk Ahşap Boyama",
    slug: "cocuk-ahsap-boyama",
    description: "Çocuklar için ahşap boyama kitleri",
  },
  {
    name: "Hediyelik",
    slug: "hediyelik",
    description: "Yağlı boya kutular, tepsiler, bambu ürünler",
  },
];

const getProducts = (cats) => {
  const defter = cats.find((c) => c.slug === "defter")._id;
  const kutu = cats.find((c) => c.slug === "kutu-oyunlari")._id;
  const cimAdam = cats.find((c) => c.slug === "cim-adam")._id;
  const tasToz = cats.find((c) => c.slug === "tas-tozu-boyama")._id;
  const cocukTuv = cats.find((c) => c.slug === "cocuk-tuval-boyama")._id;
  const sayiTuv = cats.find((c) => c.slug === "sayilarla-tuval-boyama")._id;
  const cocukAhs = cats.find((c) => c.slug === "cocuk-ahsap-boyama")._id;
  const hediyelik = cats.find((c) => c.slug === "hediyelik")._id;

  return [
    // ── DEFTER ──
    {
      name: "A5 Noktalı Not Defteri",
      description:
        "Bullet journal ve not almak için ideal, 160 sayfa noktalı A5 defter. Sert kapak, şeritli ayraç.",
      stock: 2,
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
    // ── KUTU OYUNLARI ──
    {
      name: "Catan - Strateji Kutu Oyunu",
      description:
        "Dünyaca ünlü kaynak yönetimi ve strateji oyunu. 3-4 oyuncu, 10+ yaş.",
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
        "Mozaik taş döşeme temalı strateji oyunu. 2-4 oyuncu, 8+ yaş.",
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
        "Dünyayı salgın hastalıklardan kurtarın! 2-4 oyuncu, 8+ yaş.",
      stock: 2,
      brand: "Z-Man Games",
      category: kutu,
      image: "",
      rating: 4.8,
      numReviews: 16,
    },

    // ── ÇİM ADAM ──
    {
      name: "Çim Adam Saksı Seti",
      description:
        "Çocukların sevdiği çim adam yetiştirme seti. Saksı, toprak ve çim tohumu dahil. Saçları büyüyor!",
      stock: 15,
      brand: "Kovan Hobi",
      category: cimAdam,
      image: "",
      rating: 4.8,
      numReviews: 22,
    },
    {
      name: "Çim Adam Aile Seti (4'lü)",
      description:
        "Anne, baba ve 2 çocuktan oluşan çim adam ailesi. Her biri farklı yüz ifadeli, eğlenceli yetiştirme seti.",
      stock: 10,
      brand: "Kovan Hobi",
      category: cimAdam,
      image: "",
      rating: 4.9,
      numReviews: 14,
    },
    {
      name: "Mini Çim Adam Magnet Set",
      description:
        "Buzdolabı magneti olarak kullanılabilen mini çim adam. Mutfağınıza neşe katın!",
      stock: 20,
      brand: "Kovan Hobi",
      category: cimAdam,
      image: "",
      rating: 4.6,
      numReviews: 9,
    },

    // ── TAŞ TOZU BOYAMA ──
    {
      name: "Taş Tozu Boyama Seti - Çiçek",
      description:
        "Hazır taş tozu kalıplı çiçek deseni, 6 renk boya ve fırça dahil. Başlangıç seviyesi.",
      stock: 12,
      brand: "Kovan Hobi",
      category: tasToz,
      image: "",
      rating: 4.7,
      numReviews: 18,
    },
    {
      name: "Taş Tozu Boyama Seti - Hayvanlar",
      description:
        "Sevimli hayvan figürlü taş tozu boyama seti. 8 renk akrilik boya, fırça ve tamamlanmış ürün standı.",
      stock: 8,
      brand: "Kovan Hobi",
      category: tasToz,
      image: "",
      rating: 4.8,
      numReviews: 11,
    },
    {
      name: "Taş Tozu Boyama - Mandala",
      description:
        "Mandala desenli taş tozu boyama seti. Meditasyon ve rahatlama için ideal. 10 renk boya dahil.",
      stock: 6,
      brand: "Kovan Hobi",
      category: tasToz,
      image: "",
      rating: 4.9,
      numReviews: 7,
    },

    // ── ÇOCUK TUVAL BOYAMA ──
    {
      name: "Çocuk Tuval Boyama Seti - Unicorn",
      description:
        "Unicorn temalı 20x20cm tuval, 6 renk akrilik boya ve fırça dahil. 5+ yaş için.",
      stock: 15,
      brand: "Kovan Hobi",
      category: cocukTuv,
      image: "",
      rating: 4.8,
      numReviews: 26,
    },
    {
      name: "Çocuk Tuval Boyama Seti - Orman",
      description:
        "Orman temalı sayılarla boya. Tuval üzerinde numaralı alanlar, 8 renk boya dahil. 6+ yaş.",
      stock: 10,
      brand: "Kovan Hobi",
      category: cocukTuv,
      image: "",
      rating: 4.7,
      numReviews: 19,
    },
    {
      name: "Çocuk Tuval Boyama - Deniz Altı",
      description:
        "Balık ve deniz temalı eğlenceli boyama tuvali. 10 renk parmak boyası dahil. 3+ yaş.",
      stock: 12,
      brand: "Kovan Hobi",
      category: cocukTuv,
      image: "",
      rating: 4.9,
      numReviews: 31,
    },

    // ── SAYILARLA TUVAL BOYAMA ──
    {
      name: "Sayılarla Boyama - Gün Batımı (40x50)",
      description:
        "Gün batımı manzaralı 40x50cm sayılarla boyama seti. Çerçeveli, 24 renk akrilik boya dahil.",
      stock: 8,
      brand: "Kovan Hobi",
      category: sayiTuv,
      image: "",
      rating: 4.9,
      numReviews: 34,
    },
    {
      name: "Sayılarla Boyama - Çiçek Bahçesi",
      description:
        "Renkli çiçek bahçesi temalı 30x40cm set. Başlangıç seviyesi, 18 renk boya dahil.",
      stock: 12,
      brand: "Kovan Hobi",
      category: sayiTuv,
      image: "",
      rating: 4.8,
      numReviews: 22,
    },
    {
      name: "Sayılarla Boyama - Van Gogh Yıldızlı Gece",
      description:
        "Ünlü eseri sayılarla boyayın. 40x50cm, 24 renk boya ve detay fırçası dahil.",
      stock: 6,
      brand: "Kovan Hobi",
      category: sayiTuv,
      image: "",
      rating: 5.0,
      numReviews: 15,
    },
    {
      name: "Sayılarla Boyama - Kedi & Çiçek",
      description:
        "Sevimli kedi ve çiçek temalı 30x30cm set. Dekoratif çerçevesiyle hediye olarak ideal.",
      stock: 10,
      brand: "Kovan Hobi",
      category: sayiTuv,
      image: "",
      rating: 4.7,
      numReviews: 28,
    },

    // ── ÇOCUK AHŞAP BOYAMA ──
    {
      name: "Çocuk Ahşap Boyama - Hayvan Seti",
      description:
        "6 parça ahşap hayvan figürü, 8 renk boya ve fırça dahil. 4+ yaş için güvenli boyalar.",
      stock: 15,
      brand: "Kovan Hobi",
      category: cocukAhs,
      image: "",
      rating: 4.8,
      numReviews: 19,
    },
    {
      name: "Ahşap Boyama - Peri Evi Kiti",
      description:
        "2 katlı ahşap peri evi boyama seti. Akrilik boya, fırça ve dekoratif aksesuarlar dahil. 6+ yaş.",
      stock: 8,
      brand: "Kovan Hobi",
      category: cocukAhs,
      image: "",
      rating: 4.9,
      numReviews: 24,
    },
    {
      name: "Ahşap Boyama - Araç Garajı Seti",
      description:
        "Garaj ve 4 araçtan oluşan ahşap boyama seti. Erkek çocuklar için ideal. 5+ yaş.",
      stock: 10,
      brand: "Kovan Hobi",
      category: cocukAhs,
      image: "",
      rating: 4.7,
      numReviews: 16,
    },
    {
      name: "Mini Ahşap Boyama Seti (10'lu)",
      description:
        "10 farklı mini ahşap figür (kalp, yıldız, ev vb.), 12 renk boya dahil. Parti hediyesi olarak ideal.",
      stock: 20,
      brand: "Kovan Hobi",
      category: cocukAhs,
      image: "",
      rating: 4.6,
      numReviews: 11,
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
        "Doğal bambu, el yapımı oval servis tepsisi. 40x28 cm, saplı model.",
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
    console.log(
      `📂 ${createdCats.length} kategori | 🛍️  ${createdProducts.length} ürün`,
    );
    process.exit(0);
  } catch (error) {
    console.error("Seed hatası:", error);
    process.exit(1);
  }
};

seedDB();
