import React from "react";
import { Routes, Route } from "react-router-dom";

import SellerOtpLogin from "../Seller/SellerOtpLogin";
import SellerApprovalStatus from "../Seller/SellerApprovalStatus";
import SellerNavbar from "../Seller/SellerNavbar";
import SellerProtectedRoute from "../componets/SellerProtectedRoute";
import SellerDashboard from "../Seller/SellerDashboard";

function SellerRouters() {
  return (
    <div className="min-h-screen bg-gray-50">
         <SellerNavbar />
      <Routes>
        <Route path="/" element={<SellerOtpLogin />} />
        <Route path="/status" element={<SellerApprovalStatus />} />
        <Route path="/dashboard" element={<SellerDashboard />} />




        {/* <Route
          path="/dashboard"
          element={
            <SellerProtectedRoute>
              <SellerDashboard />
            </SellerProtectedRoute>
          }
        /> */}
      </Routes>
    </div>
  );
}

export default SellerRouters;
