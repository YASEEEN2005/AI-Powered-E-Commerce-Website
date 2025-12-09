import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  ShoppingBag,
  Store,
  IndianRupee,
  Loader2,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_BACKEND_API;

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingSellers: 0,
    recentOrders: [],
    recentSellers: [],
    todayRevenue: 0,
    monthRevenue: 0,
    avgOrderValue: 0,
    successPayments: 0,
  });

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [usersRes, ordersRes, paymentsRes, sellersRes] = await Promise.all([
          axios.get(`${api}/api/users`, { headers }),
          axios.get(`${api}/api/orders`, { headers }),
          axios.get(`${api}/api/payments`, { headers }),
          axios.get(`${api}/api/admin/sellers`, { headers }),
        ]);

        const users = usersRes.data?.data || usersRes.data || [];
        const orders = ordersRes.data?.data || ordersRes.data || [];
        const payments = paymentsRes.data?.data || paymentsRes.data || [];
        const sellers = sellersRes.data?.data || sellersRes.data || [];

        const totalUsers = Array.isArray(users) ? users.length : 0;
        const totalOrders = Array.isArray(orders) ? orders.length : 0;

        let totalRevenue = 0;
        let todayRevenue = 0;
        let monthRevenue = 0;
        let successPayments = 0;

        const today = new Date();
        const isSameDay = (d1, d2) =>
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();

        const isSameMonth = (d1, d2) =>
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth();

        if (Array.isArray(payments)) {
          payments.forEach((p) => {
            const amount =
              Number(p.totalAmount) ||
              Number(p.amount) ||
              Number(p.amount_paid) ||
              0;

            totalRevenue += amount;

            const status = String(p.status || p.payment_status || "")
              .toLowerCase();
            if (status.includes("paid") || status.includes("success")) {
              successPayments += 1;
            }

            if (p.createdAt) {
              const d = new Date(p.createdAt);
              if (isSameDay(d, today)) {
                todayRevenue += amount;
              }
              if (isSameMonth(d, today)) {
                monthRevenue += amount;
              }
            }
          });
        }

        const pendingSellers = Array.isArray(sellers)
          ? sellers.filter((s) =>
              String(s.status || "").toLowerCase().includes("pending")
            ).length
          : 0;

        const avgOrderValue =
          totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];
        const recentSellers = Array.isArray(sellers) ? sellers.slice(0, 5) : [];

        setStats({
          totalUsers,
          totalOrders,
          totalRevenue,
          pendingSellers,
          recentOrders,
          recentSellers,
          todayRevenue,
          monthRevenue,
          avgOrderValue,
          successPayments,
        });
      } catch (err) {
        console.error("Admin dashboard error:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load dashboard";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const {
    totalUsers,
    totalOrders,
    totalRevenue,
    pendingSellers,
    recentOrders,
    recentSellers,
    todayRevenue,
    monthRevenue,
    avgOrderValue,
    successPayments,
  } = stats;

  const ordersPerUser =
    totalUsers > 0 ? (totalOrders / totalUsers).toFixed(2) : "0.00";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-5 md:py-7">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Admin Overview
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Control center for{" "}
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent">
                SwiftCart
              </span>
            </h1>
            <p className="mt-2 text-sm md:text-[15px] text-slate-600 max-w-xl">
              Monitor users, orders, revenue and seller activity in one place.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-slate-700">
                Live overview • <span className="text-slate-900">Synced from API</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Tip: Check pending sellers regularly to keep onboarding fast.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-3 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-50 rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-900/25 border border-slate-700/70 flex flex-col justify-between">
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
                <Link to="/admin/revenue">
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
                <span className="text-slate-400">Successful payments</span>
                <span className="font-medium text-slate-100">
                  {successPayments} completed
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/40">
                Platform healthy
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Orders
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {totalOrders}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <TrendingUp size={12} />
                    Avg ₹{avgOrderValue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                <ShoppingBag size={18} className="text-indigo-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600">
              <div>
                <p className="text-slate-500">Orders / user</p>
                <p className="font-semibold text-slate-900">
                  {ordersPerUser}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Recent tracked</p>
                <p className="font-semibold text-slate-900">
                  {recentOrders.length} records
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Users & Sellers
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {totalUsers}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    registered users
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Users size={17} />
                </div>
                <div className="h-9 w-9 rounded-2xl bg-violet-50 flex items-center justify-center border border-violet-100">
                  <Store size={17} className="text-violet-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600">
              <div>
                <p className="text-slate-500">Pending sellers</p>
                <p className="font-semibold text-amber-600">
                  {pendingSellers}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Recent sellers</p>
                <p className="font-semibold text-slate-900">
                  {recentSellers.length} records
                </p>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500">
              Balance both user growth and seller approvals to keep the
              marketplace healthy.
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Loader2 className="animate-spin" size={16} />
            Loading latest data...
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Recent Orders
                </p>
                <p className="text-[11px] text-slate-500">
                  Latest 5 orders across the platform.
                </p>
              </div>
              <span className="text-[11px] text-slate-500">
                {recentOrders.length} records
              </span>
            </div>

            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 pr-3 text-slate-500 font-medium">
                        Order
                      </th>
                      <th className="py-2 pr-3 text-slate-500 font-medium">
                        Customer
                      </th>
                      <th className="py-2 pr-3 text-slate-500 font-medium">
                        Amount
                      </th>
                      <th className="py-2 pr-3 text-slate-500 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order._id || order.order_id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                      >
                        <td className="py-2 pr-3 text-slate-800">
                          #{order.order_id || String(order._id || "").slice(-6)}
                        </td>
                        <td className="py-2 pr-3 text-slate-700">
                          {order.userName ||
                            order.customerName ||
                            order.user_id ||
                            "-"}
                        </td>
                        <td className="py-2 pr-3 text-slate-800">
                          ₹
                          {(
                            order.totalAmount ||
                            order.amount ||
                            0
                          ).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-medium ${
                              String(order.order_status || "")
                                .toLowerCase()
                                .includes("delivered")
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : String(order.order_status || "")
                                    .toLowerCase()
                                    .includes("pending")
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-slate-50 text-slate-600 border border-slate-100"
                            }`}
                          >
                            {order.order_status || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !loading && (
                <p className="text-xs text-slate-500">
                  No recent orders found.
                </p>
              )
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Recent Sellers
                </p>
                <p className="text-[11px] text-slate-500">
                  Latest seller accounts in the platform.
                </p>
              </div>
              <span className="text-[11px] text-slate-500">
                {recentSellers.length} records
              </span>
            </div>

            {recentSellers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 pr-3 text-slate-500 font-medium">
                        Seller
                      </th>
                      <th className="py-2 pr-3 text-slate-500 font-medium">
                        Shop
                      </th>
                      <th className="py-2 pr-3 text-slate-500 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSellers.map((seller) => (
                      <tr
                        key={seller._id || seller.seller_id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                      >
                        <td className="py-2 pr-3 text-slate-800">
                          {seller.name || "-"}
                        </td>
                        <td className="py-2 pr-3 text-slate-700">
                          {seller.shopName ||
                            seller.storeName ||
                            seller.shop_name ||
                            "-"}
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-medium ${
                              String(seller.status || "")
                                .toLowerCase()
                                .includes("approved")
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : String(seller.status || "")
                                    .toLowerCase()
                                    .includes("pending")
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-slate-50 text-slate-600 border border-slate-100"
                            }`}
                          >
                            {seller.status || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !loading && (
                <p className="text-xs text-slate-500">
                  No recent sellers found.
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
