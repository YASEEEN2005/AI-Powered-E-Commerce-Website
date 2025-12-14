import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { forwardRef } from "react";

const api = import.meta.env.VITE_BACKEND_API;

const BestSelling = forwardRef((props, ref) => {
  const [products, setProducts] = useState([]);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${api}/api/products`);
        const data = res.data?.data || [];
        setProducts(data.slice(130, 145));
      } catch (err) {
        console.log(err);
      }
    };
    fetchProducts();
  }, []);

  const slideLeft = () => {
    sliderRef.current.scrollBy({ left: -250, behavior: "smooth" });
  };

  const slideRight = () => {
    sliderRef.current.scrollBy({ left: 250, behavior: "smooth" });
  };

  const goToProduct = (id) => {
    navigate(`/product/${id}`);
  };

  return (
     <section ref={ref}>
    <section className="w-full bg-white py-10 ">
      <div className="max-w-[1300px] mx-auto px-12 relative border border-slate-200 shadow-lg rounded-xl py-4">
        <h2 className="text-xl font-semibold mb-6">Best Selling</h2>

        <button
          onClick={slideLeft}
          className="absolute left-4 top-[55%] -translate-y-1/2 z-20 
               bg-white shadow-sm rounded-full p-2 border border-gray-200 
               hover:shadow-md"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={slideRight}
          className="absolute right-4 top-[55%] -translate-y-1/2 z-20 bg-white shadow-sm rounded-full p-2 border border-gray-200 hover:shadow-md"
        >
          <ChevronRight size={20} />
        </button>

        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth py-2 px-2"
        >
          {products.map((product) => {
            const id = product.product_id || product._id;
            const img =
              product?.images?.[0] ||
              product?.image ||
              "https://via.placeholder.com/200?text=Product";

            return (
              <div
                key={id}
                onClick={() => goToProduct(id)}
                className="flex flex-col items-center min-w-[120px] cursor-pointer hover:opacity-90 transition"
              >
                <div className="h-24 w-24 flex items-center justify-center overflow-hidden">
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <p className="text-[13px] font-medium mt-3 text-center line-clamp-2">
                  {product.name}
                </p>

                <p className="text-[13px] text-gray-800 font-semibold mt-1 text-center">
                  From ₹{Number(product.price || 0).toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
    </section>
  );
});

export default BestSelling;
