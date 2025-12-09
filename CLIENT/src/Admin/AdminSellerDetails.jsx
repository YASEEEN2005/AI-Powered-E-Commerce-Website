import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  ShoppingBag,
  Box,
  Loader2,
  Image as ImageIcon,
  ChevronDown
} from "lucide-react";

const api = import.meta.env.VITE_BACKEND_API;

const STATUS_OPTIONS = ["approved", "pending", "rejected", "blocked"];

function AdminSellerDetails() {
  const params = useParams();
  const sellerParam = params.seller_id || params.id;
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusValue, setStatusValue] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchSellerData = async (sid) => {
      try {
        setLoading(true);

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [sellerRes, productsRes, ordersRes] = await Promise.all([
          axios.get(`${api}/api/admin/seller/${sid}`, { headers }),
          axios.get(`${api}/api/seller/${sid}/products`, { headers }),
          axios.get(`${api}/api/seller/${sid}/orders`, { headers })
        ]);

        const sellerData = sellerRes.data?.data || sellerRes.data || null;
        const productsData = productsRes.data?.data || productsRes.data || [];
        const ordersData = ordersRes.data?.data || ordersRes.data || [];

        setSeller(sellerData);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setStatusValue(
          String(sellerData?.status || "").toLowerCase() || "pending"
        );
      } catch (err) {
        console.error("Seller detail error:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load seller details";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    if (token && sellerParam) {
      fetchSellerData(sellerParam);
    } else {
      setLoading(false);
    }
  }, [token, sellerParam]);

  const handleStatusUpdate = async () => {
    if (!seller) return;
    const id = seller.seller_id || seller.id || seller._id;
    if (!id) {
      toast.error("Seller ID not found");
      return;
    }

    try {
      setUpdatingStatus(true);

      const payload = { status: statusValue };
      const res = await axios.put(
        `${api}/api/admin/seller/${id}/status`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updated = res.data?.data || res.data || payload;

      setSeller((prev) =>
        prev ? { ...prev, ...updated } : prev
      );

      toast.success("Seller status updated");
    } catch (err) {
      console.error("Update seller status error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update seller status";
      toast.error(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusBadgeClass = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("approved")) {
      return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    }
    if (s.includes("pending")) {
      return "bg-amber-50 text-amber-600 border border-amber-100";
    }
    if (s.includes("reject")) {
      return "bg-red-50 text-red-600 border border-red-100";
    }
    if (s.includes("block")) {
      return "bg-slate-900 text-slate-50 border border-slate-900";
    }
    return "bg-slate-50 text-slate-600 border border-slate-100";
  };

  const totalRevenue = orders.reduce((sum, o) => {
    const val = o.totalAmount || o.amount || 0;
    return sum + Number(val || 0);
  }, 0);

  const totalOrders = orders.length;
  const totalProducts = products.length;

  return (
    <div className="w-full bg-slate-50">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-5 md:py-6">
        <button
          onClick={() => navigate("/admin/sellers")}
          className="mb-4 inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft size={14} />
          Back to sellers
        </button>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="animate-spin" size={16} />
            Loading seller details...
          </div>
        ) : !seller ? (
          <p className="text-sm text-slate-500">Seller not found.</p>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Store size={22} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                    {seller.shopName ||
                      seller.storeName ||
                      seller.shop_name ||
                      "Seller Shop"}
                  </h2>
                  <p className="text-sm text-slate-600 flex items-center gap-1.5">
                    <span>{seller.name || "Seller"}</span>
                    {seller.status && (
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-medium " +
                          statusBadgeClass(seller.status)
                        }
                      >
                        {seller.status}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    ID:{" "}
                    {seller.seller_id ||
                      seller.id ||
                      String(seller._id || "").slice(-6)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 items-start md:items-end">
                <div className="text-xs text-slate-700 space-y-1 w-full md:w-auto">
                  {seller.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate max-w-[220px] md:max-w-[260px]">
                        {seller.email}
                      </span>
                    </div>
                  )}
                  {seller.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      <span>{seller.phone}</span>
                    </div>
                  )}
                  {(seller.address || seller.location) && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="truncate max-w-[220px] md:max-w-[260px]">
                        {seller.address || seller.location}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-40">
                    <select
                      value={statusValue}
                      onChange={(e) => setStatusValue(e.target.value)}
                      className="w-full appearance-none rounded-full border border-slate-200 bg-white pl-3 pr-7 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
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
                    onClick={handleStatusUpdate}
                    disabled={updatingStatus}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {updatingStatus && (
                      <Loader2
                        size={12}
                        className="animate-spin mr-1"
                      />
                    )}
                    Update
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Total revenue</p>
                  <div className="h-7 w-7 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <IndianRupee size={16} />
                  </div>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  ₹{totalRevenue.toLocaleString()}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Total orders</p>
                  <div className="h-7 w-7 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {totalOrders}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Products</p>
                  <div className="h-7 w-7 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <Box size={16} />
                  </div>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {totalProducts}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1.2fr)] gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-900">
                    Orders
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {orders.length} records
                  </span>
                </div>

                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="py-2 pr-3 text-slate-500 font-medium">
                            Order
                          </th>
                          <th className="py-2 pr-3 text-slate-500 font-medium">
                            Buyer
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
                        {orders.map((o) => (
                          <tr
                            key={o._id || o.order_id}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="py-2 pr-3 text-slate-800">
                              #{o.order_id || String(o._id || "").slice(-6)}
                            </td>
                            <td className="py-2 pr-3 text-slate-700">
                              {o.userName ||
                                o.customerName ||
                                o.user_id ||
                                "-"}
                            </td>
                            <td className="py-2 pr-3 text-slate-800">
                              ₹{(o.totalAmount || o.amount || 0).toLocaleString()}
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No orders for this seller.
                  </p>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-900">
                    Products
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {products.length} records
                  </span>
                </div>

                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                    {products.map((p) => {
                      const imageSrc =
                        (Array.isArray(p.images) && p.images[0]) ||
                        p.image ||
                        p.thumbnail;

                      return (
                        <div
                          key={p._id || p.product_id}
                          className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex gap-3"
                        >
                          <div className="h-14 w-14 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={p.name || p.title || "Product"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon
                                size={18}
                                className="text-slate-400"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-900 line-clamp-2">
                              {p.name || p.title || "Product"}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-1">
                              ₹{(p.price || 0).toLocaleString()}
                            </p>
                            {p.stock != null && (
                              <p className="text-[11px] text-slate-500">
                                Stock: {p.stock}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No products for this seller.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminSellerDetails;
