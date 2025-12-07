import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const api = import.meta.env.VITE_BACKEND_API;

function SellerApprovalStatus() {
  const navigate = useNavigate();
  const { seller, sellerToken, sellerLogin } = useAuth();
  const [freshSeller, setFreshSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerToken) {
      navigate("/seller");
    }
  }, [sellerToken]);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        if (!seller?.seller_id) return;

        console.log(seller.seller_id);

        const res = await axios.get(`${api}/api/seller/${seller.seller_id}`, {
          headers: { Authorization: `Bearer ${sellerToken}` },
        });

        const updated = res.data.data;
        setFreshSeller(updated);

        sellerLogin(updated, sellerToken);
      } catch (err) {
        console.error("Error loading seller:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, [seller?.seller_id]);

  if (loading) {
    return (
      <div className=" flex items-center justify-center text-sm text-gray-600">
        Loading seller status...
      </div>
    );
  }

  if (!freshSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Unable to load seller data.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
        {/* Pending */}
        {freshSeller.status === "pending" && (
          <>
            <h2 className="text-2xl font-semibold mb-3">
              Waiting for Approval 
            </h2>
            <p className="text-sm text-slate-600">
              Your seller application is under review. You will be notified once
              an admin approves your account.
            </p>
          </>
        )}

        {/* Rejected */}
        {freshSeller.status === "rejected" && (
          <>
            <h2 className="text-2xl font-semibold mb-3 text-red-600">
              Application Rejected
            </h2>
            <p className="text-sm text-slate-600">
              Your application was rejected. Please contact support for further
              assistance.
            </p>
          </>
        )}

        {/* Approved */}
        {freshSeller.status === "approved" && (
          <>
            <h2 className="text-2xl font-semibold mb-3 text-green-600">
              Approved 🎉
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Your seller account is active. You can now start selling!
            </p>

            <button
              onClick={() => navigate("/seller/dashboard")}
              className="px-6 py-2 bg-black text-white rounded-full hover:bg-slate-900 transition"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default SellerApprovalStatus;
