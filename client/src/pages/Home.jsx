import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ui/ProductCard";
import "./Home.css";

const WORDS = ["Defter", "Kutu Oyunu", "Hobi Kiti", "Çim Adam"];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [openCat, setOpenCat] = useState(null);

  // En Yeniler carousel state
  const trackRef = useRef(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [transitionOn, setTransitionOn] = useState(true);
  const [itemStep, setItemStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
          api.get("/products?pageSize=9"),
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

  // Kart genişliği + gap ölçümü (responsive uyum için)
  useEffect(() => {
    const measure = () => {
      if (trackRef.current && trackRef.current.children[0]) {
        const firstItem = trackRef.current.children[0];
        const style = window.getComputedStyle(trackRef.current);
        const gap = parseFloat(style.columnGap || style.gap) || 0;
        setItemStep(firstItem.getBoundingClientRect().width + gap);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [featuredProducts]);

  // Her 2 saniyede bir sıradaki ürüne adım adım geç
  useEffect(() => {
    if (featuredProducts.length === 0 || isPaused) return;
    const timer = setInterval(() => {
      setSlideIndex((i) => i + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, [featuredProducts.length, isPaused]);

  // Kopyalanmış listenin sonuna gelince, görünmeden başa sar (sonsuz döngü hissi)
  useEffect(() => {
    if (featuredProducts.length > 0 && slideIndex === featuredProducts.length) {
      const t = setTimeout(() => {
        setTransitionOn(false);
        setSlideIndex(0);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [slideIndex, featuredProducts.length]);

  useEffect(() => {
    if (!transitionOn) {
      const raf1 = requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitionOn(true));
      });
      return () => cancelAnimationFrame(raf1);
    }
  }, [transitionOn]);

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
              {categories.map((cat) => {
                const bgStyle = cat.image
                  ? { backgroundImage: `url(${cat.image})` }
                  : {};

                return (
                  <div
                    key={cat._id}
                    className="storex-cat-wrapper"
                    // ✅ Açık olan wrapper en üste çıkar
                    style={{ zIndex: openCat === cat._id ? 200 : 1 }}
                  >
                    {cat.children?.length > 0 ? (
                      <>
                        <div
                          className={`storex-category-card has-children${
                            openCat === cat._id ? " open" : ""
                          }${cat.image ? " has-bg" : ""}`}
                          style={bgStyle}
                          onClick={() =>
                            setOpenCat(openCat === cat._id ? null : cat._id)
                          }
                        >
                          <div className="storex-cat-content">
                            <div className="storex-cat-overlay">
                              <span className="storex-cat-name">
                                {cat.name}
                              </span>
                              <span className="storex-cat-arrow">
                                {openCat === cat._id ? "▲" : "▼"}
                              </span>
                            </div>
                          </div>
                        </div>

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
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={`/products?category=${cat._id}`}
                        className={`storex-category-card${
                          cat.image ? " has-bg" : ""
                        }`}
                        style={bgStyle}
                      >
                        <div className="storex-cat-content">
                          <div className="storex-cat-overlay">
                            <span className="storex-cat-name">{cat.name}</span>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
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

      {/* 3. BÖLÜM: En Yeniler */}
      <section className="storex-section storex-bg-light">
        <div className="storex-container">
          <div className="storex-section-header">
            <h2 className="storex-section-title">EN YENİLER</h2>
          </div>
          {loading ? (
            <div className="storex-loading">Yükleniyor...</div>
          ) : (
            <div
              className="storex-carousel"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div
                className="storex-carousel-track"
                ref={trackRef}
                style={{
                  transform: `translateX(-${slideIndex * itemStep}px)`,
                  transition: transitionOn ? "transform 0.6s ease" : "none",
                }}
              >
                {[...featuredProducts, ...featuredProducts].map((p, i) => (
                  <div className="storex-carousel-item" key={`${p._id}-${i}`}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
