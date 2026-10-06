import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Cart.css";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="empty" style={{ padding: "80px 0" }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🛒</p>
        <h2>Sepetiniz boş</h2>
        <Link
          to="/products"
          className="btn-primary"
          style={{
            display: "inline-block",
            marginTop: 20,
            textDecoration: "none",
          }}
        >
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  const FREE_SHIPPING_THRESHOLD = 2000;
  const shippingPrice = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : 100; // 2000 TL üzeri ücretsiz kargo

  return (
    <div className="container cart-page">
      <h1 className="cart-title">Sepetim ({cartItems.length} ürün)</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => {
            const unitPrice = item.price + (item.giftWrapPrice || 0);
            return (
              <div
                key={`${item._id}-${item.giftWrap ? "gift" : "normal"}`}
                className="cart-item card"
              >
                <img src={item.image || "/placeholder.png"} alt={item.name} />
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>
                    {item.price.toFixed(2)} ₺{" "}
                    <span className="vat-note">KDV dahil</span>
                  </p>
                  {item.giftWrap && (
                    <span className="gift-wrap-badge">
                      🎁 Hediye Paketi (+{item.giftWrapPrice.toFixed(2)} ₺)
                    </span>
                  )}
                </div>
                <div className="item-qty">
                  <button
                    onClick={() =>
                      updateQuantity(item._id, item.quantity - 1, item.giftWrap)
                    }
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item._id, item.quantity + 1, item.giftWrap)
                    }
                  >
                    +
                  </button>
                </div>
                <div className="item-total">
                  {(unitPrice * item.quantity).toFixed(2)} ₺
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item._id, item.giftWrap)}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <div className="cart-summary card">
          <h3>Sipariş Özeti</h3>
          <div className="summary-row">
            <span>Ürünler (KDV dahil)</span>
            <span>{totalPrice.toFixed(2)} ₺</span>
          </div>
          <div className="summary-row">
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
          <div className="summary-total">
            <span>
              Toplam <span className="vat-note">KDV dahil</span>
            </span>
            <span>{(totalPrice + shippingPrice).toFixed(2)} ₺</span>
          </div>
          <button
            className="btn-primary checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Siparişi Tamamla →
          </button>
        </div>
      </div>
    </div>
  );
}
