import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  ShieldCheck,
  Clock,
  XCircle,
  Store,
  User,
  Mail,
  Phone,
} from "lucide-react";

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
  }, [sellerToken, navigate]);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        if (!seller?.seller_id || !sellerToken) {
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${api}/api/seller/${seller.seller_id}`,
          {
            headers: { Authorization: `Bearer ${sellerToken}` },
          }
        );

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
  }, [seller?.seller_id, sellerToken, sellerLogin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking your seller status...</span>
        </div>
      </div>
    );
  }

  if (!freshSeller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <XCircle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Unable to load seller data
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            We couldn&apos;t retrieve your seller profile. Please try logging in
            again.
          </p>
          <button
            onClick={() => navigate("/seller")}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-black"
          >
            Go to Seller Login
          </button>
        </div>
      </div>
    );
  }

  const status = (freshSeller.status || "pending").toLowerCase();
  const createdAt = freshSeller.createdAt
    ? new Date(freshSeller.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  const updatedAt = freshSeller.updatedAt
    ? new Date(freshSeller.updatedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const initials =
    (freshSeller.shop_name || freshSeller.name || "S")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const renderStatusIcon = () => {
    if (status === "approved") {
      return (
        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
        </div>
      );
    }
    if (status === "rejected") {
      return (
        <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-3">
          <XCircle className="h-6 w-6 text-rose-500" />
        </div>
      );
    }
    return (
      <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
        <Clock className="h-6 w-6 text-amber-500" />
      </div>
    );
  };

  const renderStatusTitle = () => {
    if (status === "approved") return "Your seller account is live 🎉";
    if (status === "rejected") return "Your application was rejected";
    return "Your seller application is under review";
  };

  const renderStatusSubtitle = () => {
    if (status === "approved") {
      return "You can now access your dashboard, manage products, and start receiving orders.";
    }
    if (status === "rejected") {
      return "Please review your account details and contact support if you believe this is a mistake.";
    }
    return "Once an admin approves your account, you’ll be able to access the full seller dashboard.";
  };

  const renderStatusBadge = () => {
    let base =
      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide border";

    if (status === "approved") {
      return (
        <span
          className={
            base +
            " bg-emerald-50 text-emerald-700 border-emerald-100"
          }
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Approved
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span
          className={base + " bg-rose-50 text-rose-700 border-rose-100"}
        >
          <XCircle className="h-3.5 w-3.5" />
          Rejected
        </span>
      );
    }

    return (
      <span
        className={base + " bg-amber-50 text-amber-700 border-amber-100"}
      >
        <Clock className="h-3.5 w-3.5" />
        Pending review
      </span>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-4 mb-5">
          <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-indigo-600" />
                  <span>{freshSeller.shop_name || "Your Store"}</span>
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>{freshSeller.name || "-"}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {renderStatusBadge()}
                <p className="text-[11px] text-slate-400">
                  Seller ID:{" "}
                  <span className="font-medium text-slate-700">
                    {freshSeller.seller_id || "-"}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
              {freshSeller.email && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {freshSeller.email}
                </span>
              )}
              {freshSeller.phone && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5">
                  <Phone className="h-3.5 w-3.5" />
                  {freshSeller.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 mb-4">
          <div className="flex flex-col items-center text-center">
            {renderStatusIcon()}
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              {renderStatusTitle()}
            </h2>
            <p className="text-[13px] text-slate-600 mb-3 max-w-md">
              {renderStatusSubtitle()}
            </p>

            <p className="text-[11px] text-slate-400">
              Last updated:{" "}
              <span className="font-medium text-slate-600">
                {updatedAt}
              </span>
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-slate-100 bg-white px-4 py-3 text-[11px] text-slate-600">
          <p className="font-semibold text-slate-800 mb-1.5">
            Approval steps
          </p>
          <ol className="space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span>1. Submit seller details and bank information.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span>
                2. Admin reviews your profile and verifies your details.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span>
                3. Once approved, you can access dashboard, products and
                orders.
              </span>
            </li>
          </ol>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          {status === "approved" && (
            <>
              <button
                onClick={() => navigate("/seller/dashboard")}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-black"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate("/seller/products")}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[12px] font-semibold text-slate-800 hover:bg-slate-50"
              >
                Manage Products
              </button>
            </>
          )}

          {status === "pending" && (
            <>
              <button
                onClick={() => navigate("/seller/account")}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[12px] font-semibold text-slate-800 hover:bg-slate-50"
              >
                Review Account Details
              </button>
              <button
                onClick={() => navigate("/seller/contact")}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-black"
              >
                Contact Support
              </button>
            </>
          )}

          {status === "rejected" && (
            <>
              <button
                onClick={() => navigate("/seller/account")}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[12px] font-semibold text-slate-800 hover:bg-slate-50"
              >
                Update Account Details
              </button>
              <button
                onClick={() => navigate("/seller/contact")}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-black"
              >
                Contact Support
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerApprovalStatus;
