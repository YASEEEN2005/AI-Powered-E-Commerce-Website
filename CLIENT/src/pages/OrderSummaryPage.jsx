import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin,
  Plus,
  ChevronRight,
  Truck,
  Package,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../componets/Modal";

function OrderSummaryPage() {
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();
  const api = import.meta.env.VITE_BACKEND_API;

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    pinCode: "",
    state: "",
    city: "",
    houseNo: "",
    roadName: "",
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.user_id) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([
          axios.get(`${api}/api/cart/${user.user_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${api}/api/address/user/${user.user_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const cartData = cartRes.data?.data || null;
        const addrData = addrRes.data?.data || [];

        setCart(cartData);
        setAddresses(addrData);
        if (addrData.length > 0 && !selectedAddressId) {
          setSelectedAddressId(addrData[0]._id);
        }
      } catch (err) {
        toast.error("Failed to load order summary");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user, token, selectedAddressId]);

  useEffect(() => {
    if (user) {
      setAddressForm((prev) => ({
        ...prev,
        fullName: user.name || "",
        phone: user.phone || "",
        pinCode: user.pinCode || "",
      }));
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <p className="text-sm text-slate-700 mb-2">
            Please sign in to review your order.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-full bg-black text-white px-5 py-2 text-xs font-semibold shadow-sm hover:bg-slate-900"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-600">Preparing your order summary...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <p className="text-sm text-slate-700 mb-2">
            Your cart is empty. Add products to continue.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center justify-center rounded-full bg-black text-white px-5 py-2 text-xs font-semibold shadow-sm hover:bg-slate-900"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const estimatedDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const itemsTotal = cart.items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const gstAmount = cart.gst_amount || 0;
  const platformFee = cart.platform_fee || 0;
  const grandTotal = itemsTotal + gstAmount + platformFee;

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId) || null;

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (
      !addressForm.fullName ||
      !addressForm.phone ||
      !addressForm.pinCode ||
      !addressForm.state ||
      !addressForm.city ||
      !addressForm.houseNo ||
      !addressForm.roadName
    ) {
      toast.error("Please fill all address fields");
      return;
    }

    try {
      setSavingAddress(true);
      const payload = {
        user_id: user.user_id,
        fullName: addressForm.fullName,
        phone: addressForm.phone,
        pinCode: addressForm.pinCode,
        state: addressForm.state,
        city: addressForm.city,
        houseNo: addressForm.houseNo,
        roadName: addressForm.roadName,
      };

      const res = await axios.post(
        "http://localhost:5000/api/address/add",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newAddress = res.data?.data;
      toast.success("Address added");
      const updated = [newAddress, ...addresses];
      setAddresses(updated);
      setSelectedAddressId(newAddress._id);
      setAddressModalOpen(false);
    } catch (err) {
      toast.error("Failed to add address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    navigate("/payments", {
      state: {
        addressId: selectedAddress._id,
      },
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-10">
        <div className="mb-4">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase mb-1">
            Checkout
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
            Order summary
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-900">Cart</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-900">Summary</span>
            <ChevronRight className="h-3 w-3" />
            <span>Payment</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Delivery address
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Select where you want to receive your order
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAddressModalOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <Plus className="h-3 w-3" />
                  Add address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                  <p className="font-medium text-slate-800 mb-1">
                    No saved addresses
                  </p>
                  <p>
                    Add a delivery address to place your order. You can manage multiple addresses from here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex gap-3 rounded-xl border px-3 py-3 text-xs cursor-pointer ${
                        selectedAddressId === addr._id
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 h-3 w-3"
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                      />
                      <div>
                        <p className="text-[11px] font-semibold text-slate-900 mb-0.5">
                          {addr.fullName} • {addr.phone}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {addr.houseNo}, {addr.roadName}
                        </p>
                        <p className="text-[11px] text-slate-600">
                          {addr.city}, {addr.state} - {addr.pinCode}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Items in your order
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {cart.items.length} item(s)
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {cart.items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex gap-3 py-3 items-center"
                  >
                    <div className="h-16 w-16 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900 mb-0.5 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mb-1">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-xs font-semibold text-slate-900">
                        ₹{(item.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-900">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-emerald-600">
                        Delivery by {estimatedDeliveryDate()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Delivery estimate
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Based on your selected address and items
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-700">
                <p className="font-semibold text-slate-900 mb-0.5">
                  Delivery by {estimatedDeliveryDate()}
                </p>
                <p className="text-[11px] text-emerald-600">
                  Free delivery on this order
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Price details
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Final amount payable at payment step
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Price ({cart.items.length} items)</span>
                  <span>₹{itemsTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST</span>
                  <span>₹{gstAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform fee</span>
                  <span>₹{platformFee.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Delivery charges</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-slate-100 pt-2 mt-1 flex justify-between text-sm font-semibold text-slate-900">
                  <span>Total amount</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={handleContinueToPayment}
                className="mt-4 w-full rounded-full bg-black text-white text-xs font-semibold py-2.5 hover:bg-slate-900"
              >
                Continue to payment
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="mt-2 w-full rounded-full border border-slate-200 text-xs font-semibold py-2.5 text-slate-700 hover:bg-slate-50"
              >
                Back to cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        maxWidth="max-w-md"
        title=""
        subtitle=""
      >
        <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
          <p className="text-sm font-semibold text-slate-900 mb-1">
            Add new address
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-slate-600 mb-1">Full name</label>
              <input
                type="text"
                name="fullName"
                value={addressForm.fullName}
                onChange={handleAddressChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/5"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={addressForm.phone}
                onChange={handleAddressChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/5"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-slate-600 mb-1">Pincode</label>
              <input
                type="number"
                name="pinCode"
                value={addressForm.pinCode}
                onChange={handleAddressChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/5"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={addressForm.state}
                onChange={handleAddressChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/5"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-slate-600 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={addressForm.city}
                onChange={handleAddressChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/5"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">House no</label>
              <input
                type="text"
                name="houseNo"
                value={addressForm.houseNo}
                onChange={handleAddressChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/5"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Road name</label>
            <input
              type="text"
              name="roadName"
              value={addressForm.roadName}
              onChange={handleAddressChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddressModalOpen(false)}
              className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingAddress}
              className="rounded-full bg-black text-white px-5 py-1.5 text-xs font-semibold hover:bg-slate-900 disabled:opacity-60"
            >
              {savingAddress ? "Saving..." : "Save address"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default OrderSummaryPage;
