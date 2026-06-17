import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() =>
    JSON.parse(localStorage.getItem("cart") || "[]"),
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    // stock undefined ise (normal kullanıcı) limit uygulanmaz
    const hasStockInfo = product.stock !== undefined;

    setCartItems((prev) => {
      const exists = prev.find((item) => item._id === product._id);

      if (exists) {
        const newQty = exists.quantity + quantity;

        if (hasStockInfo && newQty > product.stock) {
          toast.warn("Sepete ekleyebileceğiniz maksimum adede ulaştınız");
          return prev.map((item) =>
            item._id === product._id
              ? { ...item, quantity: product.stock }
              : item,
          );
        }

        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: newQty } : item,
        );
      }

      // Yeni ürün eklenirken stok yoksa engelle
      if (hasStockInfo && product.stock === 0) {
        toast.error(`${product.name} stokta yok`);
        return prev;
      }

      if (hasStockInfo && quantity > product.stock) {
        toast.warn("Sepete ekleyebileceğiniz maksimum adede ulaştınız");
        return [...prev, { ...product, quantity: product.stock }];
      }

      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) return removeFromCart(id);

    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id !== id) return item;

        const hasStockInfo = item.stock !== undefined;

        if (hasStockInfo && quantity > item.stock) {
          toast.warn("Sepete ekleyebileceğiniz maksimum adede ulaştınız");
          return { ...item, quantity: item.stock };
        }

        return { ...item, quantity };
      }),
    );
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
