import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const [sellerToken, setSellerToken] = useState(null);
  const [seller, setSeller] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("currentUser");

    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    const storedSellerToken = localStorage.getItem("sellerToken");
    const storedSellerInfo = localStorage.getItem("sellerInfo");

    if (storedSellerToken) setSellerToken(storedSellerToken);
    if (storedSellerInfo) {
      try {
        setSeller(JSON.parse(storedSellerInfo));
      } catch {
        setSeller(null);
      }
    }

    setLoading(false);
  }, []);

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
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,

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
