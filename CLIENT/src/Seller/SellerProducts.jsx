import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const api = import.meta.env.VITE_BACKEND_API;

function SellerProducts() {
  const { seller, sellerToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seller?.seller_id || !sellerToken) return;

    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${api}/api/seller/${seller.seller_id}/products`,
          {
            headers: { Authorization: `Bearer ${sellerToken}` },
          }
        );
        setProducts(res.data?.data || []);
      } catch (err) {
        console.error("Error loading seller products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [seller?.seller_id, sellerToken]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Your Products
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage all the products you are selling on SwiftCart.
          </p>
        </div>

        <button className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900">
          + Add Product
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <p className="text-xs text-slate-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-xs text-slate-500">No products added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Stock</th>
                  <th className="py-2 pr-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id || p.product_id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 text-[11px] text-slate-800">
                      {p.name}
                    </td>
                    <td className="py-2 pr-4 text-[11px] text-slate-600">
                      {p.category || "-"}
                    </td>
                    <td className="py-2 pr-4 text-[11px] text-slate-800">
                      ₹{Number(p.price || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 pr-4 text-[11px] text-slate-800">
                      {p.stock || p.quantity || "-"}
                    </td>
                    <td className="py-2 pr-4 text-[11px] text-slate-500">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerProducts;
