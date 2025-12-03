import React, { useState } from "react";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import axios from 'axios';

const products = [
  {
    id: 1,
    name: "Brown Hat Craft",
    price: 50100,
    rating: 5,
    image:
      "https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 2,
    name: "Slim-Fit Formal Suit Blazer",
    price: 48900,
    rating: 3,
    image:
      "https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 3,
    name: "Half Sleeve T-Shirt",
    price: 58900,
    rating: 4,
    image:
      "https://images.pexels.com/photos/1002638/pexels-photo-1002638.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 4,
    name: "Geometric Print Relaxed Fit Tee",
    price: 69000,
    rating: 5,
    image:
      "https://images.pexels.com/photos/7671165/pexels-photo-7671165.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 5,
    name: "Casual Denim Jacket",
    price: 42900,
    rating: 4,
    image:
      "https://images.pexels.com/photos/769109/pexels-photo-769109.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 6,
    name: "Classic White Sneakers",
    price: 37900,
    rating: 5,
    image:
      "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 7,
    name: "Everyday Tote Bag",
    price: 28900,
    rating: 4,
    image:
      "https://images.pexels.com/photos/834875/pexels-photo-834875.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: 8,
    name: "Summer Floral Dress",
    price: 63900,
    rating: 5,
    image:
      "https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];
function StarRating({ rating }) {
  return (
    <div className="flex justify-center gap-0.5 text-emerald-600">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? "opacity-100" : "opacity-30"}>
          ★
        </span>
      ))}
    </div>
  );
}

function FeaturedProducts() {
  const [wishlist, setWishlist] = useState([]);

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

  return (
    <section className="w-full bg-white py-14">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-slate-900">
            Featured Products
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            We have your occasion covered
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                className="group flex flex-col rounded-3xl bg-slate-50 p-4 pb-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative mb-4 flex items-center justify-center rounded-2xl bg-white py-10">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-52 w-auto object-contain"
                  />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isWishlisted ? "fill-red-500 text-red-500" : "text-slate-700"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-1 flex-col items-center text-center">
                  <StarRating rating={product.rating} />
                  <h3 className="mt-3 text-sm font-medium text-slate-900">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Rs. {product.price.toLocaleString("en-IN")}.00
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
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
