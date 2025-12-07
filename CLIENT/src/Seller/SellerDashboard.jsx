import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const api = import.meta.env.VITE_BACKEND_API;

function SellerDashboard() {
  const { seller, sellerToken } = useAuth();
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seller?.seller_id || !sellerToken) return;

    const fetchData = async () => {
      try{
        const [prodRes, orderRes] = await Promise.all([
          axios.get(`${api}/api/seller/${seller.seller_id}/products`, {
            headers: { Authorization: `Bearer ${sellerToken}` },
          }),
          axios.get(`${api}/api/seller/${seller.seller_id}/orders`, {
            headers: { Authorization: `Bearer ${sellerToken}` },
          }),
        ]);

        const products = prodRes.data?.data || [];
        const orders = orderRes.data?.data || [];

        const ordersCount = orders.length;
        const productsCount = products.length;

        const revenue = orders.reduce((sum, o) => {
          const total =
            Number(o.totalAmount) ||
            Number(o.total_amount) ||
            Number(o.amount) ||
            0;
          return sum + total;
        }, 0);

        setStats({ productsCount, ordersCount, revenue });
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error("Error loading seller dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [seller?.seller_id, sellerToken]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-10 text-sm text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, {seller?.shop_name || seller?.name || "Seller"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here’s an overview of your store performance.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em]">
            Products
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {stats.productsCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Total active products in your store.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em]">
            Orders
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {stats.ordersCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Orders associated with your products.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em]">
            Revenue (₹)
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {stats.revenue.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Approximate total revenue from your orders.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Orders
          </h2>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-4">Order ID</th>
                  <th className="py-2 pr-4">Items</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 text-slate-800 text-[11px]">
                      #{order.order_id || order._id?.slice(-6)}
                    </td>
                    <td className="py-2 pr-4 text-slate-700 text-[11px]">
                      {(order.items || []).length} item(s)
                    </td>
                    <td className="py-2 pr-4 text-slate-800 text-[11px]">
                      ₹
                      {(
                        order.totalAmount ||
                        order.total_amount ||
                        order.amount ||
                        0
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 pr-4 text-[11px]">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-700">
                        {order.status || "Placed"}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-slate-500 text-[11px]">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )
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

export default SellerDashboard;
