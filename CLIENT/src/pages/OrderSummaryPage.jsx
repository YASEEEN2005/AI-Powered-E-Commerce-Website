import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

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

    const discount = 0;
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
      const res = await axios.get(
        `${api}/api/cart/${userId}`,
        axiosConfig
      );

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-gray-600">
          Please login to view your order summary.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Order Summary
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review your items and choose a delivery address before payment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.8fr] gap-6">
          <div className="space-y-4 md:space-y-5">

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Delivery Address</h3>
                <button
                  onClick={handleChangeAddress}
                  className="text-xs md:text-sm text-blue-600 hover:underline"
                >
                  Manage Addresses
                </button>
              </div>

              {loadingAddresses ? (
                <p className="text-sm text-gray-500">Loading addresses...</p>
              ) : addresses.length === 0 ? (
                <div className="text-sm text-gray-600">
                  No address found. Please{" "}
                  <button
                    onClick={handleChangeAddress}
                    className="text-blue-600 underline"
                  >
                    add an address
                  </button>{" "}
                  to continue.
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex items-start gap-3 rounded-xl border px-3 py-2 cursor-pointer transition ${
                        selectedAddressId === addr._id
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedAddress"
                        className="mt-1"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                      />
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{addr.fullName}</p>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide">
                            Home
                          </span>
                        </div>
                        <p className="text-gray-700">
                          {addr.houseNo}, {addr.roadName}
                        </p>
                        <p className="text-gray-700">
                          {addr.city}, {addr.state} - {addr.pinCode}
                        </p>
                        <p className="text-gray-500 mt-0.5">
                          Phone:{" "}
                          <span className="font-medium">{addr.phone}</span>
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Products</h3>
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

              {loadingCart && mode !== "BUY_NOW" ? (
                <p className="text-sm text-gray-500">Loading items...</p>
              ) : !items || items.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No items found. Go back to{" "}
                  <Link to="/" className="text-blue-600 underline">
                    shopping
                  </Link>
                  .
                </p>
              ) : (
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
                          <span className="text-xs text-gray-400">
                            No Image
                          </span>
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
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-5">
              <h3 className="text-lg font-semibold mb-2">Delivery By</h3>
              <p className="text-green-600 font-medium">
                {deliveryDateText || "Fast delivery available"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Exact delivery time will be shown on the payment page.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 md:p-5 h-fit md:sticky md:top-4">
            <h3 className="text-lg font-semibold mb-4">Price Details</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Price ({items?.length || 0} item)</span>
                <span>₹{priceSummary.totalMrp.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-green-600">
                  {priceSummary.discount > 0
                    ? `-₹${priceSummary.discount.toLocaleString("en-IN")}`
                    : "₹0"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span
                  className={
                    priceSummary.deliveryCharge === 0 ? "text-green-600" : ""
                  }
                >
                  {priceSummary.deliveryCharge === 0
                    ? "FREE"
                    : `₹${priceSummary.deliveryCharge.toLocaleString(
                        "en-IN"
                      )}`}
                </span>
              </div>

              <hr className="my-2" />

              <div className="flex justify-between font-semibold text-base">
                <span>Total Amount</span>
                <span>₹{priceSummary.payable.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              disabled={!items || items.length === 0}
              className="w-full mt-5 rounded-full bg-black text-white text-sm font-medium py-2.5 hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              Proceed to Payment
            </button>

            <p className="mt-2 text-[11px] text-gray-500">
              By placing your order, you agree to our{" "}
              <span className="underline">Terms & Conditions</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
