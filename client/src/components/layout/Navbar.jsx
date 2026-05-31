import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo görseli yerine metin tabanlı marka ismi eklendi */}
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-text">Kovan Kırtasiye</span>
        </Link>
        <div className="navbar-links">
          <Link to="/products">Ürünler</Link>
          <Link to="/contact">İletişim</Link>
          {user?.isAdmin && <Link to="/admin">Admin Panel</Link>}
        </div>
        <div className="navbar-actions">
          <Link to="/cart" className="cart-btn">
            🛒 Sepet
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </Link>
          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="profile-link">
                👤 {user.name}
              </Link>
              <button onClick={handleLogout} className="btn-outline logout-btn">
                Çıkış
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-primary"
              style={{
                padding: "8px 18px",
                borderRadius: 4,
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
