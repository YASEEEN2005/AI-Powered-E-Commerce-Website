import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import axios from "axios";

function StarRating({ rating = 0 }) {
  return (
    <div className="flex justify-center gap-0.5 text-emerald-600">
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
function NewArrivals() {
 const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        const data = res.data.data || [];
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    getProducts();
  }, []);

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (product) => {
    console.log("Add to cart:", product);
  };

  const handleBuyNow = (product) => {
    console.log("Buy now:", product);
  };

  const visibleProducts = products.slice(8, 16);

  return (
     <section className="w-full bg-white py-14">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-slate-900">
            New Arrivals
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            We have your occasion covered
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                className="group flex flex-col rounded-3xl bg-slate-50 p-4 pb-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative mb-4 flex items-center justify-center rounded-2xl bg-white py-10">
                  <img
                    src={image}
                    alt={product.name}
                    className="h-52 w-auto object-contain"
                  />
                  <button
                    onClick={() => toggleWishlist(id)}
                    className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white"
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

                <div className="flex flex-1 flex-col items-center text-center">
                  <StarRating rating={rating} />
                  <h3 className="mt-3 text-sm font-medium text-slate-900">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Rs. {Number(product.price || 0).toLocaleString("en-IN")}.00
                  </p>

                  <div className="mt-4 flex w-full flex-col gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-black"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleBuyNow(product)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900 hover:border-slate-400 hover:bg-slate-50"
                    >
                      <Zap className="h-4 w-4" />
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {products.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-500">
              Loading products...
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default NewArrivals
