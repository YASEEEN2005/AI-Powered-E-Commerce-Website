import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

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
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-600">
          Please login to continue to payment.
        </p>
      </div>
    );
  }

  if (!items || items.length === 0 || !address) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-600">
          Payment session expired or missing details.
        </p>
        <Link
          to="/cart"
          className="px-4 py-2 text-sm bg-black text-white rounded"
        >
          Go to Cart
        </Link>
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
        name: "ShopSmart AI",
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
        },
        theme: {
          color: "#111827",
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Payment
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review your order and pay securely with Razorpay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.8fr] gap-6">
          <div className="space-y-4 md:space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-5">
              <h3 className="text-lg font-semibold mb-3">Delivery Address</h3>
              <div className="text-sm text-gray-800">
                <p className="font-semibold">{address.fullName}</p>
                <p>
                  {address.houseNo}, {address.roadName}
                </p>
                <p>
                  {address.city}, {address.state} - {address.pinCode}
                </p>
                <p className="mt-1 text-gray-600">
                  Phone: <span className="font-medium">{address.phone}</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Items</h3>
                {mode === "BUY_NOW" ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    Buy Now
                  </span>
                ) : (
                  <Link
                    to="/cart"
                    className="text-xs md:text-sm text-blue-600 hover:underline"
                  >
                    Edit Cart
                  </Link>
                )}
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={item.productId || idx}
                    className="flex gap-3 border border-gray-100 rounded-xl p-3"
                  >
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No Image</span>
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-gray-900 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-gray-500 mt-1">
                        Qty:{" "}
                        <span className="font-medium">
                          {item.quantity || 1}
                        </span>
                      </p>
                      <p className="mt-1 font-semibold">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-5 h-fit md:sticky md:top-4">
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items ({items.length})</span>
                <span>₹{displayAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-medium">
                  Razorpay (UPI / Card / Netbanking)
                </span>
              </div>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-base">Total Payable</span>
              <span className="font-semibold text-lg">
                ₹{displayAmount.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing || creatingOrder}
              className="w-full mt-4 rounded-full bg-black text-white text-sm font-medium py-2.5 hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {creatingOrder
                ? "Creating Order..."
                : processing
                ? "Processing Payment..."
                : `Pay ₹${displayAmount.toLocaleString("en-IN")} Securely`}
            </button>

            <p className="mt-2 text-[11px] text-gray-500">
              You will be redirected to Razorpay to securely complete your
              payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
