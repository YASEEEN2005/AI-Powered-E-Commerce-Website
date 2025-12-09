import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  Filter,
  Loader2,
  IndianRupee,
  CreditCard,
  CalendarDays,
  User,
  MapPin,
  Image as ImageIcon,
  ChevronDown,
  PieChart,
  Store,
} from "lucide-react";
import Modal from "../componets/Modal";

const api = import.meta.env.VITE_BACKEND_API;

const PAYMENT_STATUS_OPTIONS = ["paid", "pending", "failed", "refunded"];

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sellerStatusFilter, setSellerStatusFilter] = useState("all");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoadingPayments(true);

        const res = await axios.get(`${api}/api/payments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data?.data || res.data || [];
        if (!Array.isArray(data)) {
          setPayments([]);
          setFilteredPayments([]);
          return;
        }

        setPayments(data);
        setFilteredPayments(data);
      } catch (err) {
        console.error("Fetch payments error:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load payments";
        toast.error(msg);
      } finally {
        setLoadingPayments(false);
      }
    };

    const fetchSellers = async () => {
      try {
        setLoadingSellers(true);

        const res = await axios.get(`${api}/api/admin/sellers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data?.data || res.data || [];
        if (!Array.isArray(data)) {
          setSellers([]);
          setFilteredSellers([]);
          return;
        }

        setSellers(data);
        setFilteredSellers(data);
      } catch (err) {
        console.error("Fetch sellers for payout error:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load seller payouts";
        toast.error(msg);
      } finally {
        setLoadingSellers(false);
      }
    };

    if (token) {
      fetchPayments();
      fetchSellers();
    }
  }, [token]);

  const getPaymentId = (p) =>
    p.payment_record_id || p.id || p._id;

  const formattedDate = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  };

  const getPaymentItems = (p) => {
    const items = p.items || [];
    if (!Array.isArray(items)) return [];
    return items.map((item) => ({
      id: item.product_id || item._id || item.name,
      name: item.name || "Product",
      price: item.price || 0,
      qty: item.quantity || 1,
      subtotal: item.subtotal || item.price || 0,
      image: item.image || null,
    }));
  };

  const applyPaymentFilters = (value, status = statusFilter) => {
    const v = value.toLowerCase();
    let list = [...payments];

    if (v.trim()) {
      list = list.filter((p) => {
        const userId = String(p.user_id || "").toLowerCase();
        const phone = String(p.phone || "").toLowerCase();
        const email = String(p.email || "").toLowerCase();
        const payId = String(p.razorpay_payment_id || "").toLowerCase();
        const orderId = String(p.razorpay_order_id || "").toLowerCase();
        const status = String(p.status || "").toLowerCase();
        const id = String(getPaymentId(p) || "").toLowerCase();
        return (
          userId.includes(v) ||
          phone.includes(v) ||
          email.includes(v) ||
          payId.includes(v) ||
          orderId.includes(v) ||
          status.includes(v) ||
          id.includes(v)
        );
      });
    }

    if (status !== "all") {
      list = list.filter((p) =>
        String(p.status || "")
          .toLowerCase()
          .includes(status.toLowerCase())
      );
    }

    setFilteredPayments(list);
  };

  const handleSearch = (value) => {
    setSearch(value);
    applyPaymentFilters(value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    applyPaymentFilters(search, value);
  };

  const applySellerFilters = (value) => {
    const v = value.toLowerCase();
    let list = [...sellers];

    if (v.trim()) {
      list = list.filter((s) => {
        const name = String(s.name || "").toLowerCase();
        const shop = String(s.shop_name || s.shopName || "").toLowerCase();
        const phone = String(s.phone || "").toLowerCase();
        const email = String(s.email || "").toLowerCase();
        const id = String(s.seller_id || s.id || s._id || "").toLowerCase();
        return (
          name.includes(v) ||
          shop.includes(v) ||
          phone.includes(v) ||
          email.includes(v) ||
          id.includes(v)
        );
      });
    }

    if (sellerStatusFilter !== "all") {
      list = list.filter((s) =>
        String(s.status || "")
          .toLowerCase()
          .includes(sellerStatusFilter.toLowerCase())
      );
    }

    setFilteredSellers(list);
  };

  const handleSellerStatusFilterChange = (value) => {
    setSellerStatusFilter(value);
    applySellerFilters(search);
  };

  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const closePaymentModal = () => {
    setSelectedPayment(null);
    setIsModalOpen(false);
  };

  const totalReceived = useMemo(
    () =>
      payments.reduce((sum, p) => {
        if (String(p.status || "").toLowerCase() === "paid") {
          return sum + Number(p.amount || 0);
        }
        return sum;
      }, 0),
    [payments]
  );

  const totalTransactions = payments.length;

  const totalUniqueUsers = useMemo(() => {
    const set = new Set();
    payments.forEach((p) => {
      if (p.user_id != null) {
        set.add(String(p.user_id));
      }
    });
    return set.size;
  }, [payments]);

  const totalPendingSellerPayout = useMemo(
    () =>
      sellers.reduce(
        (sum, s) => sum + Number(s.pending_payment || 0),
        0
      ),
    [sellers]
  );

  const totalSellerPayoutCompleted = useMemo(
    () =>
      sellers.reduce(
        (sum, s) => sum + Number(s.payout || 0),
        0
      ),
    [sellers]
  );

  const paymentStatusCounts = useMemo(() => {
    const map = {
      paid: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
    };
    payments.forEach((p) => {
      const s = String(p.status || "").toLowerCase();
      if (map[s] != null) {
        map[s] += 1;
      }
    });
    return map;
  }, [payments]);

  const maxStatusCount = useMemo(
    () =>
      Math.max(
        1,
        paymentStatusCounts.paid,
        paymentStatusCounts.pending,
        paymentStatusCounts.failed,
        paymentStatusCounts.refunded
      ),
    [paymentStatusCounts]
  );

  return (
    <div className="w-full bg-slate-50">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-5 md:py-6">
        <div className="mb-4 md:mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              Payments & Payouts
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Track customer payments and seller payouts with real-time status.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="w-full sm:w-64">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    handleSearch(e.target.value);
                    applySellerFilters(e.target.value);
                  }}
                  placeholder="Search by user, phone, email or ID"
                  className="w-full rounded-full border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-[11px] font-medium text-slate-50">
              <Filter size={13} />
              Filters
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Total received</p>
              <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <IndianRupee size={18} />
              </div>
            </div>
            <p className="text-xl font-semibold text-slate-900">
              ₹{totalReceived.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">All paid transactions</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Transactions</p>
              <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <CreditCard size={18} />
              </div>
            </div>
            <p className="text-xl font-semibold text-slate-900">
              {totalTransactions}
            </p>
            <p className="text-xs text-slate-500">Total payment records</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Unique customers</p>
              <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <User size={18} />
              </div>
            </div>
            <p className="text-xl font-semibold text-slate-900">
              {totalUniqueUsers}
            </p>
            <p className="text-xs text-slate-500">Based on user_id</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Pending seller payout</p>
              <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Store size={18} />
              </div>
            </div>
            <p className="text-xl font-semibold text-slate-900">
              ₹{totalPendingSellerPayout.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">
              Across all approved sellers
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <PieChart size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Payment status overview
                </p>
                <p className="text-[11px] text-slate-500">
                  Distribution of transactions by status
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Paid: {paymentStatusCounts.paid} • Pending:{" "}
              {paymentStatusCounts.pending} • Failed:{" "}
              {paymentStatusCounts.failed} • Refunded:{" "}
              {paymentStatusCounts.refunded}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
            {["paid", "pending", "failed", "refunded"].map((status) => {
              const count = paymentStatusCounts[status];
              const width = `${(count / maxStatusCount) * 100 || 5}%`;
              const label =
                status.charAt(0).toUpperCase() + status.slice(1);
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

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)] gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              Payment status
            </span>
            <div className="relative max-w-xs">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full appearance-none rounded-full border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
              >
                <option value="all">All statuses</option>
                {PAYMENT_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex items-end justify-end text-[11px] text-slate-500">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-900">
              Payments
            </p>
          </div>

          {loadingPayments ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="animate-spin" size={16} />
              Loading payments...
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Payment
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      User
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Amount
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Status
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Method
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Date
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr
                      key={getPaymentId(p)}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="py-2 pr-3 text-slate-800">
                        #{getPaymentId(p) || "-"}
                      </td>
                      <td className="py-2 pr-3 text-slate-800">
                        {p.name || p.user_id || "-"}
                        {p.phone ? (
                          <span className="text-[10px] text-slate-500 block">
                            {p.phone}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3 text-slate-800">
                        ₹{(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-medium ${
                            String(p.status || "")
                              .toLowerCase()
                              .includes("paid")
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : String(p.status || "")
                                  .toLowerCase()
                                  .includes("pending")
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : String(p.status || "")
                                  .toLowerCase()
                                  .includes("fail")
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : "bg-slate-50 text-slate-600 border border-slate-100"
                          }`}
                        >
                          {p.status || "N/A"}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {p.currency || "INR"}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {formattedDate(p.createdAt || p.items?.[0]?.createdAt)}
                      </td>
                      <td className="py-2 pl-3 text-right">
                        <button
                          onClick={() => openPaymentModal(p)}
                          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No payments found.
            </p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Store size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Seller payouts
                </p>
                <p className="text-[11px] text-slate-500">
                  Monitor seller bank details, pending payouts and released amounts.
                </p>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 text-right">
              Total pending: ₹{totalPendingSellerPayout.toLocaleString()}
              <br />
              Payout completed: ₹{totalSellerPayoutCompleted.toLocaleString()}
            </div>
          </div>

          <div className="mb-3 grid grid-cols-1 sm:grid-cols-[minmax(0,_1.3fr)_minmax(0,_1fr)] gap-3 text-[11px]">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-slate-500">Seller status</span>
              <div className="relative max-w-xs">
                <select
                  value={sellerStatusFilter}
                  onChange={(e) => handleSellerStatusFilterChange(e.target.value)}
                  className="w-full appearance-none rounded-full border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
                >
                  <option value="all">All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>
            </div>

            <div className="flex items-end justify-end text-[11px] text-slate-500">
              Showing {filteredSellers.length} of {sellers.length} sellers
            </div>
          </div>

          {loadingSellers ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="animate-spin" size={16} />
              Loading seller payouts...
            </div>
          ) : filteredSellers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px] md:text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Seller
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Shop
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Pending
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Payout
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Bank
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSellers.map((s) => (
                    <tr
                      key={s._id || s.seller_id || s.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="py-2 pr-3 text-slate-800">
                        {s.name || "-"}
                        <span className="block text-[10px] text-slate-500">
                          #{s.seller_id || s.id || String(s._id).slice(-6)}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-slate-800">
                        {s.shop_name || s.shopName || "N/A"}
                      </td>
                      <td className="py-2 pr-3 text-slate-800">
                        ₹{(s.pending_payment || 0).toLocaleString()}
                      </td>
                      <td className="py-2 pr-3 text-slate-800">
                        ₹{(s.payout || 0).toLocaleString()}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {s.bank_name || "N/A"}
                        <span className="block text-[10px] text-slate-500">
                          {s.account_number || ""}{" "}
                          {s.ifsc_code ? "• " + s.ifsc_code : ""}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-medium ${
                            String(s.status || "")
                              .toLowerCase()
                              .includes("approved")
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : String(s.status || "")
                                  .toLowerCase()
                                  .includes("pending")
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : String(s.status || "")
                                  .toLowerCase()
                                  .includes("reject")
                              ? "bg-red-50 text-red-600 border border-red-100"
                              : "bg-slate-50 text-slate-600 border border-slate-100"
                          }`}
                        >
                          {s.status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No seller payout data found.
            </p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closePaymentModal}
        title={
          selectedPayment
            ? `Payment #${getPaymentId(selectedPayment) || "-"}`
            : "Payment details"
        }
        subtitle={
          selectedPayment
            ? formattedDate(
                selectedPayment.createdAt ||
                  selectedPayment.items?.[0]?.createdAt
              )
            : ""
        }
        maxWidth="max-w-3xl"
      >
        {selectedPayment && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1.2fr)] gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span>
                    {selectedPayment.name ||
                      (selectedPayment.user_id
                        ? `User #${selectedPayment.user_id}`
                        : "-")}
                    {selectedPayment.phone
                      ? " • " + selectedPayment.phone
                      : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-slate-400" />
                  <span>
                    Status:{" "}
                    <span className="font-medium text-slate-900">
                      {selectedPayment.status || "N/A"}
                    </span>{" "}
                    {selectedPayment.currency
                      ? "• " + selectedPayment.currency
                      : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <IndianRupee size={14} className="text-slate-400" />
                  <span>
                    Amount:{" "}
                    <span className="font-medium text-slate-900">
                      ₹{(selectedPayment.amount || 0).toLocaleString()}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-slate-400" />
                  <span>
                    {formattedDate(
                      selectedPayment.createdAt ||
                        selectedPayment.items?.[0]?.createdAt
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <p className="text-xs font-medium text-slate-900">
                    Razorpay details
                  </p>
                  <p className="text-[11px] text-slate-600 break-all">
                    Order ID:{" "}
                    {selectedPayment.razorpay_order_id || "N/A"}
                    <br />
                    Payment ID:{" "}
                    {selectedPayment.razorpay_payment_id || "N/A"}
                    <br />
                    Signature:{" "}
                    {selectedPayment.razorpay_signature || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-slate-900">
                    Items
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {getPaymentItems(selectedPayment).length} products
                  </span>
                </div>

                {getPaymentItems(selectedPayment).length > 0 ? (
                  <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
                    {getPaymentItems(selectedPayment).map((item) => (
                      <div
                        key={item.id}
                        className="border border-slate-200 rounded-xl p-2 bg-slate-50/60 flex gap-2"
                      >
                        <div className="h-10 w-10 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon
                              size={16}
                              className="text-slate-400"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-slate-900 line-clamp-2">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-[2px]">
                            Qty: {item.qty} • Price: ₹
                            {Number(item.price || 0).toLocaleString()}
                            <br />
                            Subtotal: ₹
                            {Number(item.subtotal || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    No item details available.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminPayments;
