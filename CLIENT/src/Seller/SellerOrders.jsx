import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const api = import.meta.env.VITE_BACKEND_API;

function SellerOrders() {
  const { seller, sellerToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seller?.seller_id || !sellerToken) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${api}/api/seller/${seller.seller_id}/orders`,
          {
            headers: { Authorization: `Bearer ${sellerToken}` },
          }
        );
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error("Error loading seller orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [seller?.seller_id, sellerToken]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Orders</h1>
        <p className="text-xs text-slate-500 mt-1">
          Orders that include your products.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <p className="text-xs text-slate-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-xs text-slate-500">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-4">Order ID</th>
                  <th className="py-2 pr-4">Items</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Placed On</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 text-[11px] text-slate-800">
                      #{o.order_id || o._id?.slice(-6)}
                    </td>
                    <td className="py-2 pr-4 text-[11px] text-slate-700">
                      {(o.items || []).length} item(s)
                    </td>
                    <td className="py-2 pr-4 text-[11px] text-slate-800">
                      ₹
                      {(
                        o.totalAmount ||
                        o.total_amount ||
                        o.amount ||
                        0
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 pr-4 text-[11px]">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-700">
                        {o.status || "Placed"}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-[11px] text-slate-500">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString("en-IN", {
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

export default SellerOrders;
