import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // USER STATE
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // SELLER STATE
  const [sellerToken, setSellerToken] = useState(null);
  const [seller, setSeller] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // USER
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("currentUser");

      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));

      // SELLER
      const storedSellerToken = localStorage.getItem("sellerToken");
      const storedSellerInfo = localStorage.getItem("sellerInfo");

      if (storedSellerToken) setSellerToken(storedSellerToken);
      if (storedSellerInfo) setSeller(JSON.parse(storedSellerInfo));
    } catch (err) {
      console.error("Error loading auth from storage:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // USER LOGIN
  const login = (newUser, newToken) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
  };

  // SELLER LOGIN
  const sellerLogin = (sellerData, token) => {
    setSeller(sellerData);
    setSellerToken(token);
    localStorage.setItem("sellerToken", token);
    localStorage.setItem("sellerInfo", JSON.stringify(sellerData));
  };

  const sellerLogout = () => {
    setSeller(null);
    setSellerToken(null);
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("sellerInfo");
  };

  const value = {
    // user
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,

    // seller
    seller,
    sellerToken,
    isSellerAuthenticated: !!sellerToken,
    sellerLogin,
    sellerLogout,


    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
