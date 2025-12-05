import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  SlidersHorizontal,
  Search,
  Heart,
  ShoppingBag,
  Star,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function ProductsPage({ openLoginModal }) {
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortOption, setSortOption] = useState("popular");
  const [maxPrice, setMaxPrice] = useState(0);
  const [priceFilter, setPriceFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const { loadCartCount } = useCart();
  const api = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await axios.get(`${api}/api/products`);
        const data = res.data.data || [];
        setProducts(data);

        const prices = data.map((p) => p.price || 0);
        const max = prices.length ? Math.max(...prices) : 0;
        setMaxPrice(max);
        setPriceFilter(max);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (selectedBrand !== "all") {
      list = list.filter((p) => p.brand === selectedBrand);
    }

    if (priceFilter > 0) {
      list = list.filter((p) => (p.price || 0) <= priceFilter);
    }

    if (sortOption === "price_low") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === "price_high") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortOption === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }

    return list;
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedBrand,
    priceFilter,
    sortOption,
  ]);

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.info("Please login to use wishlist");
      if (openLoginModal) openLoginModal();
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

      setWishlist((prev) =>
        prev.includes(product.product_id)
          ? prev.filter((id) => id !== product.product_id)
          : [...prev, product.product_id]
      );
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = async (product) => {
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
      const res = await axios.post(`${api}/api/cart/add`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        validateStatus: () => true,
      });

      if (res.status >= 200 && res.status < 300) {
        toast.success("Added to cart");
        loadCartCount();
      } else {
        toast.error(res.data?.message || "Failed to add to cart");
      }
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const handleViewProduct = (product) => {
    navigate(`/product/${product.product_id}`);
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-black animate-spin" />
          <p className="text-sm text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-10">
        <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              All Products
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Explore our curated collection of latest products.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">
                {showFilters ? "Hide Filters" : "Show Filters"}
              </span>
              <span className="sm:hidden">
                {showFilters ? "Hide" : "Filter"}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
              >
                <option value="popular">Sort: Popular</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 rounded-full border border-slate-200 bg-white pl-9 pr-8 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <XCircle className="h-4 w-4 text-slate-300 hover:text-slate-500" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          {showFilters && (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 h-fit">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  Filters
                </h2>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedBrand("all");
                    setPriceFilter(maxPrice);
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-800"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Category
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left text-[11px] px-2 py-1 rounded-full border ${
                        selectedCategory === "all"
                          ? "border-black bg-black text-white"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left text-[11px] px-2 py-1 rounded-full border ${
                          selectedCategory === cat
                            ? "border-black bg-black text-white"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Brand
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    <button
                      onClick={() => setSelectedBrand("all")}
                      className={`w-full text-left text-[11px] px-2 py-1 rounded-full border ${
                        selectedBrand === "all"
                          ? "border-black bg-black text-white"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      All Brands
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`w-full text-left text-[11px] px-2 py-1 rounded-full border ${
                          selectedBrand === brand
                            ? "border-black bg-black text-white"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">
                    Max Price
                  </p>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-500">
                      Up to ₹{priceFilter.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Max ₹{maxPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice || 0}
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          <div className={showFilters ? "" : "lg:col-span-2"}>
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-8 text-center">
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  No products found
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Try adjusting filters or searching with a different term.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedBrand("all");
                    setPriceFilter(maxPrice);
                  }}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium shadow-sm hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className="group rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all"
                  >
                    <div className="relative h-48 bg-white overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center transition duration-300 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-500 hover:text-red-500 shadow-sm hover:shadow-md transition"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            wishlist.includes(product.product_id)
                              ? "fill-red-500 text-red-500"
                              : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-col p-4 flex-1">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                        {product.brand || "Featured"}
                      </p>
                      <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {product.name}
                      </h2>

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-base font-semibold text-slate-900">
                          ₹{(product.price || 0).toLocaleString("en-IN")}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-amber-500">
                          <Star className="h-3 w-3 fill-amber-400" />
                          <span>{product.rating || 4.5}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-black text-white px-3 py-2 text-xs font-medium hover:bg-slate-900"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
