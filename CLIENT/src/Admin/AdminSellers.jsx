import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Search, Phone, Mail, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const api = import.meta.env.VITE_BACKEND_API;

function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${api}/api/admin/sellers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data?.data || res.data || [];
        if (!Array.isArray(data)) {
          setSellers([]);
          setFiltered([]);
          return;
        }

        setSellers(data);
        setFiltered(data);
      } catch (err) {
        console.error("Fetch sellers error:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load sellers";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSellers();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleSearch = (value) => {
    setSearch(value);
    if (!value.trim()) {
      setFiltered(sellers);
      return;
    }

    const v = value.toLowerCase();
    const f = sellers.filter((s) => {
      const name = String(s.name || "").toLowerCase();
      const shop = String(
        s.shopName || s.storeName || s.shop_name || ""
      ).toLowerCase();
      const phone = String(s.phone || "").toLowerCase();
      const id = String(s.seller_id || s.id || s._id || "").toLowerCase();
      return (
        name.includes(v) || shop.includes(v) || phone.includes(v) || id.includes(v)
      );
    });
    setFiltered(f);
  };

  const updateLocalSeller = (sellerId, changes) => {
    setSellers((prev) =>
      prev.map((s) =>
        String(s.seller_id || s.id || s._id) === String(sellerId)
          ? { ...s, ...changes }
          : s
      )
    );
    setFiltered((prev) =>
      prev.map((s) =>
        String(s.seller_id || s.id || s._id) === String(sellerId)
          ? { ...s, ...changes }
          : s
      )
    );
  };

  const handleApprove = async (seller) => {
    const id = seller.seller_id || seller.id || seller._id;
    if (!id) {
      toast.error("Seller ID not found");
      return;
    }

    try {
      setUpdatingId(id);
      const res = await axios.put(
        `${api}/api/admin/seller/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = res.data?.data || res.data || { status: "approved" };
      updateLocalSeller(id, updated);
      toast.success("Seller approved");
    } catch (err) {
      console.error("Approve seller error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to approve seller";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (seller) => {
    const id = seller.seller_id || seller.id || seller._id;
    if (!id) {
      toast.error("Seller ID not found");
      return;
    }

    const ok = window.confirm("Reject this seller? They cannot sell on platform.");
    if (!ok) return;

    try {
      setUpdatingId(id);
      const res = await axios.put(
        `${api}/api/admin/seller/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = res.data?.data || res.data || { status: "rejected" };
      updateLocalSeller(id, updated);
      toast.success("Seller rejected");
    } catch (err) {
      console.error("Reject seller error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to reject seller";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBlock = async (seller) => {
    const id = seller.seller_id || seller.id || seller._id;
    if (!id) {
      toast.error("Seller ID not found");
      return;
    }

    const ok = window.confirm(
      "Block this seller? This will remove their seller account."
    );
    if (!ok) return;

    try {
      setUpdatingId(id);
      await axios.delete(`${api}/api/admin/seller/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSellers((prev) =>
        prev.filter(
          (s) => String(s.seller_id || s.id || s._id) !== String(id)
        )
      );
      setFiltered((prev) =>
        prev.filter(
          (s) => String(s.seller_id || s.id || s._id) !== String(id)
        )
      );
      toast.success("Seller blocked");
    } catch (err) {
      console.error("Block seller error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to block seller";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleView = (seller) => {
    const id = seller.seller_id || seller.id || seller._id;
    navigate(`/admin/sellers/${id}`);
  };

  return (
    <div className="w-full bg-slate-50">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-5 md:py-6">
        <div className="mb-4 md:mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              Sellers
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage marketplace sellers, approvals and blocks.
            </p>
          </div>

          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, shop or ID"
                className="w-full rounded-full border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-900">
              All Sellers
            </p>
            <span className="text-[11px] text-slate-500">
              {filtered.length} records
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="animate-spin" size={16} />
              Loading sellers...
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      ID
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Seller
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Shop
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Phone
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Status
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((seller) => {
                    const id =
                      seller.seller_id || seller.id || seller._id;
                    const status = String(seller.status || "").toLowerCase();
                    const isPending = status.includes("pending");

                    return (
                      <tr
                        key={seller._id || seller.seller_id || seller.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                      >
                        <td className="py-2 pr-3 text-slate-800">
                          {seller.seller_id ||
                            seller.id ||
                            String(seller._id || "").slice(-6)}
                        </td>
                        <td className="py-2 pr-3 text-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-semibold">
                              {(seller.name || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p>{seller.name || "-"}</p>
                              {seller.email && (
                                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <Mail size={11} />
                                  {seller.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-3 text-slate-800">
                          {seller.shopName ||
                            seller.storeName ||
                            seller.shop_name ||
                            "-"}
                        </td>
                        <td className="py-2 pr-3 text-slate-700">
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Phone size={12} className="text-slate-400" />
                            {seller.phone || "-"}
                          </span>
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-medium ${
                              status.includes("approved")
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : status.includes("pending")
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : status.includes("reject")
                                ? "bg-red-50 text-red-600 border border-red-100"
                                : "bg-slate-50 text-slate-600 border border-slate-100"
                            }`}
                          >
                            {seller.status || "N/A"}
                          </span>
                        </td>
                        <td className="py-2 pl-3">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleView(seller)}
                              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                            >
                              View
                            </button>

                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleApprove(seller)}
                                  disabled={updatingId === id}
                                  className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                                >
                                  {updatingId === id ? (
                                    <Loader2
                                      size={12}
                                      className="animate-spin mr-1"
                                    />
                                  ) : null}
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(seller)}
                                  disabled={updatingId === id}
                                  className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {!isPending && (
                              <button
                                onClick={() => handleBlock(seller)}
                                disabled={updatingId === id}
                                className="inline-flex items-center justify-center rounded-full border border-red-300 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                              >
                                {updatingId === id ? (
                                  <Loader2
                                    size={12}
                                    className="animate-spin mr-1"
                                  />
                                ) : null}
                                Block
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No sellers found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSellers;
