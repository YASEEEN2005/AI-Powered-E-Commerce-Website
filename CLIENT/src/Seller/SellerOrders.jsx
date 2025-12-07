import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Loader2, Filter, Search, Eye, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_BACKEND_API;

// order_status enum from your model:
const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
];

function SellerOrders() {
  const { seller, sellerToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!seller?.seller_id || !sellerToken) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${api}/api/seller/${seller.seller_id}/orders`,
          {
            headers: { Authorization: `Bearer ${sellerToken}` },
          }
        );
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error("Error loading seller orders:", err);
        toast.error("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [seller?.seller_id, sellerToken]);


  const normalizeStatus = (oOrStatus) => {
    if (typeof oOrStatus === "string") {
      return oOrStatus.toLowerCase();
    }
    return (oOrStatus.order_status || oOrStatus.status || "placed").toLowerCase();
  };

  const totalAmount = (o) =>
    Number(o.totalAmount || o.total_amount || o.amount || 0);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const idText = (o.order_id && String(o.order_id)) || o._id || "";
      const matchesSearch =
        !search || idText.toLowerCase().includes(search.toLowerCase());

      const currentStatus = normalizeStatus(o);
      const matchesStatus =
        statusFilter === "all" || currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const getStatusBadge = (statusRaw) => {
    const status = normalizeStatus(statusRaw);

    let base =
      "inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide border ";
    if (status === "delivered") {
      return (
        <span
          className={
            base + "bg-emerald-50 text-emerald-700 border-emerald-100"
          }
        >
          {status}
        </span>
      );
    }
    if (status === "shipped" || status === "confirmed") {
      return (
        <span className={base + "bg-blue-50 text-blue-700 border-blue-100"}>
          {status}
        </span>
      );
    }
    if (status === "cancelled" || status === "refunded") {
      return (
        <span className={base + "bg-rose-50 text-rose-700 border-rose-100"}>
          {status}
        </span>
      );
    }
    if (status === "returned") {
      return (
        <span className={base + "bg-amber-50 text-amber-700 border-amber-100"}>
          {status}
        </span>
      );
    }
    return (
      <span
        className={base + "bg-slate-100 text-slate-700 border-slate-200"}
      >
        {status || "placed"}
      </span>
    );
  };

  const extractAddress = (orderOrValue) => {
    if (!orderOrValue) return null;

    if (typeof orderOrValue === "string") {
      return { full: orderOrValue };
    }

    const raw =
      orderOrValue.shipping_address ||
      orderOrValue.shippingAddress ||
      orderOrValue.delivery_address ||
      orderOrValue.deliveryAddress ||
      orderOrValue.address ||
      orderOrValue.address_details ||
      null;

    if (!raw) return null;

    if (typeof raw === "string") {
      return { full: raw };
    }

    return {
      name: raw.name || raw.fullName || raw.contact_name || "",
      street: raw.street || raw.addressLine1 || raw.line1 || raw.address || "",
      city: raw.city || "",
      state: raw.state || raw.region || "",
      pincode: raw.pincode || raw.postalCode || raw.zip || "",
      phone: raw.phone || raw.mobile || raw.contactNumber || "",
    };
  };


  const handleStatusChange = async (order, newStatus) => {
    const currentStatus = normalizeStatus(order);
    if (newStatus === currentStatus) return;

    if (!order.order_id) {
      toast.error("Order ID missing, cannot update.");
      return;
    }

    const confirmChange = window.confirm(
      `Change status of order #${order.order_id} from "${currentStatus}" to "${newStatus}"?`
    );
    if (!confirmChange) return;

    const prevOrders = [...orders];

    try {
      setUpdatingId(order._id || order.order_id);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id ? { ...o, order_status: newStatus } : o
        )
      );

      const res = await axios.put(
        `${api}/api/orders/${order.order_id}/status`,
        { order_status: newStatus },
        {
          headers: { Authorization: `Bearer ${sellerToken}` },
        }
      );

      const updated = res.data?.data;
      if (updated) {
        setOrders((prev) =>
          prev.map((o) =>
            o.order_id === updated.order_id ? updated : o
          )
        );
      }

      toast.success("Order status updated.");
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status.");
      setOrders(prevOrders); 
    } finally {
      setUpdatingId(null);
    }
  };


  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Orders
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Order{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p className="mt-2 text-sm md:text-[15px] text-slate-600 max-w-xl">
              View all orders that include your products, update their statuses,
              and inspect full order details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        <div className="mb-4 md:mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Filter size={14} />
              <span>Filter</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-w-[150px]"
            >
              <option value="all">All statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading orders...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="text-xs text-slate-500">
              No orders found for these filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 pr-4 font-medium">Order ID</th>
                    <th className="py-2.5 pr-4 font-medium">
                      Products / Items
                    </th>
                    <th className="py-2.5 pr-4 font-medium">Amount</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 pr-4 font-medium">Placed On</th>
                    <th className="py-2.5 pr-4 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((o) => {
                    const status = normalizeStatus(o);
                    const isUpdating =
                      updatingId === (o._id || o.order_id);

                    const items = o.items || [];
                    const firstItem = items[0] || {};
                    const firstName =
                      firstItem.product_name ||
                      firstItem.name ||
                      firstItem.product?.name ||
                      "";

                    return (
                      <tr
                        key={o._id}
                        className="hover:bg-slate-50/70 transition"
                      >
                        <td className="py-2.5 pr-4 text-[11px] text-slate-800">
                          #{o.order_id || o._id?.slice(-6)}
                        </td>

                        <td className="py-2.5 pr-4 text-[11px] text-slate-700">
                          <p className="font-medium text-slate-800">
                            {items.length} item(s)
                          </p>
                          {firstName && (
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              {firstName}
                              {items.length > 1 && (
                                <span> • +{items.length - 1} more</span>
                              )}
                            </p>
                          )}
                        </td>

                        <td className="py-2.5 pr-4 text-[11px] text-slate-800">
                          ₹
                          {totalAmount(o).toLocaleString("en-IN")}
                        </td>

                        <td className="py-2.5 pr-4 text-[11px]">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(status)}
                            <div className="relative">
                              <select
                                value={status}
                                disabled={isUpdating}
                                onChange={(e) =>
                                  handleStatusChange(o, e.target.value)
                                }
                                className={`rounded-full border pl-3 pr-7 py-1 text-[10px] outline-none bg-white appearance-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 ${
                                  isUpdating
                                    ? "border-slate-200 text-slate-400"
                                    : "border-slate-200 text-slate-700 hover:border-slate-300"
                                }`}
                              >
                                {ORDER_STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                              <span className="pointer-events-none absolute inset-y-0 right-1 flex items-center pr-1">
                                {isUpdating ? (
                                  <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                                ) : (
                                  <span className="text-[9px] text-slate-400">
                                    ▼
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 pr-4 text-[11px] text-slate-500">
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )
                            : "-"}
                        </td>

                        <td className="py-2.5 pr-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-slate-200 p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Order #{selectedOrder.order_id ||
                      selectedOrder._id?.slice(-6)}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Placed on{" "}
                    {selectedOrder.createdAt
                      ? new Date(
                          selectedOrder.createdAt
                        ).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(selectedOrder)}
                  <p className="text-[11px] text-slate-500">
                    Amount:{" "}
                    <span className="font-semibold text-slate-900">
                      ₹
                      {totalAmount(
                        selectedOrder
                      ).toLocaleString("en-IN")}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.7fr,1.1fr] mt-2">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                  <h3 className="text-xs font-semibold text-slate-900 mb-2 flex items-center justify-between">
                    <span>Items in this order</span>
                    <span className="text-[10px] text-slate-500">
                      {(selectedOrder.items || []).length} item(s)
                    </span>
                  </h3>

                  {(!selectedOrder.items ||
                    selectedOrder.items.length === 0) ? (
                    <p className="text-[11px] text-slate-500">
                      No items data available.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {(selectedOrder.items || []).map((item, idx) => {
                        const img =
                          item.product_image ||
                          item.image ||
                          item.thumbnail ||
                          item.images?.[0] ||
                          item.product?.images?.[0] ||
                          null;

                        const name =
                          item.product_name ||
                          item.name ||
                          item.product?.name ||
                          "Product";

                        const brand =
                          item.brand || item.product?.brand || "";

                        const qty = item.quantity || 1;

                        const priceEach = Number(
                          item.price ||
                            (item.subtotal && qty
                              ? item.subtotal / qty
                              : 0)
                        );
                        const lineTotal =
                          item.subtotal || priceEach * qty;

                        return (
                          <li
                            key={idx}
                            className="flex justify-between gap-3 border border-slate-200 bg-white rounded-xl px-2.5 py-2 shadow-[0_1px_4px_rgba(15,23,42,0.04)]"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                                {img ? (
                                  <img
                                    src={img}
                                    alt={name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[9px] text-slate-400 text-center px-1">
                                    No image
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-[11px] font-semibold text-slate-900 line-clamp-2">
                                  {name}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {brand && <span>{brand} • </span>}
                                  Qty: {qty} • ₹
                                  {priceEach.toLocaleString("en-IN")}
                                  /item
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-center">
                              <p className="text-[11px] font-semibold text-slate-900">
                                ₹{lineTotal.toLocaleString("en-IN")}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                incl. all items
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Summary / Address */}
                <div className="space-y-3 text-[11px]">
                  <div className="border border-slate-200 rounded-xl p-3">
                    <h3 className="text-xs font-semibold text-slate-900 mb-2">
                      Payment & Summary
                    </h3>
                    <p className="text-slate-600">
                      Payment status:{" "}
                      <span className="font-semibold text-slate-900">
                        {selectedOrder.payment_status || "N/A"}
                      </span>
                    </p>
                    {selectedOrder.payment_method && (
                      <p className="text-slate-600">
                        Method:{" "}
                        <span className="font-semibold text-slate-900">
                          {selectedOrder.payment_method}
                        </span>
                      </p>
                    )}
                    <p className="mt-2 text-slate-600">
                      Total items:{" "}
                      <span className="font-semibold text-slate-900">
                        {(selectedOrder.items || []).length}
                      </span>
                    </p>
                    <p className="text-slate-600">
                      Total amount:{" "}
                      <span className="font-semibold text-slate-900">
                        ₹
                        {totalAmount(
                          selectedOrder
                        ).toLocaleString("en-IN")}
                      </span>
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-3">
                    <h3 className="text-xs font-semibold text-slate-900 mb-2">
                      Delivery Address
                    </h3>
                    {(() => {
                      const addr = extractAddress(selectedOrder);
                      if (!addr) {
                        return (
                          <p className="text-[11px] text-slate-500">
                            No address information available on this
                            order.
                          </p>
                        );
                      }

                      
                      if (addr.full) {
                        return (
                          <p className="text-[11px] text-slate-700 leading-relaxed">
                            {addr.full}
                          </p>
                        );
                      }

  
                      return (
                        <div className="text-slate-600 space-y-0.5">
                          {addr.name && (
                            <p className="font-semibold text-slate-900">
                              {addr.name}
                            </p>
                          )}
                          {addr.street && <p>{addr.street}</p>}
                          {(addr.city || addr.state) && (
                            <p>
                              {addr.city}
                              {addr.city && addr.state ? ", " : ""}
                              {addr.state}
                            </p>
                          )}
                          {addr.pincode && (
                            <p>PIN: {addr.pincode}</p>
                          )}
                          {addr.phone && (
                            <p>Phone: {addr.phone}</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerOrders;
