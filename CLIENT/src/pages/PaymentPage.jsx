import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { MapPin, Package, ShieldCheck, CreditCard } from "lucide-react";

const api = import.meta.env.VITE_BACKEND_API;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function formatAddress(address) {
  if (!address) return "";
  const parts = [
    address.fullName,
    address.houseNo,
    address.roadName,
    `${address.city}, ${address.state} - ${address.pinCode}`,
    `Phone: ${address.phone}`,
  ].filter(Boolean);
  return parts.join(", ");
}

function PaymentPage() {
  const { token, user } = useAuth();
  const { loadCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    items: stateItems,
    address,
    amount: stateAmount,
    mode,
  } = location.state || {};

  const [processing, setProcessing] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const axiosConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }),
    [token]
  );

  const items = stateItems || [];
  const displayAmount = useMemo(() => {
    if (typeof stateAmount === "number" && !Number.isNaN(stateAmount)) {
      return stateAmount;
    }
    return items.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [stateAmount, items]);

  useEffect(() => {
    if (!location.state) {
      navigate("/cart");
    }
  }, [location.state, navigate]);

  if (!token || !user?.user_id) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 shadow-sm text-center max-w-sm">
          <p className="text-sm text-slate-700 mb-2">
            Please login to continue to payment.
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

  if (!items || items.length === 0 || !address) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 shadow-sm text-center max-w-sm">
          <p className="text-sm text-slate-700 mb-2">
            Payment session expired or missing details.
          </p>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-5 py-2 text-xs font-medium hover:bg-black shadow-sm"
          >
            Go to Cart
          </Link>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      setCreatingOrder(true);

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load Razorpay. Please check your connection.");
        setCreatingOrder(false);
        return;
      }

      const createRes = await axios.post(
        `${api}/api/payments/create_order`,
        { user_id: user.user_id },
        axiosConfig
      );

      const createData = createRes.data?.data || {};
      const razorpayOrder = createData.order;
      const razorpayKeyId = createData.razorpay_key_id;
      const paymentRecordId = createData.payment_record_id;

      if (!razorpayOrder || !razorpayKeyId) {
        toast.error("Failed to initialize payment. Please try again.");
        setCreatingOrder(false);
        return;
      }

      setCreatingOrder(false);
      setProcessing(true);

      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "SwiftCart",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: {
          user_id: String(user.user_id),
          payment_record_id: String(paymentRecordId),
          shipping_address: formatAddress(address),
        },
        theme: {
          color: "#020617", // slate-950/900
        },
        handler: async function (response) {
          try {
            const {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            } = response;

            const verifyRes = await axios.post(
              `${api}/api/payments/verify`,
              {
                user_id: user.user_id,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                shipping_address: formatAddress(address),
              },
              axiosConfig
            );

            if (verifyRes.data?.success) {
              toast.success("Payment successful! Order placed.");
              loadCartCount?.();
              navigate("/account/orders");
            } else {
              toast.error(
                verifyRes.data?.message || "Payment verification failed."
              );
            }
          } catch (err) {
            console.error("Verify error:", err.response?.data || err.message);
            toast.error(
              err.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (resp) {
        console.error("Payment failed:", resp.error);
        toast.error("Payment failed. Please try again.");
        setProcessing(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Create order error:", err.response?.data || err.message);
      toast.error(
        err.response?.data?.message ||
          "Failed to start payment. Please try again."
      );
      setCreatingOrder(false);
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
            Checkout • Payment
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Payment</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Review your order and pay securely with Razorpay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.45fr_0.75fr] gap-6 md:gap-7">
          {/* LEFT SIDE – Address + Items */}
          <div className="space-y-4 md:space-y-5">
            {/* Delivery Address */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 md:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-slate-900">
                    Delivery Address
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Your order will be delivered to this location.
                  </p>
                </div>
              </div>

              <div className="mt-1 text-xs md:text-sm text-slate-800">
                <p className="font-semibold text-slate-900">
                  {address.fullName}
                </p>
                <p className="mt-0.5">
                  {address.houseNo}, {address.roadName}
                </p>
                <p>
                  {address.city}, {address.state} - {address.pinCode}
                </p>
                <p className="mt-1 text-slate-600">
                  Phone:{" "}
                  <span className="font-medium text-slate-900">
                    {address.phone}
                  </span>
                </p>
                <button
                  onClick={() => navigate("/address")}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-slate-900 underline underline-offset-4 hover:text-black"
                >
                  Change address
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                    <Package className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-slate-900">
                    Items
                  </h3>
                </div>
                {mode === "BUY_NOW" ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Buy Now
                  </span>
                ) : (
                  <Link
                    to="/cart"
                    className="text-[11px] md:text-xs font-medium text-slate-900 underline underline-offset-4 hover:text-black"
                  >
                    Edit Cart
                  </Link>
                )}
              </div>

              <div className="space-y-3 mt-1">
                {items.map((item, idx) => (
                  <div
                    key={item.productId || idx}
                    className="flex gap-3 border border-slate-100 rounded-xl p-3 hover:border-slate-200 transition"
                  >
                    <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
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
                    <div className="flex-1 text-xs md:text-sm">
                      <p className="font-semibold text-slate-900 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-slate-500 mt-1">
                        Qty:{" "}
                        <span className="font-medium">
                          {item.quantity || 1}
                        </span>
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE – Payment Summary */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 md:p-5 h-fit md:sticky md:top-20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-slate-900">
                    Payment Summary
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pay securely via Razorpay.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 border border-emerald-100">
                <ShieldCheck className="h-3 w-3" />
                Secure
              </span>
            </div>

            <div className="space-y-2 text-xs md:text-sm mt-2">
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Items ({items.length} item{items.length !== 1 ? "s" : ""})
                </span>
                <span className="font-medium text-slate-900">
                  ₹{displayAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Method</span>
                <span className="font-medium text-slate-900 text-right">
                  Razorpay
                  <span className="block text-[10px] text-slate-500">
                    UPI / Card / Netbanking / Wallet
                  </span>
                </span>
              </div>
            </div>

            <div className="my-3 h-px bg-slate-100" />

            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm md:text-base text-slate-900">
                Total Payable
              </span>
              <span className="font-semibold text-lg text-slate-900">
                ₹{displayAmount.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing || creatingOrder}
              className="w-full mt-4 rounded-full bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition"
            >
              {creatingOrder
                ? "Creating Order..."
                : processing
                ? "Processing Payment..."
                : `Pay ₹${displayAmount.toLocaleString("en-IN")} Securely`}
            </button>

            <p className="mt-2 text-[10px] md:text-[11px] text-slate-500 leading-snug">
              You will be redirected to Razorpay to securely complete your
              payment. By continuing, you agree to SwiftCart&apos;s{" "}
              <span className="underline underline-offset-2">
                Terms &amp; Conditions
              </span>{" "}
              and{" "}
              <span className="underline underline-offset-2">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
