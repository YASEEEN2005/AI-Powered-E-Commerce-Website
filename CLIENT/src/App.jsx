import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./componets/HomaPage";
import OtpLogin from "./pages/OtpLogin";
import ProtectedRoute from "./componets/ProtectedRoute";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import TermsPolicyPage from "./pages/TermsPolicyPage";
import AccountPage from "./pages/AccountPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/policy" element={<TermsPolicyPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/product/:product_id" element={<ProductDetailsPage />} />

      </Routes>

      
        {/* <Routes>
        <ProtectedRoute>
        <Route path="/login" element={<OtpLogin />} />
        </ProtectedRoute>
        </Routes> */}
      

      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
