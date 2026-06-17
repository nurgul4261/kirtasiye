import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || user?.role === "admin";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => navigate("/products"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    const hasStockInfo = product.stock !== undefined;

    if (hasStockInfo) {
      const inCart = cartItems.find((i) => i._id === product._id);
      const currentQty = inCart?.quantity || 0;
      const totalQty = currentQty + quantity;

      if (totalQty > product.stock) {
        toast.warn("Sepete ekleyebileceğiniz maksimum adede ulaştınız");
        return;
      }
    }

    addToCart(product, quantity);
    toast.success(`${product.name} sepete eklendi`);
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (!product) return null;

  const hasStockInfo = product.stock !== undefined;
  const inStock = !hasStockInfo || product.stock > 0;
  const inCartQty = cartItems.find((i) => i._id === product._id)?.quantity || 0;
  const maxQty = hasStockInfo ? product.stock - inCartQty : 99;

  const stockDisplay = isAdmin
    ? `${product.stock} adet`
    : inStock
      ? "Stokta var"
      : "Tükendi";

  const handleIncrease = () => {
    if (hasStockInfo && quantity >= maxQty) {
      toast.warn("Sepete ekleyebileceğiniz maksimum adede ulaştınız");
      return;
    }
    setQuantity((q) => q + 1);
  };

  return (
    <div className="container detail-page">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← Geri
      </button>
      <div className="detail-grid">
        <div className="detail-img">
          <img src={product.image || "/placeholder.png"} alt={product.name} />
        </div>
        <div className="detail-info">
          <p className="detail-category">{product.category?.name}</p>
          <h1>{product.name}</h1>
          <p className="detail-brand">Marka: {product.brand || "-"}</p>
          <div className="detail-price">{product.price.toFixed(2)} ₺</div>
          <p className="detail-desc">{product.description}</p>

          <p className="detail-stock">
            Stok:{" "}
            <strong
              style={{ color: inStock ? "var(--success)" : "var(--danger)" }}
            >
              {stockDisplay}
            </strong>
          </p>

          {inStock && maxQty > 0 && (
            <div className="detail-actions">
              <div className="qty-control">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <span>{quantity}</span>
                <button onClick={handleIncrease}>+</button>
              </div>
              <button
                className="btn-primary add-to-cart-btn"
                onClick={handleAddToCart}
              >
                🛒 Sepete Ekle
              </button>
            </div>
          )}

          {inStock && hasStockInfo && maxQty <= 0 && (
            <p
              style={{
                color: "var(--danger)",
                fontWeight: 600,
                fontSize: 14,
                marginTop: 12,
              }}
            >
              Bu üründen sepete ekleyebileceğiniz maksimum adede ulaştınız.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
