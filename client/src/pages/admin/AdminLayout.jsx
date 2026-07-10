import { NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import "./AdminLayout.css";

export default function AdminLayout({ children, title }) {
  const [newOrders, setNewOrders] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastCountRef = useRef(null);

  useEffect(() => {
    const checkOrders = async () => {
      try {
        const { data } = await api.get("/orders");
        const bekleyenler = data.filter((o) => o.status === "beklemede").length;

        // İlk yüklemede sadece sayıyı kaydet
        if (lastCountRef.current === null) {
          lastCountRef.current = bekleyenler;
          setNewOrders(bekleyenler);
          return;
        }

        // Yeni sipariş geldiyse tarayıcı bildirimi gönder
        if (bekleyenler > lastCountRef.current) {
          const fark = bekleyenler - lastCountRef.current;
          setNewOrders(bekleyenler);
          lastCountRef.current = bekleyenler;

          if (Notification.permission === "granted") {
            new Notification("🛒 Yeni Sipariş!", {
              body: `${fark} yeni sipariş geldi!`,
              icon: "/logo.png",
            });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((perm) => {
              if (perm === "granted") {
                new Notification("🛒 Yeni Sipariş!", {
                  body: `${fark} yeni sipariş geldi!`,
                  icon: "/logo.png",
                });
              }
            });
          }
        } else {
          setNewOrders(bekleyenler);
          lastCountRef.current = bekleyenler;
        }
      } catch {}
    };

    // Bildirim izni iste
    if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }

    checkOrders();
    const interval = setInterval(checkOrders, 60000); // Her 1 dakikada kontrol et
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-layout">
      {/* Mobilde sidebar'ı açıp kapatan hamburger buton */}
      <button
        className="admin-menu-toggle"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Menüyü aç/kapat"
      >
        {menuOpen ? "✕" : "☰"} Menü
      </button>

      {/* Mobilde sidebar açıkken arkayı karartan katman */}
      {menuOpen && (
        <div className="admin-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`admin-sidebar ${menuOpen ? "open" : ""}`}>
        <h2>⚙️ Admin Panel</h2>
        <nav onClick={() => setMenuOpen(false)}>
          <NavLink to="/admin" end>
            📊 Dashboard
          </NavLink>
          <NavLink to="/admin/products">📦 Ürünler</NavLink>
          <NavLink to="/admin/orders">
            🛒 Siparişler
            {newOrders > 0 && <span className="order-badge">{newOrders}</span>}
          </NavLink>
          <NavLink to="/admin/users">👥 Kullanıcılar</NavLink>
          <NavLink to="/admin/categories">🏷️ Kategoriler</NavLink>
          <NavLink to="/admin/upsell">🎁 Kasa Önü</NavLink>
          <NavLink to="/admin/coupons">🎟 Kuponlar</NavLink>
          <NavLink to="/admin/payment-reports">💳 Ödeme Raporları</NavLink>
        </nav>
      </aside>
      <main className="admin-main">
        <h1 className="admin-title">{title}</h1>
        {children}
      </main>
    </div>
  );
}
