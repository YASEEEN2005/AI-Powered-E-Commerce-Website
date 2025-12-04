import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { HeartOff, ArrowLeft, Loader2, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function WishlistPage() {
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.user_id) {
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/wishlist/${user.user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setWishlist(res.data.data || null);
      } catch (err) {
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, user, token]);

  const items = wishlist?.items || [];

  const handleRemoveItem = async (product_id) => {
    setProcessing(product_id);

    try {
      await axios.delete("http://localhost:5000/api/wishlist/item", {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          user_id: user.user_id,
          product_id
        }
      });

      setWishlist((prev) =>
        prev
          ? { ...prev, items: prev.items.filter((i) => i.product_id !== product_id) }
          : prev
      );

      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove item");
    } finally {
      setProcessing(null);
    }
  };

  const handleClearWishlist = async () => {
    if (!items.length) {
      toast.info("Wishlist already empty");
      return;
    }

    setProcessing("all");

    try {
      await axios.delete(`http://localhost:5000/api/wishlist/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setWishlist((prev) => (prev ? { ...prev, items: [] } : prev));
      toast.success("Wishlist cleared");
    } catch (err) {
      toast.error("Failed to clear wishlist");
    } finally {
      setProcessing(null);
    }
  };

  const handleMoveToCart = async (item) => {
    setProcessing(item.product_id);

    const payload = {
      user_id: user.user_id,
      product_id: item.product_id,
      quantity: 1
    };

    try {
      await axios.post("http://localhost:5000/api/cart/add", payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setWishlist((prev) =>
        prev
          ? { ...prev, items: prev.items.filter((p) => p.product_id !== item.product_id) }
          : prev
      );

      toast.success("Moved to cart");
    } catch (err) {
      toast.error("Failed to move to cart");
    } finally {
      setProcessing(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">Your Wishlist</h1>
        <p className="text-slate-600 mb-6">Please log in to view your wishlist.</p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-2 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600 mb-3" />
        <p className="text-slate-600 text-sm">Loading your wishlist...</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <HeartOff className="h-10 w-10 text-slate-400 mx-auto mb-3" />
        <h1 className="text-2xl font-semibold">Your Wishlist is Empty</h1>
        <p className="text-slate-600 mb-6">Save items to view them later.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full bg-black text-white px-6 py-2 text-sm font-medium hover:bg-slate-900"
        >
          <ShoppingBag className="h-4 w-4" />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Wishlist</h1>
            <p className="text-sm text-slate-600 mt-1">
              {items.length} item{items.length !== 1 ? "s" : ""} saved
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearWishlist}
              disabled={processing === "all"}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear Wishlist
            </button>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium shadow-sm hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="group rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all"
            >
              <div className="relative h-52 bg-white rounded-xl overflow-hidden shadow-sm border-b border-slate-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover object-center transition duration-300 ease-out group-hover:scale-110"
                  loading="lazy"
                />

                <button
                  onClick={() => handleRemoveItem(item.product_id)}
                  disabled={processing === item.product_id}
                  className="absolute top-3 right-3 h-9 w-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-500 hover:text-red-500 shadow-md hover:shadow-lg transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col p-4 flex-1">
                <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">{item.name}</h2>
                <p className="mt-1 text-xs text-slate-500">Product ID: {item.product_id}</p>

                <p className="mt-3 text-base font-semibold text-slate-900">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    disabled={processing === item.product_id}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-black text-white px-3 py-2 text-xs font-medium hover:bg-slate-900 disabled:opacity-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Move to Cart
                  </button>

                  <Link
                    to={`/product/${item.product_id}`}
                    className="flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WishlistPage;
