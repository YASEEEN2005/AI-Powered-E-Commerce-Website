import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Star,
  StarHalf,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Package,
  Store,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import SimilarProducts from "./SimilarProducts";
import { useCart } from "../context/CartContext";

const api = import.meta.env.VITE_BACKEND_API;

function ProductDetailsPage({ openLoginModal }) {
  const { product_id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();
  const { loadCartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [wishlistActive, setWishlistActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const headers = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await axios.get(`${api}/api/products/${product_id}`, {
          headers,
        });

        const data = res.data.data;
        setProduct(data || null);
      } catch (err) {
        console.error("Product fetch error:", err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [product_id, token]);

  // Images list
  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    if (product.image) return [product.image];
    return [];
  }, [product]);

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product]);

  const handlePrevImage = () => {
    if (!images.length) return;
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    if (!images.length) return;
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.info("Please login to use wishlist");
      openLoginModal && openLoginModal();
      return;
    }

    if (!user?.user_id) {
      toast.error("User data not loaded");
      return;
    }

    try {
      await axios.post(
        `${api}/api/wishlist/add`,
        {
          user_id: user.user_id,
          product_id: product.product_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWishlistActive((prev) => !prev);
      toast.success(
        wishlistActive ? "Removed from wishlist" : "Added to wishlist"
      );
    } catch (err) {
      console.error("Wishlist error:", err);
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.info("Please login to use cart");
      openLoginModal && openLoginModal();
      return;
    }

    if (!user?.user_id) {
      toast.error("User data not loaded");
      return;
    }

    const payload = {
      user_id: user.user_id,
      product_id: product.product_id,
      quantity,
    };

    try {
      const res = await axios.post(`${api}/api/cart/add`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        validateStatus: () => true,
      });

      if (res.status >= 200 && res.status < 300) {
        toast.success("Added to cart");
        loadCartCount?.();
      } else {
        toast.error(res.data?.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Cart error:", err);
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.info("Please login to continue");
      openLoginModal && openLoginModal();
      return;
    }

    if (!user?.user_id) {
      toast.error("User data not loaded");
      return;
    }

    const payload = {
      user_id: user.user_id,
      product_id: product.product_id,
      quantity,
    };

    try {
      const res = await axios.post(`${api}/api/cart/add`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        validateStatus: () => true,
      });

      if (res.status >= 200 && res.status < 300) {
        navigate("/cart");
      } else {
        toast.error(res.data?.message || "Failed to proceed");
      }
    } catch (err) {
      console.error("Buy now error:", err);
      toast.error("Failed to proceed");
    }
  };

  const handleDecreaseQty = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleIncreaseQty = () => {
    setQuantity((prev) => prev + 1);
  };

  const renderRatingStars = (ratingValue) => {
    const rating = ratingValue || 4.5;
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    const totalStars = 5;
    const stars = [];

    for (let i = 0; i < full; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="h-3.5 w-3.5 text-amber-500 fill-amber-400"
        />
      );
    }

    if (hasHalf) {
      stars.push(
        <StarHalf
          key="half"
          className="h-3.5 w-3.5 text-amber-500 fill-amber-400"
        />
      );
    }

    const remaining = totalStars - full - (hasHalf ? 1 : 0);
    for (let i = 0; i < remaining; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-slate-300" />
      );
    }

    return stars;
  };

  const deliveryDateString = useMemo(() => {
    const now = new Date();
    const delivery = new Date(now);
    delivery.setDate(now.getDate() + 7);
    const options = { day: "numeric", month: "short" };
    return delivery.toLocaleDateString("en-IN", options);
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-black animate-spin" />
          <p className="text-sm text-slate-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <p className="text-sm text-slate-500 mb-2">Product not found</p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-xs font-medium shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const price = product.price || 0;
  const mrp = product.mrp || Math.round(price * 1.15);
  const discountPercent = Math.max(0, Math.round(((mrp - price) / mrp) * 100));
  const rating = product.rating || 4.4;
  const ratingCount = product.ratingCount || 220;
  const inStock = product.stock == null ? true : product.stock > 0;

  return (
    <div className="bg-slate-50 min-h-screen pb-8">
      <div className="max-w-6xl mx-auto px-4 pt-4 lg:pt-6">
        {/* Top bar: back + breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:underline">
              Products
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <span>{product.category}</span>
              </>
            )}
          </div>
        </div>

        {/* Small breadcrumb for mobile */}
        <div className="sm:hidden mb-3 text-[11px] text-slate-500 flex items-center gap-1">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:underline">
            Products
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-slate-700">{product.name}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr,1.45fr]">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex flex-col gap-4">
            <div className="grid grid-cols-[72px,1fr] gap-3">
              

              <div className="relative rounded-2xl bg-slate-50 flex items-center justify-center h-72 sm:h-80 overflow-hidden">
                {images[selectedImageIndex] ? (
                  <img
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 ease-out"
                  />
                ) : (
                  <span className="text-xs text-slate-400">
                    Image not available
                  </span>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-600 shadow-md hover:bg-white hover:shadow-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-600 shadow-md hover:bg-white hover:shadow-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                <button
                  onClick={handleToggleWishlist}
                  className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-500 hover:text-red-500 shadow-md hover:shadow-lg transition"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      wishlistActive ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5">
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {rating.toFixed(1)}
                  </span>
                  <div className="flex items-center">
                    {renderRatingStars(rating)}
                  </div>
                </div>
                <span className="text-[11px] text-slate-500">
                  {ratingCount}+ ratings
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {inStock ? (
                  <span className="text-emerald-600 font-medium">In stock</span>
                ) : (
                  <span className="text-red-500 font-medium">Out of stock</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-1">
                {product.brand || "Featured Product"}
              </p>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
                {product.name}
              </h1>
              {product.description && (
                <p className="mt-1 text-xs text-slate-600 line-clamp-3">
                  {product.description}
                </p>
              )}

              <div className="mt-4 flex items-end gap-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900">
                    ₹{price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs line-through text-slate-400">
                    ₹{mrp.toLocaleString("en-IN")}
                  </p>
                  {discountPercent > 0 && (
                    <p className="text-xs font-semibold text-emerald-600">
                      {discountPercent}% off
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-1 text-[11px] text-emerald-600">
                Inclusive of all taxes
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                <div className="flex items-start gap-2">
                  <Truck className="h-4 w-4 text-slate-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">
                      Free Delivery Available
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Delivery by{" "}
                      <span className="font-semibold">
                        {deliveryDateString}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">
                      7-day Replacement
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Replacement available for eligible issues.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Package className="h-4 w-4 text-slate-500" />
                  <span>Original product guaranteed</span>
                </div>
              </div>

              {/* Quantity + buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                  <button
                    onClick={handleDecreaseQty}
                    className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-medium">{quantity}</span>
                  <button
                    onClick={handleIncreaseQty}
                    className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900 bg-white text-slate-900 px-5 py-2 text-xs font-semibold shadow-sm hover:bg-slate-900 hover:text-white disabled:opacity-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!inStock}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-5 py-2 text-xs font-semibold shadow-sm hover:bg-slate-900 disabled:opacity-50"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            {/* Product details */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Product Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Category</span>
                  <span className="font-medium">{product.category || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Brand</span>
                  <span className="font-medium">{product.brand || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Seller ID</span>
                  <span className="font-medium">
                    {product.seller_id || "-"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Stock</span>
                  <span className="font-medium">
                    {product.stock != null ? product.stock : "Available"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Rating</span>
                  <span className="font-medium">
                    {rating.toFixed(1)} ({ratingCount}+)
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Product ID</span>
                  <span className="font-medium">
                    {product.product_id || "-"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                <Store className="h-4 w-4 text-slate-500" />
                <span>
                  Sold by{" "}
                  <span className="font-medium">
                    {product.brand || "SwiftCart Seller"}
                  </span>
                </span>
              </div>
            </div>

            {/* Highlights */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Highlights
              </h2>
              {Array.isArray(product.highlights) &&
              product.highlights.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                  {product.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              ) : (
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                  <li>Premium quality with trusted brand value</li>
                  <li>Optimized performance for everyday and heavy use</li>
                  <li>Backed by secure payments and easy returns</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Similar products */}
        <SimilarProducts
          category={product.category}
          currentProductId={product.product_id}
        />
      </div>
    </div>
  );
}

export default ProductDetailsPage;
