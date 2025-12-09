import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  Filter,
  Loader2,
  IndianRupee,
  User,
  MapPin,
  CreditCard,
  Package,
  Image as ImageIcon,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import Modal from "../componets/Modal";

const api = import.meta.env.VITE_BACKEND_API;

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${api}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data?.data || res.data || [];
        if (!Array.isArray(data)) {
          setOrders([]);
          setFiltered([]);
          return;
        }

        setOrders(data);
        setFiltered(data);
      } catch (err) {
        console.error("Fetch orders error:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load orders";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  const getOrderIdForApi = (order) => order.order_id || order.id || order._id;

  const formattedDate = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  };

  const getItems = (order) => {
    const items = order.items || [];
    if (!Array.isArray(items)) return [];
    return items.map((item) => ({
      id: item.product_id || item._id || item.name,
      name: item.name || "Product",
      image: item.image || null,
      qty: item.quantity || 1,
      price: item.price || 0,
      subtotal: item.subtotal || item.price || 0,
    }));
  };

  const applyFilters = (value, status = statusFilter) => {
    const v = value.toLowerCase();
    let list = [...orders];

    if (v.trim()) {
      list = list.filter((o) => {
        const id = String(o.order_id || o.id || o._id || "").toLowerCase();
        const userId = String(o.user_id || o.userId || "").toLowerCase();
        const userName = String(o.userName || o.customerName || "").toLowerCase();
        const addr = String(o.shipping_address || "").toLowerCase();
        return (
          id.includes(v) ||
          userId.includes(v) ||
          userName.includes(v) ||
          addr.includes(v)
        );
      });
    }

    if (status !== "all") {
      list = list.filter((o) =>
        String(o.order_status || "")
          .toLowerCase()
          .includes(status.toLowerCase())
      );
    }

    setFiltered(list);
  };

  const handleSearch = (value) => {
    setSearch(value);
    applyFilters(value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    applyFilters(search, value);
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setStatusValue(order.order_status || "pending");
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setStatusValue("");
    setUpdatingStatus(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    const id = getOrderIdForApi(selectedOrder);
    if (!id) {
      toast.error("Order ID not found");
      return;
    }

    try {
      setUpdatingStatus(true);

      const payload = { order_status: statusValue };

      const res = await axios.put(
        `${api}/api/orders/${id}/status`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = res.data?.data || res.data || {
        ...selectedOrder,
        order_status: statusValue,
      };

      setOrders((prev) =>
        prev.map((o) =>
          String(getOrderIdForApi(o)) === String(id) ? { ...o, ...updated } : o
        )
      );
      setFiltered((prev) =>
        prev.map((o) =>
          String(getOrderIdForApi(o)) === String(id) ? { ...o, ...updated } : o
        )
      );
      setSelectedOrder((prev) => (prev ? { ...prev, ...updated } : prev));

      toast.success("Order status updated");
    } catch (err) {
      console.error("Update order status error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update status";
      toast.error(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusBadgeClass = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("delivered"))
      return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    if (s.includes("processing"))
      return "bg-sky-50 text-sky-600 border border-sky-100";
    if (s.includes("shipped"))
      return "bg-indigo-50 text-indigo-600 border border-indigo-100";
    if (s.includes("pending"))
      return "bg-amber-50 text-amber-600 border border-amber-100";
    if (s.includes("cancel"))
      return "bg-red-50 text-red-600 border border-red-100";
    return "bg-slate-50 text-slate-600 border border-slate-100";
  };

  const totalRevenue = useMemo(
    () =>
      orders.reduce((sum, o) => {
        const val = o.totalAmount || 0;
        return sum + Number(val || 0);
      }, 0),
    [orders]
  );

  return (
    <div className="w-full bg-slate-50">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-5 md:py-6">
        <div className="mb-4 md:mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              Orders
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              View all orders and change their status.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="w-full sm:w-64">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by order, user or address"
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

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-[minmax(0,_1.2fr)_minmax(0,_1fr)] gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              Status
            </span>
            <div className="relative max-w-xs">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full appearance-none rounded-full border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
              >
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
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
            Total revenue: ₹{totalRevenue.toLocaleString()} • Showing{" "}
            {filtered.length} of {orders.length} orders
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-900">
              Order list
            </p>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="animate-spin" size={16} />
              Loading orders...
            </div>
          ) : filtered.length > 0 ? (
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
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Payment
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
                  {filtered.map((o) => (
                    <tr
                      key={o._id || o.order_id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="py-2 pr-3 text-slate-800">
                        #{o.order_id || String(o._id).slice(-6)}
                      </td>
                      <td className="py-2 pr-3 text-slate-800">
                        {o.userName ||
                          o.customerName ||
                          (o.user_id ? `User #${o.user_id}` : "-")}
                      </td>
                      <td className="py-2 pr-3 text-slate-800">
                        ₹{(o.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={
                            "inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-medium " +
                            statusBadgeClass(o.order_status)
                          }
                        >
                          {o.order_status || "N/A"}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {o.payment_status || "N/A"}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {formattedDate(o.createdAt)}
                      </td>
                      <td className="py-2 pl-3 text-right">
                        <button
                          onClick={() => openOrderModal(o)}
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
            <p className="text-xs text-slate-500">No orders found.</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeOrderModal}
        title={
          selectedOrder
            ? `Order #${
                selectedOrder.order_id ||
                (selectedOrder._id
                  ? String(selectedOrder._id).slice(-6)
                  : "")
              }`
            : "Order details"
        }
        subtitle={
          selectedOrder
            ? formattedDate(selectedOrder.createdAt || selectedOrder.updatedAt)
            : ""
        }
        maxWidth="max-w-3xl"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1.2fr)] gap-4">
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span>
                    {selectedOrder.userName ||
                      selectedOrder.customerName ||
                      (selectedOrder.user_id
                        ? `User #${selectedOrder.user_id}`
                        : "-")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <IndianRupee size={14} className="text-slate-400" />
                  <span>
                    Total:{" "}
                    <span className="font-medium text-slate-900">
                      ₹{(selectedOrder.totalAmount || 0).toLocaleString()}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-slate-400" />
                  <span>
                    Payment:{" "}
                    <span className="font-medium text-slate-900">
                      {selectedOrder.payment_status || "N/A"}
                    </span>
                    {selectedOrder.razorpay_payment_id
                      ? " • " + selectedOrder.razorpay_payment_id
                      : ""}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-slate-400 mt-[2px]" />
                  <span className="block">
                    {selectedOrder.shipping_address || "No address available"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-slate-400" />
                  <span>{formattedDate(selectedOrder.createdAt)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-900">
                      Status
                    </span>
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-medium " +
                        statusBadgeClass(selectedOrder.order_status)
                      }
                    >
                      {selectedOrder.order_status || "N/A"}
                    </span>
                  </div>

                  <div className="grid grid-cols-[minmax(0,_1.3fr)_minmax(0,_auto)] gap-2 items-center">
                    <div className="relative">
                      <select
                        value={statusValue}
                        onChange={(e) => setStatusValue(e.target.value)}
                        className="w-full appearance-none rounded-full border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDown size={14} className="text-slate-400" />
                      </div>
                    </div>

                    <button
                      onClick={handleUpdateStatus}
                      disabled={updatingStatus}
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {updatingStatus ? (
                        <Loader2 size={12} className="animate-spin mr-1" />
                      ) : null}
                      Update
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    GST: ₹{(selectedOrder.gst_amount || 0).toLocaleString()} •
                    Platform fee: ₹
                    {(selectedOrder.platform_fee || 0).toLocaleString()}
                  </div>

                  {selectedOrder.razorpay_order_id && (
                    <div className="text-[11px] text-slate-500 break-all">
                      Razorpay Order: {selectedOrder.razorpay_order_id}
                      <br />
                      Payment ID: {selectedOrder.razorpay_payment_id}
                      <br />
                      Signature: {selectedOrder.razorpay_signature}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-slate-900">
                    Items
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {getItems(selectedOrder).length} products
                  </span>
                </div>

                {getItems(selectedOrder).length > 0 ? (
                  <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
                    {getItems(selectedOrder).map((item) => (
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
                            <ImageIcon size={16} className="text-slate-400" />
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
                            {Number(item.subtotal || item.price || 0).toLocaleString()}
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

export default AdminOrders;
