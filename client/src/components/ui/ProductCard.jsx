import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();

    const hasStockInfo = product.stock !== undefined;

    // Stok bilgisi varsa sepetteki mevcut miktarı kontrol et
    if (hasStockInfo) {
      const inCart = cartItems.find((i) => i._id === product._id);
      const currentQty = inCart?.quantity || 0;

      if (product.stock === 0) {
        toast.error(`${product.name} stokta yok`);
        return;
      }

      if (currentQty >= product.stock) {
        toast.warn("Sepete ekleyebileceğiniz maksimum adede ulaştınız");
        return;
      }
    }

    addToCart(product, 1);
    toast.success(`${product.name} sepete eklendi`);
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
        <div className="product-footer">
          <span className="product-price">{product.price.toFixed(2)} ₺</span>
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
