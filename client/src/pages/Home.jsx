import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ui/ProductCard";
import BeeHive from "../components/ui/BeeHive";
import "./Home.css";

const WORDS = ["Defter", "Kalem", "Kutu Oyunu", "Hobi Kiti", "Hediyelik"];

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
          api.get("/products?pageSize=8"),
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
    <div>
      {/* 2 Sütunlu Modern Hero Alanı */}
      <section className="hero">
        <div className="container hero-grid">
          {/* Sol Taraf: Başlık, Açıklama ve Alttaki Buton */}
          <div className="hero-left">
            <h1>
              İhtiyacınız Olan
              <br />
              <span
                className={`hero-word ${animating ? "fade-out" : "fade-in"}`}
              >
                {WORDS[wordIndex]}
              </span>
              <br />
              Burada!
            </h1>

            <p className="hero-desc">
              Defter, kalem, kutu oyunu, hobi kiti ve hediyelikler — hızlı
              teslimat, uygun fiyat.
            </p>

            <Link to="/products" className="hero-btn">
              Ürünleri Keşfet →
            </Link>
          </div>

          {/* Sağ Taraf: Arı animasyonu */}
          <div className="hero-right">
            <BeeHive width={550} height={300} />
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Kategoriler</h2>
            <div className="categories-grid">
              {categories.map((cat, index) => {
                const icons = {
                  defter: "📓",
                  kalem: "✏️",
                  "kutu-oyunlari": "🧩",
                  hobi: "🎨",
                  hediyelik: "🎁",
                };
                const icon = icons[cat.slug] || "📦";
                const bgClass = `cat-bg-${(index % 5) + 1}`;

                return (
                  <Link
                    key={cat._id}
                    to={`/products?category=${cat._id}`}
                    className={`category-card ${bgClass}`}
                  >
                    <span className="cat-icon">{icon}</span>
                    <span className="cat-name">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Ürünler */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Öne Çıkan Ürünler</h2>
            <Link to="/products" className="see-all">
              Tümünü Gör →
            </Link>
          </div>
          {loading ? (
            <div className="loading">Yükleniyor...</div>
          ) : (
            <div className="products-grid">
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
