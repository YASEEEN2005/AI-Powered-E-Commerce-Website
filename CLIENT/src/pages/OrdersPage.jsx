import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Package, Clock, Loader2, ShoppingBag } from "lucide-react";

const api = import.meta.env.VITE_BACKEND_API;

function statusBadgeClasses(status) {
  switch (status) {
    case "placed":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "confirmed":
      return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "shipped":
      return "bg-amber-50 text-amber-800 border-amber-100";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-100";
    default:
      return "bg-slate-50 text-slate-700 border-slate-100";
  }
}

function OrdersPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const axiosConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
    [token]
  );

  useEffect(() => {
    if (!token || !user?.user_id) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(
          `${api}/api/orders/user/${user.user_id}`,
          axiosConfig
        );
        const list = res.data?.data || [];
        setOrders(list);
      } catch (err) {
        console.error("Error fetching orders:", err.response?.data || err);
        setError("Failed to load your orders");
        toast.error("Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, user?.user_id, axiosConfig]);

  if (!token || !user?.user_id) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 shadow-sm text-center max-w-sm">
          <p className="text-sm text-slate-700 mb-2">
            Please login to view your orders.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-xs font-medium text-slate-900 hover:bg-slate-50 shadow-sm"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
              Account • Orders
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>My Orders</span>
              <Package className="h-5 w-5 text-slate-700" />
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Track, view and manage all your recent orders.
            </p>
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading your orders...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2">
            {error}
          </p>
        ) : orders.length === 0 ? (
          <div className="mt-10 flex items-center justify-center">
            <div className="bg-white border border-slate-100 rounded-2xl px-6 py-8 shadow-sm text-center max-w-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-300">
                <ShoppingBag className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-800 mb-1">
                You haven&apos;t placed any orders yet.
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Explore products and start your first order on SwiftCart.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-5 py-2 text-xs font-medium hover:bg-black shadow-sm"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-5">
            {orders.map((order) => {
              const createdAt = new Date(order.createdAt);
              const dateText = createdAt.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              const timeText = createdAt.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={order._id}
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 md:p-5 hover:border-slate-200 hover:shadow-md transition"
                >
                  {/* Top row: ID + status chips */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Order ID{" "}
                          <span className="font-semibold text-slate-900">
                            #{order.order_id}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Placed on {dateText} at {timeText}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${statusBadgeClasses(
                          order.order_status
                        )}`}
                      >
                        {order.order_status.toUpperCase()}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                          order.payment_status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : order.payment_status === "failed"
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-amber-50 text-amber-800 border-amber-100"
                        }`}
                      >
                        PAYMENT {order.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content row: product preview + amount + CTA */}
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* Product preview */}
                    <div className="flex-1">
                      {order.items && order.items.length > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                            {order.items[0].image ? (
                              <img
                                src={order.items[0].image}
                                alt={order.items[0].name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                No Image
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                              {order.items[0].name}
                            </p>
                            {order.items.length > 1 && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                + {order.items.length - 1} more item
                                {order.items.length - 1 > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Amount + actions */}
                    <div className="flex flex-col items-start md:items-end justify-between gap-2">
                      <div className="text-right">
                        <p className="text-[11px] text-slate-500">
                          Total Amount
                        </p>
                        <p className="text-base md:text-lg font-semibold text-slate-900">
                          ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/account/orders/${order.order_id}`)
                          }
                          className="px-3 py-1.5 rounded-full border border-slate-300 text-[11px] md:text-xs font-medium text-slate-800 hover:bg-slate-50"
                        >
                          View Details
                        </button>
                        {/* Optional: Reorder button for later */}
                        {/* <button className="px-3 py-1.5 rounded-full border border-slate-900 text-[11px] md:text-xs font-medium bg-slate-900 text-white hover:bg-black">
                          Buy Again
                        </button> */}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
