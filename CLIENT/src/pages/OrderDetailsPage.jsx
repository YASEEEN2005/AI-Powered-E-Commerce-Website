import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  Loader2,
  ArrowLeftCircle,
} from "lucide-react";

const api = import.meta.env.VITE_BACKEND_API;

function badgeClasses(status) {
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

function canCancel(status) {
  return status === "placed" || status === "confirmed";
}

function OrderDetailsPage() {
  const { token, user } = useAuth();
  const { orderId } = useParams();
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

    if (!canCancel(order.order_status)) {
      toast.info("This order can no longer be cancelled.");
      return;
    }

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirmCancel) return;

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
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 shadow-sm text-center max-w-sm">
          <p className="text-sm text-slate-700 mb-2">
            Please login to view your order.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-xs font-medium text-slate-900 hover:bg-slate-50 shadow-sm"
          >
            <ArrowLeftCircle className="h-4 w-4" />
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 shadow-sm text-center max-w-sm">
          <p className="text-sm text-slate-700 mb-2">Order not found.</p>
          <button
            onClick={() => navigate("/account/orders")}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-5 py-2 text-xs font-medium hover:bg-black shadow-sm"
          >
            <ArrowLeftCircle className="h-4 w-4" />
            Back to Orders
          </button>
        </div>
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

  const canUserCancel = canCancel(order.order_status);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
              Account • Order Details
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Order Details</span>
              <Package className="h-5 w-5 text-slate-700" />
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Order #{order.order_id} • Placed on {dateText} at {timeText}
            </p>
          </div>
          <button
            onClick={() => navigate("/account/orders")}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] md:text-xs font-medium text-slate-800 hover:bg-slate-50 shadow-sm"
          >
            <ArrowLeftCircle className="h-4 w-4" />
            Back to Orders
          </button>
        </div>

        {/* Summary card */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 md:p-5 mb-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
            <div className="space-y-1 text-xs md:text-sm">
              <p className="text-slate-700">
                <span className="font-semibold">Order ID:</span> #
                {order.order_id}
              </p>
              <p className="text-slate-700">
                <span className="font-semibold">Payment Status:</span>{" "}
                <span className="uppercase">{order.payment_status}</span>
              </p>
              <p className="text-slate-700">
                <span className="font-semibold">Razorpay Order:</span>{" "}
                {order.razorpay_order_id}
              </p>
              {order.razorpay_payment_id && (
                <p className="text-slate-700">
                  <span className="font-semibold">Payment ID:</span>{" "}
                  {order.razorpay_payment_id}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 min-w-[220px]">
              <span
                className={`inline-flex items-center justify-center text-[11px] px-2.5 py-1 rounded-full font-medium border ${badgeClasses(
                  order.order_status
                )}`}
              >
                {order.order_status.toUpperCase()}
              </span>

              <div className="text-right">
                <p className="text-[11px] text-slate-500">Total Amount</p>
                <p className="text-lg font-semibold text-slate-900">
                  ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Subtotal: ₹
                  {Number(order.subtotal).toLocaleString("en-IN")} • GST: ₹
                  {Number(order.gst_amount).toLocaleString("en-IN")} • Platform
                  fee: ₹
                  {Number(order.platform_fee).toLocaleString("en-IN")}
                </p>
              </div>

              {canUserCancel && (
                <div className="text-right space-y-1">
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="px-3 py-1.5 rounded-full border border-rose-300 text-[11px] font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Order"}
                  </button>
                  <p className="text-[11px] text-slate-500">
                    You can cancel this order until it is{" "}
                    <span className="font-semibold">SHIPPED</span>. After
                    shipping, cancellation won&apos;t be available.
                  </p>
                </div>
              )}

              {!canUserCancel && order.order_status !== "cancelled" && (
                <p className="text-[11px] text-slate-500 text-right">
                  This order can&apos;t be cancelled after it is{" "}
                  <span className="font-medium">
                    {order.order_status.toUpperCase()}
                  </span>
                  .
                </p>
              )}
            </div>
          </div>

          {/* Shipping + Payment */}
          <div className="mt-3 pt-3 border-t border-slate-100 grid gap-3 md:grid-cols-[1.5fr_1fr]">
            <div className="text-xs md:text-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <p className="font-semibold text-slate-900">
                  Shipping Address
                </p>
              </div>
              <p className="text-slate-700 whitespace-pre-line">
                {order.shipping_address || "Not available"}
              </p>
            </div>

            <div className="text-xs md:text-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="h-3.5 w-3.5" />
                </div>
                <p className="font-semibold text-slate-900">Payment</p>
              </div>
              <p className="text-slate-700">
                Method:{" "}
                <span className="font-medium">Razorpay (Online Payment)</span>
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Secured by Razorpay with encrypted payment flow.
              </p>
            </div>
          </div>
        </div>

        {/* Items card */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
              <Truck className="h-4 w-4" />
            </div>
            <h3 className="text-sm md:text-base font-semibold text-slate-900">
              Items in this order
            </h3>
          </div>

          <div className="space-y-3">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 border border-slate-100 rounded-xl p-3 text-xs md:text-sm hover:border-slate-200 transition"
                >
                  <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        No Image
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      Qty:{" "}
                      <span className="font-medium">{item.quantity}</span>
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Price: ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      Subtotal: ₹
                      {Number(item.subtotal).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs md:text-sm text-slate-500">
                No items found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
