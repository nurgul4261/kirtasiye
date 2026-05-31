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
      price: 89.9,
      stock: 45,
      brand: "Kovan",
      category: defter,
      image:
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80",
      rating: 4.7,
      numReviews: 12,
    },
    {
      name: "A4 Çizgili Not Defteri",
      description:
        "200 sayfa çizgili A4 defter. Okul ve ofis kullanımına uygun, spiralli.",
      price: 64.9,
      stock: 60,
      brand: "Kovan",
      category: defter,
      image:
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
      rating: 4.3,
      numReviews: 8,
    },
    {
      name: "Tarihsiz Haftalık Planlayıcı",
      description:
        "Haftalık ve aylık planlama sayfaları, alışkanlık takip alanı. Hardcover, 192 sayfa.",
      price: 129.9,
      stock: 30,
      brand: "Kovan",
      category: defter,
      image:
        "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&q=80",
      rating: 4.9,
      numReviews: 21,
    },
    {
      name: "Tarihsiz Günlük Ajanda",
      description:
        "Her gün için ayrı sayfa, öncelik listesi ve notlar bölümü. A5 boyut, 365 sayfa.",
      price: 149.9,
      stock: 25,
      brand: "Kovan",
      category: defter,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
      rating: 4.8,
      numReviews: 15,
    },
    {
      name: "Mini Cep Defteri Seti (3'lü)",
      description:
        "Çanta içine sığan 3 adet cep defteri seti. Kareli, çizgili ve düz seçenekli.",
      price: 59.9,
      stock: 50,
      brand: "Kovan",
      category: defter,
      image:
        "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&q=80",
      rating: 4.5,
      numReviews: 9,
    },

    // ── KALEM ──
    {
      name: "Profesyonel Eskiz Kalem Seti (12'li)",
      description:
        "2H'den 8B'ye 12 farklı sertlikte eskiz kalemi. Sanatçılar ve tasarımcılar için ideal.",
      price: 119.9,
      stock: 35,
      brand: "Faber",
      category: kalem,
      image:
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
      rating: 4.8,
      numReviews: 18,
    },
    {
      name: "Suluboya Boya Kalemi Seti (24'lü)",
      description:
        "Su bazlı, canlı renkli 24 adet suluboya kalemi. Boyama kitapları ve illüstrasyon için.",
      price: 89.9,
      stock: 40,
      brand: "Staedtler",
      category: kalem,
      image:
        "https://images.unsplash.com/photo-1560421683-6856ea585c78?w=400&q=80",
      rating: 4.6,
      numReviews: 14,
    },
    {
      name: "Kuru Boya Seti (36'lı)",
      description:
        "36 renk profesyonel kuru boya. Ahşap kutuda, yumuşak ve solmaz pigmentli.",
      price: 179.9,
      stock: 20,
      brand: "Koh-i-noor",
      category: kalem,
      image:
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80",
      rating: 4.7,
      numReviews: 11,
    },
    {
      name: "Keçeli Kalem Seti (20'li)",
      description:
        "20 canlı renk, çift uçlu (ince ve kalın). Planlayıcı ve bullet journal için mükemmel.",
      price: 74.9,
      stock: 55,
      brand: "Stabilo",
      category: kalem,
      image:
        "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80",
      rating: 4.5,
      numReviews: 22,
    },
    {
      name: "Pastel Boya Seti (12'li)",
      description:
        "Yumuşak pastel boyalar. Zemin boya ve karıştırma teknikleri için ideal.",
      price: 94.9,
      stock: 28,
      brand: "Mungyo",
      category: kalem,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
      rating: 4.4,
      numReviews: 7,
    },

    // ── KUTU OYUNLARI ──
    {
      name: "Catan - Strateji Kutu Oyunu",
      description:
        "Dünyaca ünlü kaynak yönetimi ve strateji oyunu. 3-4 oyuncu, 10+ yaş. Ortalama süre: 60-120 dk.",
      price: 549.9,
      stock: 12,
      brand: "Mayfair Games",
      category: kutu,
      image:
        "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400&q=80",
      rating: 4.9,
      numReviews: 34,
    },
    {
      name: "Dixit - Hayal Gücü Oyunu",
      description:
        "Yaratıcılığı ve hayal gücünü geliştiren kart oyunu. 3-6 oyuncu, 8+ yaş.",
      price: 389.9,
      stock: 15,
      brand: "Libellud",
      category: kutu,
      image:
        "https://images.unsplash.com/photo-1606503153255-59d5e417b8b4?w=400&q=80",
      rating: 4.8,
      numReviews: 28,
    },
    {
      name: "Azul - Taş Döşeme Oyunu",
      description:
        "Mozaik taş döşeme temalı strateji oyunu. 2-4 oyuncu, 8+ yaş. Soyut strateji.",
      price: 459.9,
      stock: 10,
      brand: "Plan B Games",
      category: kutu,
      image:
        "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&q=80",
      rating: 4.9,
      numReviews: 19,
    },
    {
      name: "Dobble - Refleks Kart Oyunu",
      description:
        "Hızlı refleks ve dikkat oyunu. 2-8 oyuncu, 6+ yaş. Ailece oynanabilir.",
      price: 199.9,
      stock: 25,
      brand: "Asmodee",
      category: kutu,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
      rating: 4.7,
      numReviews: 41,
    },
    {
      name: "Pandemic - İşbirliği Oyunu",
      description:
        "Dünyayı salgın hastalıklardan kurtarın! 2-4 oyuncu, 8+ yaş. Kooperatif strateji.",
      price: 499.9,
      stock: 8,
      brand: "Z-Man Games",
      category: kutu,
      image:
        "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400&q=80",
      rating: 4.8,
      numReviews: 16,
    },
    {
      name: "Codenames - Kelime Oyunu",
      description:
        "Ekip tabanlı kelime çağrışım oyunu. 4-8 oyuncu, 14+ yaş. Parti oyunu klasiği.",
      price: 279.9,
      stock: 18,
      brand: "Czech Games",
      category: kutu,
      image:
        "https://images.unsplash.com/photo-1606503153255-59d5e417b8b4?w=400&q=80",
      rating: 4.6,
      numReviews: 23,
    },

    // ── HOBİ ──
    {
      name: "Yağlı Boya Başlangıç Kiti",
      description:
        "24 renk yağlı boya, 3 fırça, palet, tuval ve tiner dahil. Başlangıç için eksiksiz set.",
      price: 349.9,
      stock: 20,
      brand: "Kovan Hobi",
      category: hobi,
      image:
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80",
      rating: 4.7,
      numReviews: 13,
    },
    {
      name: "Akrilik Boya Profesyonel Kit",
      description:
        "36 renk akrilik boya, 5 fırça, 2 tuval, palet. Hızlı kurur, su ile temizlenir.",
      price: 289.9,
      stock: 25,
      brand: "Kovan Hobi",
      category: hobi,
      image:
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
      rating: 4.8,
      numReviews: 17,
    },
    {
      name: "Epoksi Reçine Başlangıç Seti",
      description:
        "500gr A+B epoksi reçine, pigment boyalar, silikon kalıplar ve karıştırma araçları.",
      price: 449.9,
      stock: 15,
      brand: "Kovan Hobi",
      category: hobi,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
      rating: 4.9,
      numReviews: 24,
    },
    {
      name: "Suluboya Sanat Kiti",
      description:
        "24 renk suluboya, 4 fırça, suluboya kağıdı bloğu (20 yaprak). Profesyonel kalite.",
      price: 219.9,
      stock: 30,
      brand: "Kovan Hobi",
      category: hobi,
      image:
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80",
      rating: 4.6,
      numReviews: 10,
    },
    {
      name: "Mandala Boyama Kiti",
      description:
        "Mandala şablonları, ince uçlu keçeli kalemler ve rehber kitapçık. Meditasyon ve hobi.",
      price: 159.9,
      stock: 35,
      brand: "Kovan Hobi",
      category: hobi,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
      rating: 4.5,
      numReviews: 8,
    },

    // ── HEDİYELİK ──
    {
      name: "El Yapımı Yağlı Boya Kutu",
      description:
        "Ahşap üzerine el boyaması çiçek desenli dekoratif kutu. 20x15x8 cm. Her biri özgün.",
      price: 279.9,
      stock: 10,
      brand: "Kovan Atölye",
      category: hediyelik,
      image:
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80",
      rating: 5.0,
      numReviews: 6,
    },
    {
      name: "Bambu Servis Tepsisi",
      description:
        "Doğal bambu, el yapımı oval servis tepsisi. 40x28 cm, saplı model. Kahvaltı ve sunum için.",
      price: 199.9,
      stock: 18,
      brand: "Kovan Atölye",
      category: hediyelik,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
      rating: 4.8,
      numReviews: 9,
    },
    {
      name: "Yağlı Boya Desenli Tepsi",
      description:
        "MDF üzerine yağlı boya çiçek desenli dikdörtgen tepsi. 35x25 cm, vernikli yüzey.",
      price: 319.9,
      stock: 12,
      brand: "Kovan Atölye",
      category: hediyelik,
      image:
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80",
      rating: 4.9,
      numReviews: 11,
    },
    {
      name: "Hasır Sepet Seti (3'lü)",
      description:
        "El örmesi doğal hasır sepet, 3 farklı boy. Depolama ve dekorasyon için. S-M-L set.",
      price: 249.9,
      stock: 14,
      brand: "Kovan Atölye",
      category: hediyelik,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
      rating: 4.7,
      numReviews: 7,
    },
    {
      name: "Özel Tasarım Hediye Seti",
      description:
        "Yağlı boya kutu + bambu tepsi + mini defter kombini. Özel ambalajlı hediye seti.",
      price: 599.9,
      stock: 8,
      brand: "Kovan Atölye",
      category: hediyelik,
      image:
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80",
      rating: 5.0,
      numReviews: 4,
    },
  ];
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB bağlandı");

    // Temizle
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Eski veriler silindi");

    // Kategorileri ekle
    const createdCats = await Category.insertMany(categories);
    console.log(`${createdCats.length} kategori eklendi`);

    // Ürünleri ekle
    const products = getProducts(createdCats);
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} ürün eklendi`);

    console.log("\n✅ Seed tamamlandı!");
    console.log("Kategoriler:", createdCats.map((c) => c.name).join(", "));
    process.exit(0);
  } catch (error) {
    console.error("Seed hatası:", error);
    process.exit(1);
  }
};

seedDB();
