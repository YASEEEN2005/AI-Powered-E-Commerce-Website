import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { MapPin, Package, CalendarDays, ShieldCheck } from "lucide-react";

const api = import.meta.env.VITE_BACKEND_API;

function OrderSummary() {
  const { token, user } = useAuth();
  const userId = user?.user_id;

  const navigate = useNavigate();
  const location = useLocation();
  const { mode, items: stateItems } = location.state || {};

  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [deliveryDateText, setDeliveryDateText] = useState("");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const items = useMemo(() => {
    if (mode === "BUY_NOW" && stateItems && stateItems.length) {
      return stateItems;
    }
    return cartItems;
  }, [mode, stateItems, cartItems]);

  const priceSummary = useMemo(() => {
    if (!items || items.length === 0) {
      return {
        totalMrp: 0,
        discount: 0,
        deliveryCharge: 0,
        payable: 0,
      };
    }

    const totalMrp = items.reduce((sum, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      return sum + price * qty;
    }, 0);

    const discount = 0; // you can plug coupon logic later
    const deliveryCharge = totalMrp > 999 ? 0 : 49;
    const payable = totalMrp - discount + deliveryCharge;

    return {
      totalMrp,
      discount,
      deliveryCharge,
      payable,
    };
  }, [items]);

  const fetchAddresses = async () => {
    if (!token || !userId) return;

    try {
      setLoadingAddresses(true);
      const res = await axios.get(
        `${api}/api/address/user/${userId}`,
        axiosConfig
      );
      const list = res.data.data || res.data || [];
      setAddresses(list);
      if (list.length > 0 && !selectedAddressId) {
        setSelectedAddressId(list[0]._id);
      }
    } catch (err) {
      toast.error("Failed to load addresses");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchCartItems = async () => {
    if (!token || !userId) return;
    if (mode === "BUY_NOW") return;

    try {
      setLoadingCart(true);
      const res = await axios.get(`${api}/api/cart/${userId}`, axiosConfig);

      const cart = res.data?.data;
      if (!cart || !Array.isArray(cart.items)) {
        console.log("Cart data found but items missing:", res.data);
        setCartItems([]);
        return;
      }

      const list = cart.items;

      const mapped = list.map((item) => {
        const p = item.product_id || item.product || {};
        const productId =
          p.product_id || p._id || item.product_id || item.productId;

        return {
          productId,
          name: p.name || item.name || "Product",
          price: p.price || item.price || 0,
          image:
            (p.images && p.images[0]) ||
            p.image ||
            item.image ||
            "https://via.placeholder.com/150x150?text=Product",
          quantity: item.quantity || 1,
        };
      });

      setCartItems(mapped);
    } catch (err) {
      console.error("Cart load error:", err.response?.data || err.message);
      toast.error("Failed to load cart items");
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    if (!token || !userId) return;
    fetchAddresses();
    fetchCartItems();
  }, [token, userId]);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    const options = {
      weekday: "long",
      day: "numeric",
      month: "short",
    };
    const formatted = d.toLocaleDateString("en-IN", options);
    setDeliveryDateText(formatted);
  }, []);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a._id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const handleProceedToPayment = () => {
    if (!items || items.length === 0) {
      toast.error("No items found for checkout");
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    navigate("/payment", {
      state: {
        items,
        address: selectedAddress,
        amount: priceSummary.payable,
        mode: mode || "CART",
      },
    });
  };

  const handleChangeAddress = () => {
    navigate("/address");
  };

  if (!token || !userId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 shadow-sm text-center max-w-sm">
          <p className="text-sm text-slate-700 mb-2">
            Please login to view your order summary.
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
        <div className="mb-6 md:mb-8">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
            Checkout • Order Summary
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Order Summary</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Review your items and choose a delivery address before secure
            payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.45fr_0.75fr] gap-6 md:gap-7">
          {/* LEFT SIDE */}
          <div className="space-y-4 md:space-y-5">
            {/* Delivery Address */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-slate-900">
                      Delivery Address
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Select where you want us to deliver your order.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleChangeAddress}
                  className="text-[11px] md:text-xs font-medium text-slate-900 underline underline-offset-4 hover:text-black"
                >
                  Manage Addresses
                </button>
              </div>

              {loadingAddresses ? (
                <p className="text-xs md:text-sm text-slate-500">
                  Loading addresses...
                </p>
              ) : addresses.length === 0 ? (
                <div className="text-xs md:text-sm text-slate-600">
                  No address found. Please{" "}
                  <button
                    onClick={handleChangeAddress}
                    className="text-slate-900 font-medium underline underline-offset-2"
                  >
                    add an address
                  </button>{" "}
                  to continue.
                </div>
              ) : (
                <div className="space-y-3 mt-2">
                  {addresses.map((addr, index) => (
                    <label
                      key={addr._id}
                      className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition ${
                        selectedAddressId === addr._id
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedAddress"
                        className="mt-1 accent-slate-900"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                      />
                      <div className="text-xs md:text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-900">
                            {addr.fullName}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
                            {index === 0 ? "Default" : "Saved"}
                          </span>
                        </div>
                        <p className="text-slate-700 mt-0.5">
                          {addr.houseNo}, {addr.roadName}
                        </p>
                        <p className="text-slate-700">
                          {addr.city}, {addr.state} - {addr.pinCode}
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          Phone:{" "}
                          <span className="font-medium text-slate-800">
                            {addr.phone}
                          </span>
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Products */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                    <Package className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-slate-900">
                    Products
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

              {loadingCart && mode !== "BUY_NOW" ? (
                <p className="text-xs md:text-sm text-slate-500">
                  Loading items...
                </p>
              ) : !items || items.length === 0 ? (
                <p className="text-xs md:text-sm text-slate-600">
                  No items found. Go back to{" "}
                  <Link
                    to="/"
                    className="text-slate-900 font-medium underline underline-offset-2"
                  >
                    shopping
                  </Link>
                  .
                </p>
              ) : (
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
              )}
            </div>

            {/* Delivery info */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 md:p-5 flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-1">
                  Delivery Estimate
                </h3>
                <p className="text-sm font-medium text-emerald-700">
                  {deliveryDateText || "Fast delivery available"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Exact delivery date and time will be shown on the payment
                  screen based on your address and availability.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE – Price Details */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 md:p-5 h-fit md:sticky md:top-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm md:text-base font-semibold text-slate-900">
                Price Details
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 border border-emerald-100">
                <ShieldCheck className="h-3 w-3" />
                Secure Checkout
              </span>
            </div>

            <div className="space-y-2 text-xs md:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">
                  Price ({items?.length || 0} item
                  {items && items.length !== 1 ? "s" : ""})
                </span>
                <span className="font-medium text-slate-900">
                  ₹{priceSummary.totalMrp.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Discount</span>
                <span className="font-medium text-emerald-600">
                  {priceSummary.discount > 0
                    ? `-₹${priceSummary.discount.toLocaleString("en-IN")}`
                    : "₹0"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Delivery Charges</span>
                <span
                  className={
                    priceSummary.deliveryCharge === 0
                      ? "font-medium text-emerald-600"
                      : "font-medium text-slate-900"
                  }
                >
                  {priceSummary.deliveryCharge === 0
                    ? "FREE"
                    : `₹${priceSummary.deliveryCharge.toLocaleString(
                        "en-IN"
                      )}`}
                </span>
              </div>

              <div className="my-3 h-px bg-slate-100" />

              <div className="flex justify-between items-center font-semibold text-sm md:text-base">
                <span className="text-slate-900">Total Amount</span>
                <span className="text-slate-900">
                  ₹{priceSummary.payable.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={!items || items.length === 0}
              className="w-full mt-5 rounded-full bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition"
            >
              Proceed to Payment
            </button>

            <p className="mt-2 text-[10px] md:text-[11px] text-slate-500 leading-snug">
              By placing your order, you agree to SwiftCart&apos;s{" "}
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

export default OrderSummary;
