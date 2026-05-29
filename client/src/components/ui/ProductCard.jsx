import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success(`${product.name} sepete eklendi`);
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-img-wrap">
        <img src={product.image || '/placeholder.png'} alt={product.name} />
        {product.stock === 0 && <span className="out-of-stock">Stok Yok</span>}
      </div>
      <div className="product-info">
        <p className="product-category">{product.category?.name}</p>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-footer">
          <span className="product-price">{product.price.toFixed(2)} ₺</span>
          <button
            className="btn-primary add-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            + Sepet
          </button>
        </div>
      </div>
    </Link>
  );
}
