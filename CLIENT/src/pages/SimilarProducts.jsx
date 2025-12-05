import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SimilarProducts({ category, currentProductId }) {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { token } = useAuth();
  const api = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    if (!category) {
      setLoading(false);
      return;
    }

    const fetchSimilar = async () => {
      try {
        const headers = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await axios.get(`${api}/api/products`, {
          headers,
        });

        const all = res.data.data || [];
        const filtered = all.filter(
          (p) => p.category === category && p.product_id !== currentProductId
        );

        setSimilarProducts(filtered.slice(0, 12));
      } catch (err) {
        setSimilarProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [category, currentProductId, token]);

  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -260, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 260, behavior: "smooth" });
  };

  const handleClickCard = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading || !category || similarProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900">
            Similar products in {category}
          </h2>
          <p className="text-[11px] text-slate-500">
            Explore more options you might like.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={scrollRight}
            className="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={scrollLeft}
          className="sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-white/95 border border-slate-200 text-slate-600 shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto py-2 px-1 scroll-smooth"
        >
          {similarProducts.map((item) => (
            <button
              key={item.product_id}
              onClick={() => handleClickCard(item.product_id)}
              className="min-w-[140px] max-w-[160px] flex-shrink-0 flex flex-col items-center rounded-2xl border border-slate-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <div className="h-28 w-full flex items-center justify-center overflow-hidden rounded-t-2xl bg-slate-50">
                <img
                  src={item.image || item.images?.[0]}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="px-2 py-2 text-center">
                <p className="text-xs font-medium text-slate-800 line-clamp-2">
                  {item.name}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  From{" "}
                  <span className="font-semibold text-slate-900">
                    ₹{(item.price || 0).toLocaleString("en-IN")}
                  </span>
                </p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={scrollRight}
          className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-white/95 border border-slate-200 text-slate-600 shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default SimilarProducts;
