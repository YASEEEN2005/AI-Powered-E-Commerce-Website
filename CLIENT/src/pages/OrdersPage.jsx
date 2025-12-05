import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_BACKEND_API;

function statusBadgeClasses(status) {
  switch (status) {
    case "placed":
      return "bg-blue-100 text-blue-700";
    case "confirmed":
      return "bg-indigo-100 text-indigo-700";
    case "shipped":
      return "bg-yellow-100 text-yellow-800";
    case "delivered":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-600">
          Please login to view your orders.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              My Orders
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Track, view and manage all your recent orders.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading your orders...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 mt-10">
            <p className="text-sm text-gray-600">You have no orders yet.</p>
            <Link
              to="/"
              className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
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
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order ID{" "}
                        <span className="font-semibold text-gray-800">
                          #{order.order_id}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Placed on {dateText} at {timeText}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusBadgeClasses(
                          order.order_status
                        )}`}
                      >
                        {order.order_status.toUpperCase()}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-700"
                            : order.payment_status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        PAYMENT {order.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="flex-1">
                      {order.items && order.items.length > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                            {order.items[0].image ? (
                              <img
                                src={order.items[0].image}
                                alt={order.items[0].name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] text-gray-400">
                                No Image
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                              {order.items[0].name}
                            </p>
                            {order.items.length > 1 && (
                              <p className="text-xs text-gray-500">
                                + {order.items.length - 1} more item
                                {order.items.length - 1 > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start md:items-end justify-between gap-2">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="text-base font-semibold text-gray-900">
                          ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/account/orders/${order.order_id}`)
                        }
                        className="px-3 py-1.5 rounded-full border border-gray-300 text-xs font-medium text-gray-800 hover:bg-gray-50"
                      >
                        View Details
                      </button>
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
