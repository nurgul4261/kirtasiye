import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import "./ProductCard.css";

const GIFT_WRAP_PRICE = 10;

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const [giftWrap, setGiftWrap] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();

    const hasStockInfo = product.stock !== undefined;

    // Stok bilgisi varsa sepetteki mevcut miktarı kontrol et
    if (hasStockInfo) {
      const inCart = cartItems
        .filter((i) => i._id === product._id)
        .reduce((sum, i) => sum + i.quantity, 0);

      if (product.stock === 0) {
        toast.error(`${product.name} stokta yok`);
        return;
      }

      if (inCart >= product.stock) {
        toast.warn("Sepete ekleyebileceğiniz maksimum adede ulaştınız");
        return;
      }
    }

    addToCart(product, 1, giftWrap);
    toast.success(
      giftWrap
        ? `${product.name} sepete eklendi 🎁 (Hediye paketli)`
        : `${product.name} sepete eklendi`,
    );
  };

  // Checkbox/etiket tıklaması, kartın Link navigasyonuna kabarcıklanmasın
  // (preventDefault KOYMUYORUZ, yoksa checkbox'ın kendi toggle'ı da iptal olur)
  const stopCardNavigation = (e) => {
    e.stopPropagation();
  };

  const isOutOfStock = product.stock !== undefined && product.stock === 0;

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-img-wrap">
        <img src={product.image || "/placeholder.png"} alt={product.name} />
        {isOutOfStock && <span className="out-of-stock">Stok Yok</span>}
      </div>
      <div className="product-info">
        <p className="product-category">{product.category?.name}</p>
        <h3 className="product-name">{product.name}</h3>

        <label className="gift-wrap-option" onClick={stopCardNavigation}>
          <input
            type="checkbox"
            checked={giftWrap}
            onChange={() => setGiftWrap((g) => !g)}
          />
          <span>🎁 Hediye Paketi (+{GIFT_WRAP_PRICE.toFixed(2)} ₺)</span>
        </label>

        <div className="product-footer">
          <span className="product-price">
            {(product.price + (giftWrap ? GIFT_WRAP_PRICE : 0)).toFixed(2)} ₺
          </span>
          <button
            className="btn-primary add-cart-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            + Sepet
          </button>
        </div>
      </div>
    </Link>
  );
}
