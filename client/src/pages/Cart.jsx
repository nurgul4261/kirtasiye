import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="empty" style={{ padding: '80px 0' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🛒</p>
        <h2>Sepetiniz boş</h2>
        <Link to="/products" className="btn-primary" style={{ display: 'inline-block', marginTop: 20, textDecoration: 'none' }}>
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  const shippingPrice = totalPrice > 500 ? 0 : 29.90;

  return (
    <div className="container cart-page">
      <h1 className="cart-title">Sepetim ({cartItems.length} ürün)</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item card">
              <img src={item.image || '/placeholder.png'} alt={item.name} />
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>{item.price.toFixed(2)} ₺</p>
              </div>
              <div className="item-qty">
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
              </div>
              <div className="item-total">{(item.price * item.quantity).toFixed(2)} ₺</div>
              <button className="remove-btn" onClick={() => removeFromCart(item._id)}>✕</button>
            </div>
          ))}
        </div>
        <div className="cart-summary card">
          <h3>Sipariş Özeti</h3>
          <div className="summary-row">
            <span>Ürünler</span>
            <span>{totalPrice.toFixed(2)} ₺</span>
          </div>
          <div className="summary-row">
            <span>Kargo</span>
            <span>{shippingPrice === 0 ? 'Ücretsiz' : `${shippingPrice.toFixed(2)} ₺`}</span>
          </div>
          {shippingPrice === 0 && <p className="free-shipping">✅ 500 ₺ üzeri ücretsiz kargo</p>}
          <div className="summary-total">
            <span>Toplam</span>
            <span>{(totalPrice + shippingPrice).toFixed(2)} ₺</span>
          </div>
          <button className="btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
            Siparişi Tamamla →
          </button>
        </div>
      </div>
    </div>
  );
}
