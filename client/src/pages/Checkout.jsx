import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-toastify";
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

  // ── PayTR ödeme aşaması ──
  const [step, setStep] = useState("form"); // 'form' | 'payment'
  const [paytrToken, setPaytrToken] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    street: "",
    city: "",
    district: "",
    zipCode: "",
    notes: "",
    // Kargonomi'nin kendi il/ilçe ID sistemi — kargo gönderisi oluşturulurken
    // (backend tarafında) buyer_state_id / buyer_city_id olarak kullanılır.
    // NOT: Kargonomi'de "states" = il, "cities" = ilçe (isimlendirme ters).
    kargonomiStateId: null,
    kargonomiCityId: null,
  });

  // İl / ilçe listeleri artık statik dosyadan değil, Kargonomi'den
  // (backend proxy'si üzerinden) çekiliyor — böylece seçilen ID'ler
  // Kargonomi'nin beklediği ID'lerle birebir eşleşiyor.
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    api
      .get("/locations/states")
      .then(({ data }) => {
        setStates(data?.data || data || []);
      })
      .catch(() => {
        toast.error("İl listesi yüklenemedi, sayfayı yenilemeyi deneyin");
      })
      .finally(() => setLoadingStates(false));
  }, []);

  useEffect(() => {
    if (!form.kargonomiStateId) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    api
      .get(`/locations/cities/${form.kargonomiStateId}`)
      .then(({ data }) => {
        setCities(data?.data || data || []);
      })
      .catch(() => {
        toast.error("İlçe listesi yüklenemedi");
      })
      .finally(() => setLoadingCities(false));
  }, [form.kargonomiStateId]);

  useEffect(() => {
    api
      .get("/auth/profile")
      .then(({ data }) => {
        setForm((f) => ({
          ...f,
          name: data.name || "",
          phone: data.phone || "",
          street: data.address?.street || "",
          zipCode: data.address?.zipCode || "",
          // Not: kayıtlı profil adresi varsa il/ilçe isimlerini gösterebiliriz
          // ama Kargonomi ID eşleşmesi olmadığı için kullanıcının il/ilçeyi
          // formdan tekrar seçmesi gerekiyor (aşağıdaki selectler boş başlar).
        }));
      })
      .catch(() => {});
  }, []);

  // PayTR iframe boyutlandırma script'ini sadece ödeme adımında yükle
  useEffect(() => {
    if (step !== "payment") return;
    const script = document.createElement("script");
    script.src = "https://www.paytr.com/js/iframeResizer.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [step]);

  const FREE_SHIPPING_THRESHOLD = 2000;
  const shippingPrice = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 100; // 2000 TL üzeri ücretsiz kargo
  const discountAmount = couponApplied ? (totalPrice * discount) / 100 : 0;
  const finalTotal = totalPrice - discountAmount + shippingPrice;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleStateChange = (e) => {
    const stateId = e.target.value ? Number(e.target.value) : null;
    const stateName =
      states.find((s) => String(s.id) === e.target.value)?.name || "";
    setForm((f) => ({
      ...f,
      city: stateName,
      district: "",
      kargonomiStateId: stateId,
      kargonomiCityId: null,
    }));
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value ? Number(e.target.value) : null;
    const cityName =
      cities.find((c) => String(c.id) === e.target.value)?.name || "";
    setForm((f) => ({
      ...f,
      district: cityName,
      kargonomiCityId: cityId,
    }));
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
    if (!form.kargonomiStateId || !form.kargonomiCityId) {
      return toast.error("Lütfen il ve ilçe seçiniz");
    }
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

      // 1) Siparişi oluştur (stok bu adımda düşer)
      // Not: shippingPrice artık backend'de sabit belirleniyor, burada
      // gönderilse de sunucu tarafında dikkate alınmıyor (güvenlik).
      const { data: order } = await api.post("/orders", {
        orderItems,
        shippingAddress,
        itemsPrice: totalPrice,
        discountAmount,
        totalPrice: finalTotal,
        couponCode: couponApplied ? couponCode.toUpperCase() : null,
        notes,
      });

      // 2) PayTR ödeme token'ını iste
      const { data: paymentData } = await api.post("/payment/init", {
        orderId: order._id,
      });

      clearCart();
      setPaytrToken(paymentData.token);
      setStep("payment");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sipariş oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  // ── Ödeme adımı: PayTR iframe'i göster ──
  if (step === "payment" && paytrToken) {
    return (
      <div className="container checkout-page">
        <h1>Ödeme</h1>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <iframe
            src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
            id="paytriframe"
            frameBorder="0"
            scrolling="no"
            style={{ width: "100%", minHeight: "600px" }}
            title="PayTR Ödeme"
          ></iframe>
        </div>
      </div>
    );
  }

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
                name="kargonomiStateId"
                value={form.kargonomiStateId ?? ""}
                onChange={handleStateChange}
                disabled={loadingStates}
                required
              >
                <option value="">
                  {loadingStates ? "Yükleniyor..." : "İl seçiniz"}
                </option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>İlçe</label>
              <select
                name="kargonomiCityId"
                value={form.kargonomiCityId ?? ""}
                onChange={handleCityChange}
                required
                disabled={!form.kargonomiStateId || loadingCities}
              >
                <option value="">
                  {!form.kargonomiStateId
                    ? "Önce il seçiniz"
                    : loadingCities
                      ? "Yükleniyor..."
                      : "İlçe seçiniz"}
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
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
            {loading ? "İşleniyor..." : "Siparişi Ver ve Ödemeye Geç"}
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
          <div className="order-item">
            <span>Kargo</span>
            <span>
              {shippingPrice === 0
                ? "Ücretsiz"
                : `${shippingPrice.toFixed(2)} ₺`}
            </span>
          </div>
          {shippingPrice > 0 && (
            <p
              className="free-shipping-hint"
              style={{ fontSize: 13, color: "#666" }}
            >
              💡 {(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2)} ₺ daha
              alışveriş yapın, kargo ücretsiz olsun!
            </p>
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
