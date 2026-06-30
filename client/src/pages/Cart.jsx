import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import "./Cart.css";

function UpsellSection({ cartItems, addToCart }) {
  const [upsells, setUpsells] = useState([]);

  useEffect(() => {
    const ids = cartItems.map((i) => i._id);
    if (!ids.length) return;
    axios
      .post("/api/upsell/cart", { product_ids: ids })
      .then((r) => setUpsells(r.data))
      .catch(() => {});
  }, [cartItems]);

  if (!upsells.length) return null;

  return (
    <div className="upsell-section">
      <h3>🎁 Bunları da almak ister misiniz?</h3>
      <div className="upsell-grid">
        {upsells.map((p) => (
          <div className="upsell-card" key={p.id}>
            <img src={p.image || "/placeholder.png"} alt={p.name} />
            <span className="upsell-name">{p.name}</span>
            <span className="upsell-price">{Number(p.price).toFixed(2)} ₺</span>
            <button onClick={() => addToCart({ ...p, _id: p.id })}>
              + Sepete Ekle
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, addToCart } =
    useCart();
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

  const shippingPrice = 0; // Kargo ücreti kaldırıldı, her zaman ücretsiz

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
                  <p>{item.price.toFixed(2)} ₺</p>
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

          <UpsellSection cartItems={cartItems} addToCart={addToCart} />
        </div>

        <div className="cart-summary card">
          <h3>Sipariş Özeti</h3>
          <div className="summary-row">
            <span>Ürünler</span>
            <span>{totalPrice.toFixed(2)} ₺</span>
          </div>
          <div className="summary-total">
            <span>Toplam</span>
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
