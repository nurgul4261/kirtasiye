import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import './Home.css';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?pageSize=8'),
          api.get('/categories'),
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
      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <h1>Tüm Kırtasiye İhtiyaçlarınız<br /><span>Tek Adreste</span></h1>
          <p>Kalem, defter, çanta ve daha fazlası — hızlı teslimat, uygun fiyat.</p>
          <Link to="/products" className="hero-btn">Ürünleri Keşfet →</Link>
        </div>
      </section>

      {/* Kategoriler */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Kategoriler</h2>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link key={cat._id} to={`/products?category=${cat._id}`} className="category-card">
                  <span className="cat-icon">📦</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ürünler */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Öne Çıkan Ürünler</h2>
            <Link to="/products" className="see-all">Tümünü Gör →</Link>
          </div>
          {loading ? (
            <div className="loading">Yükleniyor...</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
