import React, { useEffect, useState } from "react";
import { Heart, ShoppingCart, Sparkles, Zap } from "lucide-react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const api = import.meta.env.VITE_BACKEND_API;

function StarRating({ rating = 0 }) {
  return (
    <div className="flex gap-0.5 text-emerald-600 text-xs">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "opacity-100" : "opacity-30"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white animate-pulse">
      <div className="bg-slate-100 h-52" />

      <div className="p-3 space-y-2">
        <div className="h-3 w-20 bg-slate-200 rounded" />
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-4 w-2/3 bg-slate-200 rounded" />
        <div className="h-4 w-24 bg-slate-200 rounded mt-1" />

        <div className="mt-3 space-y-2">
          <div className="h-8 bg-slate-200 rounded-md" />
          <div className="h-8 bg-slate-100 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function PersonalizedRecommendations({ openLoginModal }) {
  const [products, setProducts] = useState([]);
  const [reason, setReason] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const { loadCartCount } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated || !user?.user_id) return;

      try {
        setLoading(true);

        const res = await axios.get(
          `${api}/api/recommend/${user.user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProducts(res.data.products || []);
        setReason(res.data.reason || "");
      } catch (error) {
        console.error("Recommendation error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated, user, token]);

  const toggleWishlist = async (product, e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please login to use wishlist");
      openLoginModal?.();
      return;
    }

    try {
      const payload = {
        user_id: user.user_id,
        product_id: product.product_id,
      };

      const res = await axios.post(`${api}/api/wishlist/add`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlist((prev) =>
        prev.includes(product.product_id)
          ? prev.filter((id) => id !== product.product_id)
          : [...prev, product.product_id]
      );

      toast.success(res.data?.message || "Wishlist updated");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please login to use cart");
      openLoginModal?.();
      return;
    }

    try {
      await axios.post(
        `${api}/api/cart/add`,
        {
          user_id: user.user_id,
          product_id: product.product_id,
          quantity: 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      loadCartCount();
      toast.success("Product added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = (product, e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please login to continue");
      openLoginModal?.();
      return;
    }

    navigate("/order-summary", {
      state: {
        mode: "BUY_NOW",
        items: [
          {
            productId: product.product_id,
            name: product.name,
            price: product.price,
            image: product.images?.[0],
            quantity: 1,
          },
        ],
        user_id: user.user_id,
      },
    });
  };

  const handleCardClick = (product) => {
    navigate(`/product/${product.product_id}`);
  };

  if (!isAuthenticated) return null;

  return (
    <section className="w-full bg-slate-50 py-12">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h2 className="text-2xl font-semibold text-slate-900">
              Made for You
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {reason || "Personalized picks curated just for you"}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <RecommendationSkeleton key={i} />
              ))
            : products.map((product) => {
                const image =
                  product.images?.[0] ||
                  "https://via.placeholder.com/300x300?text=Product";

                const isWishlisted = wishlist.includes(product.product_id);

                return (
                  <div
                    key={product.product_id}
                    onClick={() => handleCardClick(product)}
                    className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition"
                  >
                    <div className="relative bg-slate-50 flex items-center justify-center h-52">
                      <img
                        src={image}
                        alt={product.name}
                        className="h-44 w-auto object-contain"
                      />
                      <button
                        onClick={(e) => toggleWishlist(product, e)}
                        className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-sm"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isWishlisted
                              ? "fill-red-500 text-red-500"
                              : "text-slate-700"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col p-3">
                      <StarRating rating={product.rating || 0} />
                      <h3 className="mt-1 text-sm font-medium text-slate-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        Rs. {product.price.toLocaleString("en-IN")}.00
                      </p>

                      <div className="mt-3 flex flex-col gap-2">
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </button>
                        <button
                          onClick={(e) => handleBuyNow(product, e)}
                          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                        >
                          <Zap className="h-4 w-4" />
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
}

export default PersonalizedRecommendations;
