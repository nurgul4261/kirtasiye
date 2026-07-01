import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./SearchBar.css";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Dışarı tıklanınca dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Yazarken debounce'lu arama
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/products?keyword=${encodeURIComponent(trimmed)}&pageSize=6`,
        );
        setResults(res.data.products || []);
        setOpen(true);
      } catch (error) {
        console.error(error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const goToResults = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    navigate(`/products?keyword=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    goToResults();
  };

  const handleSelectProduct = (id) => {
    setOpen(false);
    setQuery("");
    navigate(`/products/${id}`);
  };

  return (
    <div className="searchbar-wrapper" ref={wrapperRef}>
      <form className="searchbar-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="searchbar-input"
          placeholder="Ürün ara..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        <button type="submit" className="searchbar-btn" aria-label="Ara">
          🔍
        </button>
      </form>

      {open && (
        <div className="searchbar-dropdown">
          {loading ? (
            <div className="searchbar-status">Aranıyor...</div>
          ) : results.length > 0 ? (
            <>
              {results.map((p) => (
                <div
                  key={p._id}
                  className="searchbar-result"
                  onClick={() => handleSelectProduct(p._id)}
                >
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="searchbar-result-img"
                    />
                  )}
                  <div className="searchbar-result-info">
                    <span className="searchbar-result-name">{p.name}</span>
                    {p.price != null && (
                      <span className="searchbar-result-price">
                        {p.price} TL
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div className="searchbar-viewall" onClick={goToResults}>
                Tüm sonuçları gör →
              </div>
            </>
          ) : (
            <div className="searchbar-status">Sonuç bulunamadı</div>
          )}
        </div>
      )}
    </div>
  );
}
