import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { toast } from "react-toastify";
import "./Cart.css";

export default function Cart() {
  const { cartItems, totalPrice, removeFromCart, updateQuantity, clearCart } =
    useCart();

  const navigate = useNavigate();

  const [upsells, setUpsells] = useState([]);
  const [upsellLoading, setUpsellLoading] = useState(false);

  // --------------------------------------------------
  // Sepetteki ürünlere göre upsell ürünlerini getir
  // --------------------------------------------------
  useEffect(() => {
    const ids = cartItems.map((item) => item._id).filter(Boolean);

    if (ids.length === 0) {
      setUpsells([]);
      return;
    }

    setUpsellLoading(true);

    api
      .post("/upsell/cart", {
        product_ids: ids,
      })
      .then((response) => {
        const products = Array.isArray(response.data) ? response.data : [];

        setUpsells(products);
      })
      .catch(() => {
        // Upsell çalışmasa bile sepet çalışmaya devam etsin
        setUpsells([]);
      })
      .finally(() => {
        setUpsellLoading(false);
      });
  }, [cartItems]);

  // --------------------------------------------------
  // Miktar değiştirme
  // --------------------------------------------------
  const handleQuantityChange = (id, quantity) => {
    const newQuantity = Number(quantity);

    if (!Number.isFinite(newQuantity) || newQuantity < 1) {
      return;
    }

    updateQuantity(id, newQuantity);
  };

  // --------------------------------------------------
  // Checkout
  // --------------------------------------------------
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.warn("Sepetiniz boş");
      return;
    }

    navigate("/checkout");
  };

  // --------------------------------------------------
  // Sepet boş
  // --------------------------------------------------
  if (cartItems.length === 0) {
    return (
      <div className="container cart-page">
        <div className="empty-cart">
          <h2>Sepetiniz boş</h2>

          <p>Sepetinizde henüz ürün bulunmuyor.</p>

          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/products")}
          >
            Alışverişe Başla
          </button>
        </div>
      </div>
    );
  }

  const safeTotalPrice = Number(totalPrice) || 0;

  const shippingPrice = safeTotalPrice >= 2000 ? 0 : 100;

  const grandTotal = safeTotalPrice + shippingPrice;

  return (
    <div className="container cart-page">
      <h1>Sepetim</h1>

      <div className="cart-layout">
        {/* ------------------------------------------ */}
        {/* SEPET */}
        {/* ------------------------------------------ */}
        <div className="cart-items card">
          {cartItems.map((item) => {
            const itemPrice = Number(item.price) || 0;
            const itemQuantity = Number(item.quantity) || 1;
            const itemTotal = itemPrice * itemQuantity;

            return (
              <div key={item._id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="cart-item-info">
                  <h3>{item.name}</h3>

                  <p className="cart-item-price">{itemPrice.toFixed(2)} ₺</p>
                </div>

                <div className="cart-item-quantity">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuantityChange(item._id, itemQuantity - 1)
                    }
                    disabled={itemQuantity <= 1}
                    aria-label="Ürün miktarını azalt"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) =>
                      handleQuantityChange(item._id, e.target.value)
                    }
                    aria-label={`${item.name} miktarı`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleQuantityChange(item._id, itemQuantity + 1)
                    }
                    aria-label="Ürün miktarını artır"
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  <strong>{itemTotal.toFixed(2)} ₺</strong>
                </div>

                <button
                  type="button"
                  className="cart-remove"
                  onClick={() => removeFromCart(item._id)}
                  aria-label={`${item.name} ürününü sepetten kaldır`}
                >
                  ✕
                </button>
              </div>
            );
          })}

          <div className="cart-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/products")}
            >
              Alışverişe Devam Et
            </button>

            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                const confirmed = window.confirm(
                  "Sepeti tamamen temizlemek istediğinize emin misiniz?",
                );

                if (confirmed) {
                  clearCart();
                }
              }}
            >
              Sepeti Temizle
            </button>
          </div>
        </div>

        {/* ------------------------------------------ */}
        {/* SİPARİŞ ÖZETİ */}
        {/* ------------------------------------------ */}
        <div className="cart-summary card">
          <h2>Sipariş Özeti</h2>

          <div className="summary-row">
            <span>Ara Toplam</span>

            <strong>{safeTotalPrice.toFixed(2)} ₺</strong>
          </div>

          <div className="summary-row">
            <span>Kargo</span>

            <span>
              {shippingPrice === 0
                ? "Ücretsiz"
                : `${shippingPrice.toFixed(2)} ₺`}
            </span>
          </div>

          <hr />

          <div className="summary-row summary-total">
            <span>Toplam</span>

            <strong>{grandTotal.toFixed(2)} ₺</strong>
          </div>

          {safeTotalPrice < 2000 && (
            <p className="free-shipping-hint">
              💡 {(2000 - safeTotalPrice).toFixed(2)} ₺ daha alışveriş yapın,
              kargo ücretsiz olsun!
            </p>
          )}

          <button
            type="button"
            className="btn-primary checkout-btn"
            onClick={handleCheckout}
          >
            Siparişi Tamamla
          </button>
        </div>
      </div>

      {/* ------------------------------------------ */}
      {/* UPSELL */}
      {/* ------------------------------------------ */}
      {!upsellLoading && upsells.length > 0 && (
        <section className="upsell-section">
          <h2>Bunları da almak ister misiniz?</h2>

          <div className="upsell-grid">
            {upsells.map((product, index) => {
              const productId = product?._id;

              if (!productId) {
                return null;
              }

              return (
                <div
                  key={productId || `upsell-${index}`}
                  className="upsell-card"
                >
                  <img src={product.image} alt={product.name} />

                  <div className="upsell-info">
                    <h3>{product.name}</h3>

                    <p className="upsell-price">
                      {(Number(product.price) || 0).toFixed(2)} ₺
                    </p>

                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => navigate(`/product/${productId}`)}
                    >
                      Ürünü İncele
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
