import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function CartPage() {
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null); 

  useEffect(() => {
    if (!isAuthenticated || !user?.user_id) {
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/cart/${user.user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCart(res.data.data || null);
      } catch (err) {
        console.error("Error fetching cart:", err);
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, user, token]);

  const handleUpdateQuantity = async (product_id, newQuantity) => {
    if (!cart) return;

    if (newQuantity < 1) {
      toast.info("Minimum quantity is 1");
      return;
    }

    setUpdatingItem(product_id);

    const payload = {
      user_id: cart.user_id,
      product_id,
      quantity: newQuantity,
    };

    try {
      const res = await axios.put(
        "http://localhost:5000/api/cart/item",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(res.data.data);
      toast.success("Cart updated");
    } catch (err) {
      console.error("Error updating cart item:", err);
      toast.error(err.response?.data?.message || "Failed to update cart");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (product_id) => {
    if (!cart) return;

    setUpdatingItem(product_id);

    try {
      const payload = {
        user_id: cart.user_id,
        product_id,
        quantity: 0,
      };

      const res = await axios.put(
        "http://localhost:5000/api/cart/item",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCart(res.data.data);
      toast.success("Item removed from cart");
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error(err.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdatingItem(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
        <p className="text-slate-600 mb-6">
          Please log in to view and manage your cart.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-2 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shopping
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-3" />
        <p className="text-slate-600 text-sm">Loading your cart...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-2">Your Cart is Empty</h1>
        <p className="text-slate-600 mb-6">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full bg-black text-white px-6 py-2 text-sm font-medium hover:bg-slate-900"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal =
    cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const gst = cart.gst_amount ?? 0;
  const platformFee = cart.platform_fee ?? 0;
  const total = cart.totalAmount ?? subtotal + gst + platformFee;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Your Cart
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.product_id}
                className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100"
              >
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                        {item.name}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Product ID: {item.product_id}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      disabled={updatingItem === item.product_id}
                      className="text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">Qty</span>
                      <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product_id,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1 || updatingItem === item.product_id}
                          className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="mx-2 text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product_id,
                              item.quantity + 1
                            )
                          }
                          disabled={updatingItem === item.product_id}
                          className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ₹{item.price.toLocaleString("en-IN")} each
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/products"
              className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue shopping
            </Link>
          </div>

          <div className="h-fit rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">GST</span>
                <span className="font-medium">
                  ₹{gst.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Platform Fee</span>
                <span className="font-medium">
                  ₹{platformFee.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="my-3 h-px bg-slate-100" />

              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-900">
                  Total
                </span>
                <span className="text-lg font-bold text-slate-900">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              onClick={() => toast.info("Checkout flow coming soon 😉")}
              className="mt-5 w-full rounded-full bg-black text-white py-2.5 text-sm font-medium hover:bg-slate-900 disabled:opacity-50"
            >
              Proceed to Checkout
            </button>

            <p className="mt-2 text-[11px] text-slate-500 text-center">
              Taxes and discounts are included based on your current cart.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
