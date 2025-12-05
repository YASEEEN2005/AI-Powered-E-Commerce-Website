import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_BACKEND_API;

function badgeClasses(status) {
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

function OrderDetailsPage() {
  const { token, user } = useAuth();
  const { orderId } = useParams(); // numeric order_id
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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
    if (!token || !user?.user_id || !orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${api}/api/orders/${orderId}`,
          axiosConfig
        );
        const data = res.data?.data;
        setOrder(data || null);
      } catch (err) {
        console.error("Error fetching order:", err.response?.data || err);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token, user?.user_id, orderId, axiosConfig]);

  const handleCancelOrder = async () => {
    if (!order) return;

    if (
      order.order_status === "cancelled" ||
      order.order_status === "delivered"
    ) {
      toast.info("This order cannot be cancelled.");
      return;
    }

    const confirm = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirm) return;

    try {
      setCancelling(true);
      const res = await axios.put(
        `${api}/api/orders/${order.order_id}/cancel`,
        {},
        axiosConfig
      );
      const updated = res.data?.data;
      setOrder(updated);
      toast.success(res.data?.message || "Order cancelled successfully");
    } catch (err) {
      console.error("Cancel error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to cancel the order.");
    } finally {
      setCancelling(false);
    }
  };

  if (!token || !user?.user_id) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-600">
          Please login to view your order.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-600">Order not found.</p>
        <button
          onClick={() => navigate("/account/orders")}
          className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900"
        >
          Back to Orders
        </button>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Order Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Order #{order.order_id} • Placed on {dateText} at {timeText}
            </p>
          </div>
          <button
            onClick={() => navigate("/account/orders")}
            className="text-xs md:text-sm text-blue-600 hover:underline"
          >
            Back to Orders
          </button>
        </div>

        {/* Summary card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-5 mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div className="space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-semibold">Order ID:</span> #
                {order.order_id}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Payment Status:</span>{" "}
                <span className="uppercase">{order.payment_status}</span>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Razorpay Order:</span>{" "}
                {order.razorpay_order_id}
              </p>
              {order.razorpay_payment_id && (
                <p className="text-gray-700">
                  <span className="font-semibold">Payment ID:</span>{" "}
                  {order.razorpay_payment_id}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${badgeClasses(
                  order.order_status
                )}`}
              >
                {order.order_status.toUpperCase()}
              </span>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-gray-500">
                  Subtotal: ₹{Number(order.subtotal).toLocaleString("en-IN")} •
                  GST: ₹{Number(order.gst_amount).toLocaleString("en-IN")} •
                  Platform fee: ₹
                  {Number(order.platform_fee).toLocaleString("en-IN")}
                </p>
              </div>
              {order.order_status !== "cancelled" &&
                order.order_status !== "delivered" && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="px-3 py-1.5 rounded-full border border-red-400 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
            </div>
          </div>

          {/* Shipping address */}
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
            <p className="font-semibold text-gray-800 mb-1">Shipping Address</p>
            <p className="text-gray-700 whitespace-pre-line">
              {order.shipping_address || "Not available"}
            </p>
          </div>
        </div>

        {/* Items card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-5">
          <h3 className="text-lg font-semibold mb-3">Items in this order</h3>
          <div className="space-y-3">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 border border-gray-100 rounded-xl p-3 text-sm"
                >
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-400">
                        No Image
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-gray-600 mt-0.5">
                      Qty: <span className="font-medium">{item.quantity}</span>
                    </p>
                    <p className="text-gray-600 text-xs">
                      Price: ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 font-semibold">
                      Subtotal: ₹{Number(item.subtotal).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No items found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
