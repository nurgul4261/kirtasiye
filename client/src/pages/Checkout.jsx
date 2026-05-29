import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    street: '',
    city: '',
    district: '',
    zipCode: '',
    notes: '',
  });

  const shippingPrice = totalPrice > 500 ? 0 : 29.90;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error('Sepet boş');
    setLoading(true);
    try {
      const orderItems = cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));
      const { notes, ...shippingAddress } = form;
      await api.post('/orders', {
        orderItems,
        shippingAddress,
        itemsPrice: totalPrice,
        shippingPrice,
        totalPrice: totalPrice + shippingPrice,
        notes,
      });
      clearCart();
      toast.success('Siparişiniz alındı! Teşekkürler 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sipariş oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container checkout-page">
      <h1>Sipariş Tamamla</h1>
      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form card">
          <h3>Teslimat Bilgileri</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Ad Soyad</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Telefon</label>
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Adres</label>
            <textarea name="street" value={form.street} onChange={handleChange} required rows={2} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>İl</label>
              <input name="city" value={form.city} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>İlçe</label>
              <input name="district" value={form.district} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Posta Kodu</label>
              <input name="zipCode" value={form.zipCode} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Sipariş Notu (Opsiyonel)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
          </div>
          <button type="submit" className="btn-primary submit-btn" disabled={loading}>
            {loading ? 'İşleniyor...' : 'Siparişi Ver'}
          </button>
        </form>

        <div className="order-summary card">
          <h3>Sipariş Özeti</h3>
          {cartItems.map((item) => (
            <div key={item._id} className="order-item">
              <span>{item.name} x{item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)} ₺</span>
            </div>
          ))}
          <hr />
          <div className="order-item"><span>Kargo</span><span>{shippingPrice === 0 ? 'Ücretsiz' : `${shippingPrice} ₺`}</span></div>
          <div className="order-total"><span>Toplam</span><span>{(totalPrice + shippingPrice).toFixed(2)} ₺</span></div>
        </div>
      </div>
    </div>
  );
}
