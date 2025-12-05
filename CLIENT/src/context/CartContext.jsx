import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const api = import.meta.env.VITE_BACKEND_API;

  const loadCartCount = async () => {
    try {
      if (!isAuthenticated || !user?.user_id || !token) {
        setCartCount(0);
        return;
      }

      const res = await axios.get(`${api}/api/cart/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = res.data?.data?.items || [];

      const total = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

      setCartCount(total);
    } catch (error) {
      console.error("Cart load error:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadCartCount();
  }, [isAuthenticated, user, token]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        setCartCount,
        loadCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
