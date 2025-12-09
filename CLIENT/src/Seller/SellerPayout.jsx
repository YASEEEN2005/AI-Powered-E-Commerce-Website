import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  Wallet,
  IndianRupee,
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  CalendarClock,
} from "lucide-react";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_BACKEND_API;

function SellerPayout() {
  const { seller, sellerToken } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    if (!sellerToken) {
      navigate("/seller");
    }
  }, [sellerToken, navigate]);

  const fetchProfile = async () => {
    if (!seller?.seller_id || !sellerToken) {
      setLoadingProfile(false);
      return;
    }

    try {
      setLoadingProfile(true);
      const res = await axios.get(
        `${api}/api/seller/${seller.seller_id}`,
        {
          headers: { Authorization: `Bearer ${sellerToken}` },
        }
      );
      setProfile(res.data?.data || null);
    } catch (err) {
      console.error("Error loading seller payout profile:", err);
      toast.error("Failed to load payout details.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [seller?.seller_id, sellerToken]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!seller?.seller_id || !sellerToken) {
        setLoadingOrders(false);
        return;
      }

      try {
        setLoadingOrders(true);
        const res = await axios.get(
          `${api}/api/seller/${seller.seller_id}/orders`,
          {
            headers: { Authorization: `Bearer ${sellerToken}` },
          }
        );
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error("Error loading seller payout orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [seller?.seller_id, sellerToken]);

  const data = profile || seller || {};

  const pendingPayment = Number(data.pending_payment || 0);
  const totalPayout = Number(data.payout || 0);


  const recentPaidOrders = useMemo(() => {
    return (orders || [])
      .filter(
        (o) =>
          (o.payment_status || "").toLowerCase() === "paid" &&
          (o.order_status || "").toLowerCase() === "delivered"
      )
      .slice(0, 5);
  }, [orders]);

  const totalPaidOrdersAmount = useMemo(() => {
    return recentPaidOrders.reduce((sum, o) => {
      const amt = Number(
        o.totalAmount || o.total_amount || o.amount || 0
      );
      return sum + amt;
    }, 0);
  }, [recentPaidOrders]);

  const lastUpdated = data.updatedAt
    ? new Date(data.updatedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";


  const handlePayoutNow = async () => {
    if (!seller?.seller_id) {
      toast.error("Seller info missing.");
      return;
    }

    if (pendingPayment <= 0) {
      toast.info("No pending payment to payout.");
      return;
    }

    const confirm = window.confirm(
      `Payout ₹${pendingPayment.toLocaleString(
        "en-IN"
      )} to your bank account now?`
    );
    if (!confirm) return;

    try {
      setPayoutLoading(true);

   
      const res = await axios.put(
        `${api}/api/admin/seller/${seller.seller_id}/payout`,
        { amount: pendingPayment },
        {
          headers: { Authorization: `Bearer ${sellerToken}` },
        }
      );

      const updatedSeller =
        res.data?.data?.seller || res.data?.data || null;

      if (updatedSeller) {
        setProfile(updatedSeller);
      }

      toast.success("Payout initiated successfully.");
      fetchProfile();
    } catch (err) {
      console.error("Error creating payout:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to initiate payout. Please try again."
      );
    } finally {
      setPayoutLoading(false);
    }
  };

  if (loadingProfile && !profile) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading payout overview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Payouts
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Payout & Earnings</span>
              <Banknote className="h-5 w-5 text-indigo-600" />
            </h1>
            <p className="mt-2 text-sm md:text-[15px] text-slate-600 max-w-xl">
              Track your pending settlement and total payouts from SwiftCart.
              This information is synced with your Razorpay settlement flow.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 text-[11px] text-slate-500">
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-3 py-1 text-[11px]">
              <Wallet className="h-3.5 w-3.5" />
              <span>Seller ID: {data.seller_id || "-"}</span>
            </div>
            <p className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              <span>Last updated: {lastUpdated}</span>
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Pending payment
                </p>
                <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <ArrowDownRight className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-slate-900">
                ₹{pendingPayment.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Amount earned from completed orders, yet to be paid out to your
                bank.
              </p>
            </div>

            <div className="mt-3 flex justify-between items-center">
              <button
                type="button"
                onClick={handlePayoutNow}
                disabled={pendingPayment <= 0 || payoutLoading}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold shadow-sm ${
                  pendingPayment <= 0 || payoutLoading
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-slate-900 text-white hover:bg-black"
                }`}
              >
                {payoutLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <IndianRupee className="h-3.5 w-3.5" />
                    Payout now
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 text-right">
                This will create a payout from your SwiftCart balance to your
                bank account.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Lifetime payouts
              </p>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              ₹{totalPayout.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Total amount SwiftCart has settled to your bank account.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Recent paid orders
              </p>
              <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              ₹{totalPaidOrdersAmount.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Sum of your last{" "}
              {(recentPaidOrders || []).length === 0
                ? 0
                : (recentPaidOrders || []).length}{" "}
              paid & delivered orders.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent paid & delivered orders
            </h2>
            <p className="text-[11px] text-slate-500">
              Only showing completed orders related to your products.
            </p>
          </div>

          {loadingOrders ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading orders...</span>
            </div>
          ) : recentPaidOrders.length === 0 ? (
            <p className="text-[12px] text-slate-500">
              No paid & delivered orders found for your products yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 pr-4 font-medium">Order ID</th>
                    <th className="py-2.5 pr-4 font-medium">Items</th>
                    <th className="py-2.5 pr-4 font-medium">
                      Order Amount
                    </th>
                    <th className="py-2.5 pr-4 font-medium">Payment</th>
                    <th className="py-2.5 pr-4 font-medium">Delivered On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPaidOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 pr-4 text-[11px] text-slate-800">
                        #{o.order_id || o._id?.slice(-6)}
                      </td>
                      <td className="py-2.5 pr-4 text-[11px] text-slate-700">
                        {(o.items || []).length} item(s)
                      </td>
                      <td className="py-2.5 pr-4 text-[11px] text-slate-800">
                        ₹
                        {Number(
                          o.totalAmount || o.total_amount || o.amount || 0
                        ).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 pr-4 text-[11px] text-emerald-700">
                        Paid
                      </td>
                      <td className="py-2.5 pr-4 text-[11px] text-slate-500">
                        {o.updatedAt
                          ? new Date(o.updatedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                              }
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/seller/orders")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
            >
              View all orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerPayout;
