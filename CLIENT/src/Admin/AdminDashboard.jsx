import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Users, ShoppingBag, Store, IndianRupee, Loader2 } from "lucide-react";

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

        const totalRevenue = Array.isArray(payments)
          ? payments.reduce((sum, p) => {
              const val =
                p.totalAmount ||
                p.amount ||
                p.amount_paid ||
                0;
              return sum + Number(val || 0);
            }, 0)
          : 0;

        const pendingSellers = Array.isArray(sellers)
          ? sellers.filter(
              (s) =>
                String(s.status || "")
                  .toLowerCase()
                  .includes("pending")
            ).length
          : 0;

        const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];
        const recentSellers = Array.isArray(sellers) ? sellers.slice(0, 5) : [];

        setStats({
          totalUsers,
          totalOrders,
          totalRevenue,
          pendingSellers,
          recentOrders,
          recentSellers,
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

  const cards = [
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      sub: "All-time payments",
      icon: <IndianRupee size={20} />,
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      sub: `${stats.recentOrders.length} recent`,
      icon: <ShoppingBag size={20} />,
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      sub: "Registered customers",
      icon: <Users size={20} />,
    },
    {
      label: "Pending Sellers",
      value: stats.pendingSellers,
      sub: "Waiting for approval",
      icon: <Store size={20} />,
    },
  ];
  

  return (
    <div className="w-full bg-slate-50">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-5 md:py-6">
        <div className="mb-5 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">
            Admin Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Overview of users, orders, revenue and seller activity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{card.label}</p>
                <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  {card.icon}
                </div>
              </div>
              <p className="text-xl font-semibold text-slate-900">
                {card.value}
              </p>
              <p className="text-xs text-slate-500">{card.sub}</p>
            </div>
          ))}
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
              <p className="text-sm font-medium text-slate-900">
                Recent Orders
              </p>
              <span className="text-[11px] text-slate-500">
                {stats.recentOrders.length} records
              </span>
            </div>

            {stats.recentOrders.length > 0 ? (
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
                    {stats.recentOrders.map((order) => (
                      <tr
                        key={order._id || order.order_id}
                        className="border-b border-slate-100 last:border-0"
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
                          {(order.totalAmount ||
                            order.amount ||
                            0
                          ).toLocaleString()}
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
                            {order.order_status|| "N/A"}
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
              <p className="text-sm font-medium text-slate-900">
                Recent Sellers
              </p>
              <span className="text-[11px] text-slate-500">
                {stats.recentSellers.length} records
              </span>
            </div>

            {stats.recentSellers.length > 0 ? (
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
                    {stats.recentSellers.map((seller) => (
                      <tr
                        key={seller._id || seller.seller_id}
                        className="border-b border-slate-100 last:border-0"
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
