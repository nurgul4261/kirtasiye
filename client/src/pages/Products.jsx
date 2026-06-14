import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ui/ProductCard";
import "./Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [openParent, setOpenParent] = useState(null);

  const selectedCategory = searchParams.get("category") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, pageSize: 12 });
        if (keyword) params.append("keyword", keyword);
        if (selectedCategory) params.append("category", selectedCategory);
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
    api.get("/categories").then(({ data }) => {
      setCategories(data); // ağaç yapısı: [{...cat, children: [...]}]

      // Seçili kategori bir alt kategoriyse, üst kategoriyi otomatik aç
      if (selectedCategory) {
        data.forEach((cat) => {
          const isChild = cat.children?.some((c) => c._id === selectedCategory);
          if (isChild) setOpenParent(cat._id);
        });
      }
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCatClick = (cat) => {
    // Alt kategorisi varsa aç/kapat, yoksa filtrele
    if (cat.children?.length > 0) {
      setOpenParent(openParent === cat._id ? null : cat._id);
      setSearchParams({ category: cat._id });
    } else {
      setSearchParams({ category: cat._id });
    }
    setPage(1);
  };

  return (
    <div className="container products-page">
      <div className="products-sidebar">
        <div className="filter-card">
          <h3>Kategoriler</h3>
          <ul className="cat-list">
            {/* Tümü */}
            <li
              className={!selectedCategory ? "active" : ""}
              onClick={() => {
                setSearchParams({});
                setPage(1);
              }}
            >
              Tümü
            </li>

            {/* Ana kategoriler */}
            {categories.map((cat) => (
              <li key={cat._id} className="cat-parent-item">
                {/* Ana kategori satırı */}
                <div
                  className={`cat-parent${selectedCategory === cat._id ? " active" : ""}`}
                  onClick={() => handleCatClick(cat)}
                >
                  <span>{cat.name}</span>
                  {cat.children?.length > 0 && (
                    <span className="cat-arrow">
                      {openParent === cat._id ? "▲" : "▼"}
                    </span>
                  )}
                </div>

                {/* Alt kategoriler */}
                {cat.children?.length > 0 && openParent === cat._id && (
                  <ul className="cat-children">
                    {cat.children.map((sub) => (
                      <li
                        key={sub._id}
                        className={selectedCategory === sub._id ? "active" : ""}
                        onClick={() => {
                          setSearchParams({ category: sub._id });
                          setPage(1);
                        }}
                      >
                        ▸ {sub.name}
                      </li>
                    ))}
                  </ul>
                )}
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
          <button type="submit" className="btn-primary">
            Ara
          </button>
        </form>

        {loading ? (
          <div className="loading">Yükleniyor...</div>
        ) : products.length === 0 ? (
          <div className="empty">Ürün bulunamadı.</div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={page === p ? "btn-primary" : "btn-outline"}
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
