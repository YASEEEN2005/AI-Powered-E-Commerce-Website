import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Modal from "../componets/Modal";

const api = import.meta.env.VITE_BACKEND_API;

function StyleCollections() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${api}/api/products`);
        const data = res.data?.data || [];
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products for collections:", err);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  const handleOpenCategory = (key) => {
    setSelectedCategoryKey(key);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedCategoryKey(null);
  };

  const categoryTitle = useMemo(() => {
    if (selectedCategoryKey === "mobile") return "Mobiles & Smartphones";
    if (selectedCategoryKey === "home-appliances") return "Home Appliances";
    return "Products";
  }, [selectedCategoryKey]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategoryKey) return [];

    if (!products || products.length === 0) return [];

    return products.filter((p) => {
      const rawCategory =
        p.category || p.mainCategory || p.subCategory || p.type || "";
      const cat = String(rawCategory).toLowerCase();

      if (selectedCategoryKey === "mobile") {
        return (
          cat.includes("mobile") ||
          cat.includes("smartphone") ||
          cat.includes("phone")
        );
      }

      if (selectedCategoryKey === "home-appliances") {
        return (
          cat.includes("appliance") ||
          cat.includes("fridge") ||
          cat.includes("refrigerator") ||
          cat.includes("washing") ||
          cat.includes("machine") ||
          cat.includes("ac") ||
          cat.includes("air conditioner") ||
          cat.includes("oven")
        );
      }

      return false;
    });
  }, [selectedCategoryKey, products]);

  const visibleProducts = useMemo(() => {
    if (!filteredProducts.length) return [];
    return filteredProducts.slice(0, 8);
  }, [filteredProducts]);

  const handleViewProduct = (product) => {
    const id = product.product_id || product._id;
    if (!id) return;
    navigate(`/product/${id}`);
    setModalOpen(false);
  };

  return (
    <>
      <section className="w-full bg-white py-10">
        <div className="mx-auto max-w-[1400px] px-6 grid gap-6 lg:grid-cols-2">
          <div className="flex items-center justify-between rounded-3xl bg-[#cfcfd2] px-8 py-10">
            <div className="max-w-xs space-y-3">
              <p className="text-xs font-medium tracking-[0.25em] text-slate-700 uppercase">
                Mobile Collection
              </p>
              <h3 className="text-3xl font-semibold text-slate-900">
                Latest Smartphones
              </h3>
              <p className="text-xs text-slate-700 mt-1">
                Top brands, AI-picked just for you.
              </p>
              <button
                onClick={() => handleOpenCategory("mobile")}
                className="mt-4 text-sm font-medium text-slate-900 underline underline-offset-4"
              >
                Shop Now
              </button>
            </div>

            <div className="hidden md:block">
              <img
                src="/images/Gemini_Generated_Image_of4gm1of4gm1of4g-removebg-preview.png"
                alt="Latest Smartphones"
                className="h-64 w-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* Home Appliances banner */}
          <div className="flex items-center justify-between rounded-3xl bg-[#eef0f2] px-8 py-10">
            <div className="max-w-xs space-y-3">
              <p className="text-xs font-medium tracking-[0.25em] text-slate-700 uppercase">
                Home Appliances
              </p>
              <h3 className="text-3xl font-semibold text-slate-900">
                Smart Home Essentials
              </h3>
              <p className="text-xs text-slate-700 mt-1">
                Cooling, cleaning & more for every home.
              </p>
              <button
                onClick={() => handleOpenCategory("home-appliances")}
                className="mt-4 text-sm font-medium text-slate-900 underline underline-offset-4"
              >
                Shop Now
              </button>
            </div>

            <div className="hidden md:block">
              <img
                src="/images/Gemini_Generated_Image_4ndxg14ndxg14ndx-removebg-preview.png"
                alt="Home Appliances"
                className="h-64 w-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modal for category products */}
      <Modal
        isOpen={modalOpen}
        onClose={handleClose}
        title={categoryTitle}
        subtitle={
          loading
            ? "Fetching the best options for you…"
            : "Showing top picks from this category."
        }
        maxWidth="max-w-3xl"
      >
        {loading ? (
          <p className="text-sm text-slate-500">Loading products...</p>
        ) : !visibleProducts.length ? (
          <p className="text-sm text-slate-500">
            No products found in this category yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => {
              const id = product.product_id || product._id;
              const image =
                (product.images && product.images[0]) ||
                product.image ||
                "https://via.placeholder.com/300x300?text=Product";

              return (
                <div
                  key={id}
                  className="border border-slate-200 rounded-xl p-3 flex flex-col gap-2 bg-white"
                >
                  <div className="w-full h-32 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={image}
                      alt={product.name}
                      className="h-28 w-auto object-contain"
                    />
                  </div>
                  <div className="flex-1 flex flex-col text-sm">
                    <p className="font-semibold text-slate-900 line-clamp-2">
                      {product.name}
                    </p>
                    <p className="mt-1 text-slate-800 font-semibold">
                      ₹{Number(product.price || 0).toLocaleString("en-IN")}
                    </p>
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="mt-2 text-xs font-medium rounded-full border border-slate-300 px-3 py-1 hover:bg-slate-50 text-slate-900 self-start"
                    >
                      View Product
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </>
  );
}

export default StyleCollections;
