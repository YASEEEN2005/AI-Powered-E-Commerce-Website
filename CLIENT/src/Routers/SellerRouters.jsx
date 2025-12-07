import React from "react";
import { Routes, Route } from "react-router-dom";

import SellerOtpLogin from "../Seller/SellerOtpLogin";
import SellerApprovalStatus from "../Seller/SellerApprovalStatus";

function SellerRouters() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<SellerOtpLogin />} />
        <Route path="/status" element={<SellerApprovalStatus />} />
      </Routes>
    </div>
  );
}

export default SellerRouters;
