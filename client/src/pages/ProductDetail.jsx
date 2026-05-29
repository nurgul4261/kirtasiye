import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} sepete eklendi`);
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (!product) return null;

  return (
    <div className="container detail-page">
      <button onClick={() => navigate(-1)} className="back-btn">← Geri</button>
      <div className="detail-grid">
        <div className="detail-img">
          <img src={product.image || '/placeholder.png'} alt={product.name} />
        </div>
        <div className="detail-info">
          <p className="detail-category">{product.category?.name}</p>
          <h1>{product.name}</h1>
          <p className="detail-brand">Marka: {product.brand || '-'}</p>
          <div className="detail-price">{product.price.toFixed(2)} ₺</div>
          <p className="detail-desc">{product.description}</p>
          <p className="detail-stock">
            Stok: <strong style={{ color: product.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {product.stock > 0 ? `${product.stock} adet` : 'Tükendi'}
            </strong>
          </p>
          {product.stock > 0 && (
            <div className="detail-actions">
              <div className="qty-control">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <button className="btn-primary add-to-cart-btn" onClick={handleAddToCart}>
                🛒 Sepete Ekle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
