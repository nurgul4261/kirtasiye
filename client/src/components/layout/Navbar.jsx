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
    <>
      {/* Kargo Bedava Şeridi */}
      <div className="free-shipping-bar">
        <div className="free-shipping-track">
          <div className="free-shipping-set">
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
          </div>
          <div className="free-shipping-set">
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
            <span>🚚 2000 TL ve Üzeri Alışverişlerde Kargo Bedava!</span>
          </div>
        </div>
      </div>

      <nav className="navbar">
        <div className="container navbar-inner">
          {/* Logo görseli yerine metin tabanlı marka ismi eklendi */}
          <Link to="/" className="navbar-brand">
            <img
              src="/logo.png"
              alt="Kovan Kırtasiye"
              className="navbar-logo"
            />
            <span className="navbar-brand-text">Kovan Kırtasiye</span>
          </Link>
          <div className="navbar-links">
            <Link to="/products">Ürünler</Link>
            {user?.isAdmin && <Link to="/admin">Admin Panel</Link>}
          </div>
          <div className="navbar-actions">
            <Link to="/cart" className="cart-btn">
              🛒
              {totalItems > 0 && (
                <span className="cart-count">{totalItems}</span>
              )}
            </Link>
            {user ? (
              <div className="user-menu">
                <Link to="/profile" className="profile-link">
                  👤 {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-outline logout-btn"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="login-btn" // btn-primary yerine yeni sınıfımız
              >
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
