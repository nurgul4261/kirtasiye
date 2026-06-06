import { NavLink } from "react-router-dom";
import "./AdminLayout.css";

export default function AdminLayout({ children, title }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>⚙️ Admin Panel</h2>
        <nav>
          <NavLink to="/admin" end>
            📊 Dashboard
          </NavLink>
          <NavLink to="/admin/products">📦 Ürünler</NavLink>
          <NavLink to="/admin/orders">🛒 Siparişler</NavLink>
          <NavLink to="/admin/users">👥 Kullanıcılar</NavLink>
          <NavLink to="/admin/categories">🏷️ Kategoriler</NavLink>
          <NavLink to="/admin/upsell">🎁 Kasa Önü</NavLink>
          <NavLink to="/admin/coupons">🎟 Kuponlar</NavLink>
        </nav>
      </aside>
      <main className="admin-main">
        <h1 className="admin-title">{title}</h1>
        {children}
      </main>
    </div>
  );
}
