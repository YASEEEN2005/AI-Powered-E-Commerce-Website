import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

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

function FeaturedProducts({ openLoginModal }) {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const { isAuthenticated, user, token } = useAuth();
  const { loadCartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await axios.get(`${api}/api/products`);
        const data = res.data.data || [];
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    getProducts();
  }, []);

  const toggleWishlist = async (product, e) => {
    if (e) e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please login to use wishlist");
      if (openLoginModal) openLoginModal();
      return;
    }

    if (!user?.user_id) {
      toast.error("User data not loaded");
      return;
    }

    const payload = {
      user_id: user.user_id,
      product_id: product.product_id,
    };

    try {
      const res = await axios.post(`${api}/api/wishlist/add`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWishlist((prev) =>
        prev.includes(product.product_id)
          ? prev.filter((pid) => pid !== product.product_id)
          : [...prev, product.product_id]
      );

      toast.success(res.data?.message || "Wishlist updated");
    } catch (err) {
      console.error("Wishlist error:", err);
      toast.error(err.response?.data?.message || "Failed to update wishlist");
    }
  };

  const handleAddToCart = async (product, e) => {
    if (e) e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please login to use cart");
      if (openLoginModal) openLoginModal();
      return;
    }

    if (!user?.user_id) {
      toast.error("User data not loaded");
      return;
    }

    const payload = {
      user_id: user.user_id,
      product_id: product.product_id,
      quantity: 1,
    };

    try {
      const { data } = await axios.post(`${api}/api/cart/add`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      loadCartCount();
      toast.success(data?.message || "Product added to cart");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleBuyNow = (product, e) => {
    if (e) e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please login to continue");
      if (openLoginModal) openLoginModal();
      return;
    }

    if (!user?.user_id) {
      toast.error("User data not loaded");
      return;
    }

    const image =
      (product.images && product.images[0]) ||
      "https://via.placeholder.com/300x300?text=Product";

    const buyNowItem = {
      productId: product.product_id,
      name: product.name,
      price: product.price,
      image: image,
      quantity: 1,
    };

    navigate("/order-summary", {
      state: {
        mode: "BUY_NOW",
        items: [buyNowItem],
        user_id: user.user_id,
      },
    });
  };

  const handleCardClick = (product) => {
    const id = product.product_id || product._id;
    if (!id) return;
    navigate(`/product/${id}`);
  };

  const visibleProducts = products.slice(0, 8);

  return (
    <section className="w-full bg-white py-10">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            Featured Products
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Handpicked styles just for you
          </p>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            Loading products...
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => {
              const id = product.product_id || product._id;
              const isWishlisted = wishlist.includes(id);
              const image =
                (product.images && product.images[0]) ||
                "https://via.placeholder.com/300x300?text=Product";
              const rating = product.rating || 0;

              return (
                <div
                  key={id}
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
                    <div className="flex items-center justify-between mb-1">
                      <StarRating rating={rating} />
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                        Featured
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-slate-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      Rs. {Number(product.price || 0).toLocaleString("en-IN")}
                      .00
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
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
