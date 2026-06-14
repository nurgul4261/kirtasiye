import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ui/ProductCard";
import "./Home.css";

const WORDS = [
  "Defter",
  "Kutu Oyunu",
  "Hobi Kiti",
  "Hediyelik",
  "Çim Adam",
  "Ahşap Boyama",
];

const icons = {
  defter: "📓",
  kalem: "✏️",
  "kutu-oyunlari": "🧩",
  hobi: "🎨",
  "cim-adam": "🌱",
  "tas-tozu-boyama": "🪨",
  "cocuk-tuval-boyama": "🖼️",
  "sayilarla-tuval-boyama": "🎨",
  "cocuk-ahsap-boyama": "🪵",
  hediyelik: "🎁",
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [openCat, setOpenCat] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % WORDS.length);
        setAnimating(false);
      }, 400);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products?pageSize=4"),
          api.get("/categories"), // ağaç yapısı geliyor
        ]);
        setFeaturedProducts(productsRes.data.products);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-wrapper">
      {/* 1. BÖLÜM: Hero */}
      <section className="storex-hero">
        <div className="storex-hero-content">
          <h1>
            Özenle Seçilen <br />
            <span className={`hero-word ${animating ? "fade-out" : "fade-in"}`}>
              {WORDS[wordIndex]}
            </span>{" "}
            Çeşitlerini Keşfedin!
          </h1>
          <Link to="/products" className="storex-hero-btn">
            ŞİMDİ ALIŞVERİŞE BAŞLA
          </Link>
        </div>
      </section>

      {/* 2. BÖLÜM: Kategori Izgarası */}
      {categories.length > 0 && (
        <section className="storex-section">
          <div className="storex-container">
            <div className="storex-categories-grid">
              {categories.map((cat) => (
                <div key={cat._id} className="storex-cat-wrapper">
                  {/* Alt kategorisi varsa tıklayınca açılır, yoksa direkt link */}
                  {cat.children?.length > 0 ? (
                    <div
                      className={`storex-category-card has-children${openCat === cat._id ? " open" : ""}`}
                      onClick={() =>
                        setOpenCat(openCat === cat._id ? null : cat._id)
                      }
                    >
                      <div className="storex-cat-content">
                        <span className="storex-cat-icon">
                          {icons[cat.slug] || "📦"}
                        </span>
                        <div className="storex-cat-overlay">
                          <span className="storex-cat-name">{cat.name}</span>
                          <span className="storex-cat-arrow">
                            {openCat === cat._id ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>

                      {/* Alt kategoriler */}
                      {openCat === cat._id && (
                        <div
                          className="storex-sub-cats"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            to={`/products?category=${cat._id}`}
                            className="storex-sub-cat"
                          >
                            🔹 Tüm {cat.name}
                          </Link>
                          {cat.children.map((sub) => (
                            <Link
                              key={sub._id}
                              to={`/products?category=${sub._id}`}
                              className="storex-sub-cat"
                            >
                              {icons[sub.slug] || "▸"} {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={`/products?category=${cat._id}`}
                      className="storex-category-card"
                    >
                      <div className="storex-cat-content">
                        <span className="storex-cat-icon">
                          {icons[cat.slug] || "📦"}
                        </span>
                        <div className="storex-cat-overlay">
                          <span className="storex-cat-name">{cat.name}</span>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="storex-center-btn-wrapper">
              <Link to="/products" className="storex-all-cats-btn">
                TÜM KATEGORİLERİ GÖR
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. BÖLÜM: Günün Fırsatları */}
      <section className="storex-section storex-bg-light">
        <div className="storex-container">
          <div className="storex-section-header">
            <h2 className="storex-section-title">GÜNÜN FIRSATLARI</h2>
          </div>
          {loading ? (
            <div className="storex-loading">Yükleniyor...</div>
          ) : (
            <div className="storex-products-grid">
              {featuredProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
