import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ui/ProductCard";
import "./Home.css";

const WORDS = ["Defter", "Kutu Oyunu", "Hobi Kiti", "Hediyelik"];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

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
          api.get("/categories"),
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
      {/* 1. BÖLÜM: 20201207170713.jpg Arka Planlı ve Gri Katmanlı Hero Alanı */}
      <section className="storex-hero">
        {/* Resmin üstündeki yazıların rahat okunması için gri sis katmanı */}
        {/*<div className="storex-hero-overlay"></div>*/}

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

      {/* 2. BÖLÜM: Kategori Izgarası (3+3 Dengeli Düzen) */}
      {categories.length > 0 && (
        <section className="storex-section">
          <div className="storex-container">
            <div className="storex-categories-grid">
              {categories.map((cat) => {
                const icons = {
                  defter: "📓",
                  "kutu-oyunlari": "🧩",
                  hobi: "🎨",
                  hediyelik: "🎁",
                };
                const icon = icons[cat.slug] || "📦";

                return (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat._id}`}
                    className="storex-category-card"
                  >
                    <div className="storex-cat-content">
                      <span className="storex-cat-icon">{icon}</span>
                      <div className="storex-cat-overlay">
                        <span className="storex-cat-name">{cat.name}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
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
