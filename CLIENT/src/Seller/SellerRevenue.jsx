import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  IndianRupee,
  ArrowUpRight,
  CalendarRange,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const api = import.meta.env.VITE_BACKEND_API;

function SellerRevenue() {
  const { seller, sellerToken } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

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

        const data = res.data?.data || [];
        setOrders(data);
      } catch (err) {
        console.error("Error loading revenue data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [seller?.seller_id, sellerToken]);

  const normalizeStatus = (s) => (s || "").toString().toLowerCase();

  const filteredOrders = useMemo(() => {
    if (!orders.length) return [];

    const now = new Date();
    return orders.filter((o) => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);

      if (range === "today") {
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      }

      if (range === "7d") {
        const diff = (now - d) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }

      if (range === "30d") {
        const diff = (now - d) / (1000 * 60 * 60 * 24);
        return diff <= 30;
      }

      if (range === "month") {
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      }

      return true;
    });
  }, [orders, range]);

  const {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    refundAmount,
    statusBreakdown,
    chartData,
  } = useMemo(() => {
    if (!filteredOrders.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        refundAmount: 0,
        statusBreakdown: [],
        chartData: [],
      };
    }

    let totalRevenue = 0;
    let refundAmount = 0;

    const statusMap = {};
    const dateMap = {};

    filteredOrders.forEach((o) => {
      const amount =
        Number(o.totalAmount) ||
        Number(o.total_amount) ||
        Number(o.amount) ||
        0;

      totalRevenue += amount;

      const st = normalizeStatus(o.status);
      if (!statusMap[st]) {
        statusMap[st] = { status: st || "unknown", count: 0, amount: 0 };
      }
      statusMap[st].count += 1;
      statusMap[st].amount += amount;

      if (st.includes("cancel") || st.includes("refund")) {
        refundAmount += amount;
      }

      if (o.createdAt) {
        const d = new Date(o.createdAt);
        const key = d.toISOString().slice(0, 10);
        if (!dateMap[key]) {
          dateMap[key] = { date: key, revenue: 0 };
        }
        dateMap[key].revenue += amount;
      }
    });

    const totalOrders = filteredOrders.length;
    const avgOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const statusBreakdown = Object.values(statusMap).sort(
      (a, b) => b.amount - a.amount
    );

    const chartData = Object.values(dateMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
      }));

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      refundAmount,
      statusBreakdown,
      chartData,
    };
  }, [filteredOrders]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-600">Loading revenue analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Revenue Analytics
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Revenue{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            <p className="mt-2 text-sm md:text-[15px] text-slate-600 max-w-xl">
              Analyse your earnings, order value, and refunds for different time
              ranges.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
              <CalendarRange size={14} className="text-indigo-600" />
              <span className="text-xs font-medium text-slate-700">
                Viewing:{" "}
                <span className="text-slate-900">
                  {range === "today"
                    ? "Today"
                    : range === "7d"
                    ? "Last 7 days"
                    : range === "30d"
                    ? "Last 30 days"
                    : "This month"}
                </span>
              </span>
            </div>
            <button
              onClick={() => navigate("/seller/dashboard")}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:underline underline-offset-4"
            >
              ← Back to dashboard
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2 md:gap-3">
          {[
            { id: "today", label: "Today" },
            { id: "7d", label: "Last 7 days" },
            { id: "30d", label: "Last 30 days" },
            { id: "month", label: "This month" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                range === r.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-4 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-50 rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-900/30 border border-slate-700/70">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-slate-300 mb-1">
                  Total Revenue
                </p>
                <div className="flex items-center gap-2">
                  <IndianRupee size={18} />
                  <span className="text-2xl font-bold text-white">
                    {totalRevenue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <div className="h-9 w-9 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-600">
                <ArrowUpRight size={18} className="text-emerald-300" />
              </div>
            </div>
            <p className="text-[11px] text-slate-300">
              Total earnings from completed & processed orders for this range.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500 mb-1">
              Total Orders
            </p>
            <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Number of orders placed in the selected period.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500 mb-1">
              Avg. Order Value
            </p>
            <p className="text-2xl font-bold text-slate-900">
              ₹{avgOrderValue.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Average revenue you earn per order.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500 mb-1">
              Refund / Cancelled Amount
            </p>
            <p className="text-2xl font-bold text-rose-600">
              ₹{refundAmount.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Orders marked as cancelled / refunded in this period.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.7fr,1.1fr] mb-6 md:mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Revenue Over Time
                </h2>
                <p className="text-[11px] text-slate-500">
                  Daily revenue trend for the selected range.
                </p>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="h-52 flex items-center justify-center">
                <p className="text-xs text-slate-500">
                  Not enough data to show chart in this range.
                </p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(v) =>
                        v >= 1000 ? `${Math.round(v / 1000)}k` : v.toString()
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 10,
                        borderColor: "#e2e8f0",
                      }}
                      formatter={(value) => [
                        `₹${Number(value).toLocaleString("en-IN")}`,
                        "Revenue",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4f46e5"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4f46e5"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Breakdown by Status
              </h2>
            </div>

            {statusBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500">
                No orders in this range to show breakdown.
              </p>
            ) : (
              <div className="space-y-3 text-xs md:text-[13px]">
                {statusBreakdown.map((row) => (
                  <div
                    key={row.status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 capitalize">
                        {row.status || "Unknown"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {row.count} order(s)
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      ₹{row.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-start gap-2 text-[11px] text-slate-500">
            <AlertTriangle size={13} className="mt-[2px] text-amber-500" />
            <span>
              Revenue values are calculated based on order amounts in your
              system. For exact payout details (after platform fee / GST),
              connect this page to your settlement API in the future.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerRevenue;
