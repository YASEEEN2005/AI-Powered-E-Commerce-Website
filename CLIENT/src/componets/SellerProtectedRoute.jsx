import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SellerProtectedRoute({ children }) {
  const { seller, sellerToken, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Checking seller access...
      </div>
    );
  }

  if (!sellerToken) {
    return <Navigate to="/seller" replace />;
  }

  if (!seller || seller.status !== "approved") {
    return <Navigate to="/seller/status" replace />;
  }

  return children;
}

export default SellerProtectedRoute;
