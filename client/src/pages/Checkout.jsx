import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-toastify";
import turkiyeIller from "../data/turkiye-iller";
import "./Checkout.css";

export default function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // PayTR ödeme aşaması
  const [step, setStep] = useState("form");
  const [paytrToken, setPaytrToken] = useState(null);

  // Fatura adresi: varsayılan olarak teslimat adresi ile aynı
  const [sameAddress, setSameAddress] = useState(true);
  const [invoiceAddress, setInvoiceAddress] = useState({
    street: "",
    city: "",
    district: "",
    zipCode: "",
  });

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    street: "",
    city: "",
    district: "",
    zipCode: "",
    notes: "",
    // Fatura bilgileri (opsiyonel)
    tcKimlikNo: "",
    vergiNo: "",
    vergiDairesi: "",
  });

  // Statik Türkiye il/ilçe listesi
  const states = Object.keys(turkiyeIller);

  // Seçilen ile ait ilçeler
  const cities = form.city ? turkiyeIller[form.city] || [] : [];

  // Fatura adresi için seçilen ile ait ilçeler
  const invoiceCities = invoiceAddress.city
    ? turkiyeIller[invoiceAddress.city] || []
    : [];

  // --------------------------------------------------
  // Kullanıcı profil bilgilerini getir
  // --------------------------------------------------
  useEffect(() => {
    api
      .get("/auth/profile")
      .then(({ data }) => {
        const profileCity = data.address?.city || "";
        const profileDistrict = data.address?.district || "";

        // Profildeki il gerçekten statik listede varsa kullan
        const validCity = states.includes(profileCity) ? profileCity : "";

        // Profildeki ilçe seçilen ile aitse kullan
        const validDistrict =
          validCity && turkiyeIller[validCity]?.includes(profileDistrict)
            ? profileDistrict
            : "";

        setForm((f) => ({
          ...f,
          name: data.name || "",
          phone: data.phone || "",
          street: data.address?.street || "",
          zipCode: data.address?.zipCode || "",
          city: validCity,
          district: validDistrict,
          tcKimlikNo: data.tcKimlikNo || "",
          vergiNo: data.vergiNo || "",
          vergiDairesi: data.vergiDairesi || "",
        }));
      })
      .catch(() => {});
  }, []);

  // --------------------------------------------------
  // PayTR iframe script
  // --------------------------------------------------
  useEffect(() => {
    if (step !== "payment") return;

    const script = document.createElement("script");
    script.src = "https://www.paytr.com/js/iframeResizer.min.js";
    script.async = true;

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [step]);

  // --------------------------------------------------
  // Kargo hesaplama
  // --------------------------------------------------
  const FREE_SHIPPING_THRESHOLD = 2000;

  const shippingPrice = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 100;

  const discountAmount = couponApplied ? (totalPrice * discount) / 100 : 0;

  const finalTotal = totalPrice - discountAmount + shippingPrice;

  // --------------------------------------------------
  // Form değişiklikleri
  // --------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  // Sadece rakam kabul eden, uzunluk sınırlı alanlar (TC / vergi no)
  const handleDigits = (name, maxLen) => (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // İl seçimi
  // --------------------------------------------------
  const handleStateChange = (e) => {
    const cityName = e.target.value;

    setForm((f) => ({
      ...f,
      city: cityName,
      district: "",
    }));
  };

  // --------------------------------------------------
  // İlçe seçimi
  // --------------------------------------------------
  const handleCityChange = (e) => {
    const districtName = e.target.value;

    setForm((f) => ({
      ...f,
      district: districtName,
    }));
  };

  // --------------------------------------------------
  // Fatura adresi değişiklikleri
  // --------------------------------------------------
  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceAddress((a) => ({ ...a, [name]: value }));
  };

  const handleInvoiceStateChange = (e) => {
    const cityName = e.target.value;
    setInvoiceAddress((a) => ({ ...a, city: cityName, district: "" }));
  };

  // --------------------------------------------------
  // Kupon
  // --------------------------------------------------
  const handleCoupon = async () => {
    if (!couponCode.trim()) {
      return toast.warn("Kupon kodu girin");
    }

    if (couponApplied) {
      return toast.warn("Zaten bir kupon uygulandı");
    }

    setCouponLoading(true);

    try {
      const { data } = await api.post("/coupons/validate", {
        code: couponCode.trim().toUpperCase(),
        cartItems: cartItems.map((item) => ({
          _id: item._id,
          quantity: item.quantity,
        })),
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

  // --------------------------------------------------
  // Sipariş oluştur
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      return toast.error("Sepet boş");
    }

    if (!form.city || !form.district) {
      return toast.error("Lütfen il ve ilçe seçiniz");
    }

    // Opsiyonel alanlar: boşsa geç, doluysa hane sayısını kontrol et
    if (form.tcKimlikNo && form.tcKimlikNo.length !== 11) {
      return toast.error("TC kimlik numarası 11 haneli olmalıdır");
    }
    if (form.vergiNo && form.vergiNo.length !== 10) {
      return toast.error("Vergi numarası 10 haneli olmalıdır");
    }

    // Fatura adresi farklıysa zorunlu alanları kontrol et
    if (
      !sameAddress &&
      (!invoiceAddress.street.trim() ||
        !invoiceAddress.city ||
        !invoiceAddress.district)
    ) {
      return toast.error("Lütfen fatura adresini eksiksiz doldurunuz");
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

      // notes ve fatura bilgileri shippingAddress içine gönderilmez
      const { notes, tcKimlikNo, vergiNo, vergiDairesi, ...shippingAddress } =
        form;

      // 1. Siparişi oluştur
      const { data: order } = await api.post("/orders", {
        orderItems,
        shippingAddress,
        invoiceInfo: {
          tcKimlikNo,
          vergiNo,
          vergiDairesi,
          sameAsShipping: sameAddress,
          address: sameAddress ? undefined : invoiceAddress,
        },
        itemsPrice: totalPrice,
        discountAmount,
        totalPrice: finalTotal,
        couponCode: couponApplied ? couponCode.trim().toUpperCase() : null,
        notes,
      });

      // 2. PayTR ödeme token'ı al
      const { data: paymentData } = await api.post("/payment/init", {
        orderId: order._id,
      });

      // 3. Sepeti temizle
      clearCart();

      // 4. PayTR ekranına geç
      setPaytrToken(paymentData.token);
      setStep("payment");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sipariş oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // PAYTR ÖDEME EKRANI
  // --------------------------------------------------
  if (step === "payment" && paytrToken) {
    return (
      <div className="container checkout-page">
        <h1>Ödeme</h1>

        <div
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
          }}
        >
          <iframe
            src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
            id="paytriframe"
            frameBorder="0"
            scrolling="no"
            style={{
              width: "100%",
              minHeight: "600px",
            }}
            title="PayTR Ödeme"
          />
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // CHECKOUT FORMU
  // --------------------------------------------------
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
            {/* İL */}
            <div className="form-group">
              <label>İl</label>

              <select
                name="city"
                value={form.city}
                onChange={handleStateChange}
                required
              >
                <option value="">İl seçiniz</option>

                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* İLÇE */}
            <div className="form-group">
              <label>İlçe</label>

              <select
                name="district"
                value={form.district}
                onChange={handleCityChange}
                required
                disabled={!form.city}
              >
                <option value="">
                  {!form.city ? "Önce il seçiniz" : "İlçe seçiniz"}
                </option>

                {cities.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            {/* POSTA KODU */}
            <div className="form-group">
              <label>Posta Kodu</label>

              <input
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* FATURA BİLGİLERİ (OPSİYONEL) */}
          <p className="settings-hint" style={{ margin: "8px 0" }}>
            Fatura bilgileri (opsiyonel)
          </p>

          <div className="form-row">
            <div className="form-group">
              <label>TC Kimlik No</label>

              <input
                name="tcKimlikNo"
                value={form.tcKimlikNo}
                onChange={handleDigits("tcKimlikNo", 11)}
                inputMode="numeric"
                maxLength={11}
                placeholder="11 haneli"
              />
            </div>

            <div className="form-group">
              <label>Vergi No</label>

              <input
                name="vergiNo"
                value={form.vergiNo}
                onChange={handleDigits("vergiNo", 10)}
                inputMode="numeric"
                maxLength={10}
                placeholder="10 haneli"
              />
            </div>

            <div className="form-group">
              <label>Vergi Dairesi</label>

              <input
                name="vergiDairesi"
                value={form.vergiDairesi}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* FATURA ADRESİ */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: "8px 0",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={sameAddress}
              onChange={(e) => setSameAddress(e.target.checked)}
              style={{ width: "auto" }}
            />
            Fatura adresim teslimat adresi ile aynı
          </label>

          {!sameAddress && (
            <>
              <div className="form-group">
                <label>Fatura Adresi</label>

                <textarea
                  name="street"
                  value={invoiceAddress.street}
                  onChange={handleInvoiceChange}
                  required
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>İl</label>

                  <select
                    name="city"
                    value={invoiceAddress.city}
                    onChange={handleInvoiceStateChange}
                    required
                  >
                    <option value="">İl seçiniz</option>

                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>İlçe</label>

                  <select
                    name="district"
                    value={invoiceAddress.district}
                    onChange={handleInvoiceChange}
                    required
                    disabled={!invoiceAddress.city}
                  >
                    <option value="">
                      {!invoiceAddress.city
                        ? "Önce il seçiniz"
                        : "İlçe seçiniz"}
                    </option>

                    {invoiceCities.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Posta Kodu</label>

                  <input
                    name="zipCode"
                    value={invoiceAddress.zipCode}
                    onChange={handleInvoiceChange}
                  />
                </div>
              </div>
            </>
          )}

          {/* SİPARİŞ NOTU */}
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

        {/* ------------------------------------------ */}
        {/* SİPARİŞ ÖZETİ */}
        {/* ------------------------------------------ */}

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

          {/* KUPON */}
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

          {/* ARA TOPLAM */}
          <div className="order-item">
            <span>Ara Toplam</span>

            <span>{totalPrice.toFixed(2)} ₺</span>
          </div>

          {/* İNDİRİM */}
          {couponApplied && (
            <div className="order-item discount-row">
              <span>İndirim (%{discount})</span>

              <span>-{discountAmount.toFixed(2)} ₺</span>
            </div>
          )}

          {/* KARGO */}
          <div className="order-item">
            <span>Kargo</span>

            <span>
              {shippingPrice === 0
                ? "Ücretsiz"
                : `${shippingPrice.toFixed(2)} ₺`}
            </span>
          </div>

          {/* ÜCRETSİZ KARGO UYARISI */}
          {shippingPrice > 0 && (
            <p
              className="free-shipping-hint"
              style={{
                fontSize: 13,
                color: "#666",
              }}
            >
              💡 {(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2)} ₺ daha
              alışveriş yapın, kargo ücretsiz olsun!
            </p>
          )}

          {/* GENEL TOPLAM */}
          <div className="order-total">
            <span>Toplam</span>

            <span>{finalTotal.toFixed(2)} ₺</span>
          </div>
        </div>
      </div>
    </div>
  );
}
