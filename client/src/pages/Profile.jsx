import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-toastify";
import "./Profile.css";

const statusLabel = {
  beklemede: { label: "Beklemede", color: "badge-warning", icon: "⏳" },
  onaylandi: { label: "Onaylandı", color: "badge-primary", icon: "✅" },
  kargoda: { label: "Kargoda", color: "badge-primary", icon: "🚚" },
  teslim_edildi: { label: "Teslim Edildi", color: "badge-success", icon: "📦" },
  iptal_edildi: { label: "İptal Edildi", color: "badge-danger", icon: "❌" },
};

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "",
    district: "",
    zipCode: "",
    password: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/orders/myorders")
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));

    api
      .get("/auth/profile")
      .then(({ data }) => {
        setForm((f) => ({
          ...f,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          street: data.address?.street || "",
          city: data.address?.city || "",
          district: data.address?.district || "",
          zipCode: data.address?.zipCode || "",
        }));
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      return toast.error("Şifreler eşleşmiyor");
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          district: form.district,
          zipCode: form.zipCode,
        },
      };
      if (form.password) payload.password = form.password;
      const { data } = await api.put("/auth/profile", payload);
      updateUser(data);
      toast.success("Profil güncellendi");
      setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Güncelleme hatası");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="container">
          <div className="profile-hero">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1>{user?.name}</h1>
              <p>{user?.email}</p>
              {user?.isAdmin && (
                <span className="badge badge-warning">Admin</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container profile-layout">
        <aside className="profile-sidebar">
          <nav className="profile-nav">
            <button
              className={tab === "orders" ? "active" : ""}
              onClick={() => setTab("orders")}
            >
              📦 Siparişlerim
            </button>
            <button
              className={tab === "settings" ? "active" : ""}
              onClick={() => setTab("settings")}
            >
              ⚙️ Hesap Ayarları
            </button>
            {user?.isAdmin && (
              <Link to="/admin" className="admin-link">
                🛡️ Admin Panel
              </Link>
            )}
            <button className="logout-btn-profile" onClick={logout}>
              🚪 Çıkış Yap
            </button>
          </nav>
        </aside>

        <div className="profile-content">
          {tab === "orders" && (
            <div>
              <h2>Siparişlerim</h2>
              {loadingOrders ? (
                <div className="loading">Yükleniyor...</div>
              ) : orders.length === 0 ? (
                <div className="empty-orders card">
                  <p>📭</p>
                  <h3>Henüz sipariş yok</h3>
                  <p>İlk alışverişini yapmak için ürünlerimize göz at!</p>
                  <Link
                    to="/products"
                    className="btn-primary"
                    style={{
                      textDecoration: "none",
                      display: "inline-block",
                      marginTop: 16,
                    }}
                  >
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-card card">
                      <div className="order-card-header">
                        <div>
                          <span className="order-no">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="order-date">
                            {new Date(order.createdAt).toLocaleDateString(
                              "tr-TR",
                            )}
                          </span>
                        </div>
                        <span
                          className={`badge ${statusLabel[order.status]?.color}`}
                        >
                          {statusLabel[order.status]?.icon}{" "}
                          {statusLabel[order.status]?.label}
                        </span>
                      </div>

                      <div className="order-steps">
                        {[
                          "beklemede",
                          "onaylandi",
                          "kargoda",
                          "teslim_edildi",
                        ].map((step, i) => {
                          const steps = [
                            "beklemede",
                            "onaylandi",
                            "kargoda",
                            "teslim_edildi",
                          ];
                          const currentIndex = steps.indexOf(order.status);
                          const isDone =
                            i <= currentIndex &&
                            order.status !== "iptal_edildi";
                          const isCancelled = order.status === "iptal_edildi";
                          return (
                            <div
                              key={step}
                              className={`step ${isDone ? "done" : ""} ${isCancelled ? "cancelled" : ""}`}
                            >
                              <div className="step-dot"></div>
                              <span>
                                {
                                  [
                                    "Sipariş Alındı",
                                    "Onaylandı",
                                    "Kargoya Verildi",
                                    "Teslim Edildi",
                                  ][i]
                                }
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="order-items-preview">
                        {order.orderItems.map((item, i) => (
                          <div key={i} className="order-item-row">
                            <span>
                              {item.name} x{item.quantity}
                            </span>
                            <span>
                              {(item.price * item.quantity).toFixed(2)} ₺
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="order-card-footer">
                        <div className="order-address">
                          <small>
                            📍 {order.shippingAddress.city},{" "}
                            {order.shippingAddress.district}
                          </small>
                        </div>
                        <div className="order-total-badge">
                          Toplam:{" "}
                          <strong>{order.totalPrice.toFixed(2)} ₺</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "settings" && (
            <div>
              <h2>Hesap Ayarları</h2>
              <div className="card settings-card">
                <form onSubmit={handleSave}>
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
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Telefon</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="05xx xxx xx xx"
                    />
                  </div>
                  <div className="form-group">
                    <label>Adres</label>
                    <textarea
                      name="street"
                      value={form.street}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Mahalle, sokak, bina no..."
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>İl</label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>İlçe</label>
                      <input
                        name="district"
                        value={form.district}
                        onChange={handleChange}
                      />
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
                  <hr className="settings-divider" />
                  <p className="settings-hint">
                    Şifre değiştirmek istemiyorsan boş bırak
                  </p>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Yeni Şifre</label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="form-group">
                      <label>Şifre Tekrar</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary save-btn"
                    disabled={saving}
                  >
                    {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
