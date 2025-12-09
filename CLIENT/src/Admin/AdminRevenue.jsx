import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  IndianRupee,
  Loader2,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Search,
  PieChart,
  CalendarDays,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_BACKEND_API;

const STATUS_OPTIONS = ["all", "paid", "pending", "failed", "refunded"];
const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
];

function AdminRevenue() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState("30d");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${api}/api/payments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data?.data || res.data || [];
        if (!Array.isArray(data)) {
          setPayments([]);
          return;
        }

        setPayments(data);
      } catch (err) {
        console.error("Revenue fetch error:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load revenue data";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPayments();
    } else {
      setLoading(false);
    }
  }, [token]);

  const normalizeStatus = (p) =>
    String(p.status || p.payment_status || "").toLowerCase();

  const getCreatedDate = (p) => {
    if (p.createdAt) return new Date(p.createdAt);
    if (Array.isArray(p.items) && p.items[0]?.createdAt)
      return new Date(p.items[0]?.createdAt);
    return null;
  };

  const getAmount = (p) =>
    Number(p.totalAmount) ||
    Number(p.amount) ||
    Number(p.amount_paid) ||
    0;

  const filteredPayments = useMemo(() => {
    const now = new Date();
    let fromDate = null;

    if (rangeFilter === "7d") {
      fromDate = new Date();
      fromDate.setDate(now.getDate() - 6);
      fromDate.setHours(0, 0, 0, 0);
    } else if (rangeFilter === "30d") {
      fromDate = new Date();
      fromDate.setDate(now.getDate() - 29);
      fromDate.setHours(0, 0, 0, 0);
    } else if (rangeFilter === "month") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      fromDate.setHours(0, 0, 0, 0);
    }

    const s = search.toLowerCase().trim();

    return payments.filter((p) => {
      const status = normalizeStatus(p);

      if (statusFilter !== "all" && !status.includes(statusFilter)) {
        return false;
      }

      const d = getCreatedDate(p);
      if (fromDate && d) {
        if (d < fromDate) return false;
      }

      if (s) {
        const userId = String(p.user_id || "").toLowerCase();
        const phone = String(p.phone || "").toLowerCase();
        const email = String(p.email || "").toLowerCase();
        const payId = String(p.razorpay_payment_id || "").toLowerCase();
        const orderId = String(p.razorpay_order_id || "").toLowerCase();
        const recId = String(p.payment_record_id || p._id || "").toLowerCase();
        if (
          !(
            userId.includes(s) ||
            phone.includes(s) ||
            email.includes(s) ||
            payId.includes(s) ||
            orderId.includes(s) ||
            recId.includes(s)
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [payments, statusFilter, rangeFilter, search]);

  const dateKey = (d) => {
    if (!d) return "Unknown";
    const dd = d.getDate().toString().padStart(2, "0");
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${dd}/${mm}`;
  };

  const chartData = useMemo(() => {
    const map = new Map();

    filteredPayments.forEach((p) => {
      const d = getCreatedDate(p);
      const key = dateKey(d);
      const amt = getAmount(p);
      const status = normalizeStatus(p);

      if (!map.has(key)) {
        map.set(key, {
          date: key,
          revenue: 0,
          paid: 0,
          pending: 0,
          failed: 0,
          refunded: 0,
        });
      }

      const obj = map.get(key);
      obj.revenue += amt;

      if (status.includes("paid") || status.includes("success")) {
        obj.paid += amt;
      } else if (status.includes("pending")) {
        obj.pending += amt;
      } else if (status.includes("fail")) {
        obj.failed += amt;
      } else if (status.includes("refund")) {
        obj.refunded += amt;
      }
    });

    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const [da, ma] = a.date.split("/").map(Number);
      const [db, mb] = b.date.split("/").map(Number);
      if (ma === mb) return da - db;
      return ma - mb;
    });
    return arr;
  }, [filteredPayments]);

  const totalRevenue = useMemo(
    () =>
      filteredPayments.reduce((sum, p) => sum + getAmount(p), 0),
    [filteredPayments]
  );

  const totalPaidRevenue = useMemo(
    () =>
      filteredPayments.reduce((sum, p) => {
        const s = normalizeStatus(p);
        if (s.includes("paid") || s.includes("success")) {
          return sum + getAmount(p);
        }
        return sum;
      }, 0),
    [filteredPayments]
  );

  const totalTransactions = filteredPayments.length;

  const avgOrderValue =
    totalTransactions > 0
      ? Math.round(totalRevenue / totalTransactions)
      : 0;

  const statusCounts = useMemo(() => {
    const counts = {
      paid: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
    };
    filteredPayments.forEach((p) => {
      const s = normalizeStatus(p);
      if (s.includes("paid") || s.includes("success")) counts.paid += 1;
      else if (s.includes("pending")) counts.pending += 1;
      else if (s.includes("fail")) counts.failed += 1;
      else if (s.includes("refund")) counts.refunded += 1;
    });
    return counts;
  }, [filteredPayments]);

  const statusMaxCount = Math.max(
    1,
    statusCounts.paid,
    statusCounts.pending,
    statusCounts.failed,
    statusCounts.refunded
  );

  const chartHeight = 260;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-5 md:py-7">
        <div className="mb-6 md:mb-7 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Revenue Analytics
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Understand how{" "}
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent">
                money flows
              </span>{" "}
              in SwiftCart
            </h1>
            <p className="mt-2 text-sm md:text-[15px] text-slate-600 max-w-xl">
              Filter by date and payment status to see revenue trends and transaction health.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
              <PieChart size={16} className="text-slate-900" />
              <span className="text-[11px] font-medium text-slate-700">
                {filteredPayments.length} payments in current view
              </span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <CalendarDays size={12} />
              Filters apply only to this page. Raw data remains unchanged.
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 md:grid-cols-[minmax(0,_1.6fr)_minmax(0,_1fr)] gap-3 md:gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 min-w-[160px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user, phone, email or ID"
                className="w-full rounded-full border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-[11px] font-medium text-slate-50 self-start">
              <Filter size={13} />
              Filters
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "all"
                      ? "All statuses"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-slate-500">Date range</span>
              <select
                value={rangeFilter}
                onChange={(e) => setRangeFilter(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
              >
                {RANGE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:gap-5 md:grid-cols-3 mb-5">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-50 rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-900/25 border border-slate-700/70 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-slate-300 mb-1">
                  Revenue in view
                </p>
                <div className="flex items-center gap-2">
                  <IndianRupee size={18} />
                  <span className="text-2xl font-bold text-white">
                    {totalRevenue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-600">
                <ArrowUpRight size={18} className="text-emerald-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <p className="text-slate-400">Paid revenue</p>
                <p className="font-semibold text-emerald-300">
                  ₹{totalPaidRevenue.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Transactions</p>
                <p className="font-semibold text-slate-50">
                  {totalTransactions}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/70 flex items-center justify-between text-[11px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400">Average order value</span>
                <span className="font-medium text-slate-100">
                  ₹{avgOrderValue.toLocaleString("en-IN")}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                <TrendingUp size={12} />
                Healthy
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Status distribution
                </p>
                <p className="text-[11px] text-slate-500">
                  Count of payments by status
                </p>
              </div>
            </div>
            <div className="space-y-2 text-[11px]">
              {["paid", "pending", "failed", "refunded"].map((status) => {
                const label =
                  status.charAt(0).toUpperCase() + status.slice(1);
                const count = statusCounts[status];
                const width = `${(count / statusMaxCount) * 100 || 5}%`;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">{label}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-slate-900" style={{ width }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Snapshot
                </p>
                <p className="text-[11px] text-slate-500">
                  Quick indicators for current filters
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600">
              <div>
                <p className="text-slate-500">Paid share</p>
                <p className="font-semibold text-slate-900">
                  {totalTransactions > 0
                    ? `${Math.round(
                        (statusCounts.paid / totalTransactions) * 100
                      )}%`
                    : "0%"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Pending share</p>
                <p className="font-semibold text-slate-900">
                  {totalTransactions > 0
                    ? `${Math.round(
                        (statusCounts.pending / totalTransactions) * 100
                      )}%`
                    : "0%"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Failed count</p>
                <p className="font-semibold text-slate-900">
                  {statusCounts.failed}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Refunded count</p>
                <p className="font-semibold text-slate-900">
                  {statusCounts.refunded}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Revenue over time
              </p>
              <p className="text-[11px] text-slate-500">
                Daily revenue based on the selected date range and filters
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="animate-spin" size={16} />
              Loading chart...
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#020617" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#020617" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    width={60}
                    tickFormatter={(v) => `₹${v / 1000}k`}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E5E7EB",
                      fontSize: 11,
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#020617"
                    fillOpacity={1}
                    fill="url(#revGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No payments in selected range. Try expanding the filters.
            </p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Status revenue breakdown
              </p>
              <p className="text-[11px] text-slate-500">
                How much revenue comes from paid vs pending vs failed
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="animate-spin" size={16} />
              Loading breakdown...
            </div>
          ) : (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={[
                    {
                      name: "Paid",
                      value: totalPaidRevenue,
                    },
                    {
                      name: "Pending",
                      value: filteredPayments
                        .filter((p) => normalizeStatus(p).includes("pending"))
                        .reduce((sum, p) => sum + getAmount(p), 0),
                    },
                    {
                      name: "Failed",
                      value: filteredPayments
                        .filter((p) => normalizeStatus(p).includes("fail"))
                        .reduce((sum, p) => sum + getAmount(p), 0),
                    },
                    {
                      name: "Refunded",
                      value: filteredPayments
                        .filter((p) => normalizeStatus(p).includes("refund"))
                        .reduce((sum, p) => sum + getAmount(p), 0),
                    },
                  ]}
                  margin={{ top: 10, right: 20, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    width={60}
                    tickFormatter={(v) => `₹${v / 1000}k`}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E5E7EB",
                      fontSize: 11,
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminRevenue;
