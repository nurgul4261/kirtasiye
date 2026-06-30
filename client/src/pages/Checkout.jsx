import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-toastify";
import turkiyeIller from "../data/turkiye-iller";
import "./Checkout.css";

export default function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    street: "",
    city: "",
    district: "",
    zipCode: "",
    notes: "",
  });

  // Seçili ile göre ilçe listesi
  const ilceler = form.city ? turkiyeIller[form.city] || [] : [];

  useEffect(() => {
    api
      .get("/auth/profile")
      .then(({ data }) => {
        setForm((f) => ({
          ...f,
          name: data.name || "",
          phone: data.phone || "",
          street: data.address?.street || "",
          city: data.address?.city || "",
          district: data.address?.district || "",
          zipCode: data.address?.zipCode || "",
        }));
      })
      .catch(() => {});
  }, []);

  const shippingPrice = 0; // Kargo ücreti kaldırıldı, her zaman ücretsiz
  const discountAmount = couponApplied ? (totalPrice * discount) / 100 : 0;
  const finalTotal = totalPrice - discountAmount + shippingPrice;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // İl değişince ilçeyi sıfırla
    if (name === "city") {
      setForm((f) => ({ ...f, city: value, district: "" }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleCoupon = async () => {
    if (!couponCode.trim()) return toast.warn("Kupon kodu girin");
    if (couponApplied) return toast.warn("Zaten bir kupon uygulandı");
    setCouponLoading(true);
    try {
      const { data } = await api.post("/coupons/validate", {
        code: couponCode,
        cartItems: cartItems.map((i) => ({ _id: i._id, quantity: i.quantity })),
      });
      setDiscount(data.discountPercent);
      setCouponApplied(true);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Kupon geçersiz");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setDiscount(0);
    setCouponCode("");
    toast.info("Kupon kaldırıldı");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error("Sepet boş");
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
      await api.post("/orders", {
        orderItems,
        shippingAddress,
        itemsPrice: totalPrice,
        shippingPrice,
        discountAmount,
        totalPrice: finalTotal,
        couponCode: couponApplied ? couponCode.toUpperCase() : null,
        notes,
      });
      clearCart();
      toast.success("Siparişiniz alındı! Teşekkürler 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sipariş oluşturulamadı");
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
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Telefon</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Adres</label>
            <textarea
              name="street"
              value={form.street}
              onChange={handleChange}
              required
              rows={2}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>İl</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              >
                <option value="">İl seçiniz</option>
                {Object.keys(turkiyeIller)
                  .sort()
                  .map((il) => (
                    <option key={il} value={il}>
                      {il}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>İlçe</label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                required
                disabled={!form.city}
              >
                <option value="">
                  {form.city ? "İlçe seçiniz" : "Önce il seçiniz"}
                </option>
                {ilceler.map((ilce) => (
                  <option key={ilce} value={ilce}>
                    {ilce}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Posta Kodu</label>
              <input
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Sipariş Notu (Opsiyonel)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
            />
          </div>
          <button
            type="submit"
            className="btn-primary submit-btn"
            disabled={loading}
          >
            {loading ? "İşleniyor..." : "Siparişi Ver"}
          </button>
        </form>

        <div className="order-summary card">
          <h3>Sipariş Özeti</h3>
          {cartItems.map((item) => (
            <div key={item._id} className="order-item">
              <span>
                {item.name} x{item.quantity}
              </span>
              <span>{(item.price * item.quantity).toFixed(2)} ₺</span>
            </div>
          ))}
          <hr />

          <div className="coupon-section">
            {!couponApplied ? (
              <div className="coupon-input-row">
                <input
                  type="text"
                  placeholder="Kupon kodu"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="coupon-input"
                />
                <button
                  type="button"
                  className="coupon-btn"
                  onClick={handleCoupon}
                  disabled={couponLoading}
                >
                  {couponLoading ? "..." : "Uygula"}
                </button>
              </div>
            ) : (
              <div className="coupon-applied">
                <span>🎉 %{discount} indirim uygulandı</span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="coupon-remove"
                >
                  ✕
                </button>
              </div>
            )}
            {!cartItems.some((i) => i.quantity >= 20) && (
              <p className="coupon-hint">
                💡 Aynı üründen 20+ adet alımda kupon kullanabilirsiniz
              </p>
            )}
          </div>

          <hr />
          <div className="order-item">
            <span>Ara Toplam</span>
            <span>{totalPrice.toFixed(2)} ₺</span>
          </div>
          {couponApplied && (
            <div className="order-item discount-row">
              <span>İndirim (%{discount})</span>
              <span>-{discountAmount.toFixed(2)} ₺</span>
            </div>
          )}
          <div className="order-total">
            <span>Toplam</span>
            <span>{finalTotal.toFixed(2)} ₺</span>
          </div>
        </div>
      </div>
    </div>
  );
}
