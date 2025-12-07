import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingBag,
  Package,
  IndianRupee,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const api = import.meta.env.VITE_BACKEND_API;

function SellerDashboard() {
  const { seller, sellerToken } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    revenue: 0,
  });

  const [orders, setOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seller?.seller_id || !sellerToken) return;

    const fetchData = async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          axios.get(`${api}/api/seller/${seller.seller_id}/products`, {
            headers: { Authorization: `Bearer ${sellerToken}` },
          }),
          axios.get(`${api}/api/seller/${seller.seller_id}/orders`, {
            headers: { Authorization: `Bearer ${sellerToken}` },
          }),
        ]);

        const products = prodRes.data?.data || [];
        const ordersData = orderRes.data?.data || [];

        const ordersCount = ordersData.length;
        const productsCount = products.length;

        const revenue = ordersData.reduce((sum, o) => {
          const total =
            Number(o.totalAmount) ||
            Number(o.total_amount) ||
            Number(o.amount) ||
            0;
          return sum + total;
        }, 0);

        setStats({ productsCount, ordersCount, revenue });
        setOrders(ordersData);
        setRecentOrders(ordersData.slice(0, 5));
      } catch (err) {
        console.error("Error loading seller dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [seller?.seller_id, sellerToken]);

  // ----- Derived stats for premium cards -----
  const totalRevenue = stats.revenue || 0;
  const totalOrders = stats.ordersCount || 0;
  const avgOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const today = new Date();
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isSameMonth = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();

  let todayRevenue = 0;
  let monthRevenue = 0;
  let ordersToday = 0;
  let ordersYesterday = 0;

  orders.forEach((o) => {
    if (!o.createdAt) return;

    const d = new Date(o.createdAt);
    const amount =
      Number(o.totalAmount) || Number(o.total_amount) || Number(o.amount) || 0;

    if (isSameDay(d, today)) {
      todayRevenue += amount;
      ordersToday += 1;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(d, yesterday)) {
      ordersYesterday += 1;
    }

    if (isSameMonth(d, today)) {
      monthRevenue += amount;
    }
  });

  const ordersGrowthPercent =
    ordersYesterday > 0
      ? Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100)
      : 0;

  // Status counts
  const normalizeStatus = (s) => (s || "").toString().toLowerCase();
  const pendingCount = orders.filter((o) =>
    normalizeStatus(o.status).includes("pending")
  ).length;
  const shippedCount = orders.filter((o) =>
    normalizeStatus(o.status).includes("shipped")
  ).length;
  const cancelledCount = orders.filter((o) =>
    normalizeStatus(o.status).includes("cancel")
  ).length;

  const handleViewAllProducts = () => {
    navigate("/seller/products");
  };

  const handleViewAllOrders = () => {
    navigate("/seller/orders");
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Seller Overview
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                {seller?.shop_name || seller?.name || "Seller"}
              </span>
            </h1>
            <p className="mt-2 text-sm md:text-[15px] text-slate-600 max-w-xl">
              Track your orders, revenue, and product performance at a glance.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-700">
                Live sync enabled •{" "}
                <span className="text-slate-900">Last updated just now</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Tip: Keep your catalog updated for better conversions.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Orders Today
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {ordersToday}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <TrendingUp size={12} />
                    {ordersGrowthPercent >= 0 ? "+" : ""}
                    {ordersGrowthPercent}% vs yesterday
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                <ShoppingBag size={18} className="text-indigo-600" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-600">
              <div>
                <p className="text-slate-500">Total</p>
                <p className="font-semibold text-slate-900">{totalOrders}</p>
              </div>
              <div>
                <p className="text-slate-500">Pending</p>
                <p className="font-semibold text-slate-900">{pendingCount}</p>
              </div>
              <div>
                <p className="text-slate-500">Shipped</p>
                <p className="font-semibold text-slate-900">{shippedCount}</p>
              </div>
              <div>
                <p className="text-slate-500 mt-1">Cancelled</p>
                <p className="font-semibold text-rose-600">{cancelledCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-50 rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-900/30 border border-slate-700/70 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-slate-300 mb-1">
                  Revenue Overview
                </p>
                <div className="flex items-center gap-2">
                  <IndianRupee size={18} />
                  <span className="text-2xl font-bold text-white">
                    {totalRevenue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-600">
                <Link to="/seller/revenue">
                  <ArrowUpRight size={18} className="text-emerald-300" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <div>
                <p className="text-slate-400">Today</p>
                <p className="font-semibold text-emerald-300">
                  ₹{todayRevenue.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-slate-400">This Month</p>
                <p className="font-semibold text-slate-50">
                  ₹{monthRevenue.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Avg. Order Value</p>
                <p className="font-semibold text-indigo-200">
                  ₹{avgOrderValue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700/70 flex items-center justify-between text-[11px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400">Total orders</span>
                <span className="font-medium text-slate-100">
                  {totalOrders} orders placed
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/40">
                Store performing well
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Products
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {stats.productsCount}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    live in your store
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-violet-50 flex items-center justify-center border border-violet-100">
                <Package size={18} className="text-violet-600" />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Keep adding more products to increase visibility and reach.
            </p>

            <button
              onClick={handleViewAllProducts}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:text-indigo-900 hover:underline underline-offset-4 transition self-start"
            >
              View all products
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Recent Orders
              </h2>
              <p className="text-[11px] text-slate-500">
                Latest 5 orders from your store.
              </p>
            </div>

            <button
              onClick={handleViewAllOrders}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 hover:underline underline-offset-4 transition"
            >
              View all
              <ChevronRight size={13} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-500">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs md:text-[13px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="py-2.5 pr-4 font-medium">Order ID</th>
                    <th className="py-2.5 pr-4 font-medium">Items</th>
                    <th className="py-2.5 pr-4 font-medium">Amount</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 pr-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/70 transition"
                    >
                      <td className="py-2.5 pr-4 text-slate-800 text-[11px]">
                        #{order.order_id || order._id?.slice(-6)}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-700 text-[11px]">
                        {(order.items || []).length} item(s)
                      </td>
                      <td className="py-2.5 pr-4 text-slate-800 text-[11px]">
                        ₹
                        {(
                          order.totalAmount ||
                          order.total_amount ||
                          order.amount ||
                          0
                        ).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 pr-4 text-[11px]">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-700">
                          {order.status || "Placed"}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-500 text-[11px]">
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

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <AlertTriangle size={13} className="mt-[1px] text-amber-500" />
            <span>
              Pro tip: Quickly act on pending and cancelled orders to improve
              your store health score.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
