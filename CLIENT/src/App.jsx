import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./componets/HomaPage";
import OtpLogin from "./pages/OtpLogin";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import TermsPolicyPage from "./pages/TermsPolicyPage";
import AccountPage from "./pages/AccountPage";
import Navbar from "./pages/navBar";
import OrderSummaryPage from "./pages/OrderSummaryPage";
import AddressPage from "./pages/AddressPage";
import PaymentPage from "./pages/PaymentPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import SellerRouters from "./Routers/SellerRouters";

import ProtectedRoute from "./componets/ProtectedRoute";
import SellerApprovalStatus from "./Seller/SellerApprovalStatus";
import SellerDashboard from "./Seller/SellerDashboard";

function AppInner() {
  const location = useLocation();

  const isSellerRoute = location.pathname.startsWith("/seller");

  return (
    <>
      {!isSellerRoute && <Navbar />}

      <Routes>
        {/* Seller-side */}
        <Route path="/seller/*" element={<SellerRouters />} />
        {/* <Route path="/seller" element={<SellerRouters />} /> */}
        {/* <Route path="/seller/dashboard" element={<SellerDashboard />} /> */}

        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<OtpLogin />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:product_id" element={<ProductDetailsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/policy" element={<TermsPolicyPage />} />

        {/* Protected User Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-summary"
          element={
            <ProtectedRoute>
              <OrderSummaryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/address"
          element={
            <ProtectedRoute>
              <AddressPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
    </>
  );
}

function App() {
  return <AppInner />;
}

export default App;
