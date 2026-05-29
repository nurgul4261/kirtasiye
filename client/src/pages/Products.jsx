import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ui/ProductCard';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState('');

  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, pageSize: 12 });
        if (keyword) params.append('keyword', keyword);
        if (selectedCategory) params.append('category', selectedCategory);
        const { data } = await api.get(`/products?${params}`);
        setProducts(data.products);
        setPages(data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, keyword, selectedCategory]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="container products-page">
      <div className="products-sidebar">
        <div className="filter-card">
          <h3>Kategoriler</h3>
          <ul className="cat-list">
            <li className={!selectedCategory ? 'active' : ''} onClick={() => setSearchParams({})}>
              Tümü
            </li>
            {categories.map((c) => (
              <li
                key={c._id}
                className={selectedCategory === c._id ? 'active' : ''}
                onClick={() => setSearchParams({ category: c._id })}
              >
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="products-main">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Ürün ara..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="btn-primary">Ara</button>
        </form>

        {loading ? (
          <div className="loading">Yükleniyor...</div>
        ) : products.length === 0 ? (
          <div className="empty">Ürün bulunamadı.</div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={page === p ? 'btn-primary' : 'btn-outline'}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
