import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Modal from "../componets/Modal";

const api = import.meta.env.VITE_BACKEND_API;

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);

        const res = await axios.get(`${api}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data?.data || res.data || [];
        if (!Array.isArray(data)) {
          setUsers([]);
          setFiltered([]);
          return;
        }

        setUsers(data);
        setFiltered(data);
      } catch (err) {
        console.error("Fetch users error:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load users";
        toast.error(msg);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleSearch = (value) => {
    setSearch(value);
    if (!value.trim()) {
      setFiltered(users);
      return;
    }

    const v = value.toLowerCase();
    const f = users.filter((u) => {
      const name = String(u.name || "").toLowerCase();
      const email = String(u.email || "").toLowerCase();
      const phone = String(u.phone || "").toLowerCase();
      const id = String(u.user_id || u.id || u._id || "").toLowerCase();
      return (
        name.includes(v) ||
        email.includes(v) ||
        phone.includes(v) ||
        id.includes(v)
      );
    });

    setFiltered(f);
  };

  const extractOrderItems = (order) => {
    const items =
      order.items ||
      order.orderItems ||
      order.products ||
      order.cartItems ||
      [];
    if (!Array.isArray(items)) return [];
    return items.map((item) => {
      const name =
        item.productName ||
        item.name ||
        item.title ||
        (item.product && (item.product.name || item.product.title)) ||
        "Product";
      const image =
        item.productImage ||
        item.image ||
        item.thumbnail ||
        (item.product && (item.product.image || item.product.thumbnail)) ||
        null;
      return { name, image, id: item.product_id || item._id || name };
    });
  };

  const fetchUserDetails = async (user) => {
    try {
      setSelectedUser(user);
      setUserOrders([]);
      setIsModalOpen(true);
      setLoadingDetails(true);

      const userId = user.user_id || user.id || user._id;

      let ordersRes;
      try {
        ordersRes = await axios.get(`${api}/api/orders/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        ordersRes = await axios.get(`${api}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      const ordersData = ordersRes.data?.data || ordersRes.data || [];
      let userSpecificOrders = ordersData;

      if (Array.isArray(ordersData)) {
        userSpecificOrders = ordersData.filter((o) => {
          const uid = o.user_id || o.userId || o.user;
          return String(uid) === String(userId);
        });
      }

      setUserOrders(userSpecificOrders);
    } catch (err) {
      console.error("User detail error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load user details";
      toast.error(msg);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setUserOrders([]);
  };

  return (
    <div className="w-full ">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-5 md:py-6">
        <div className="mb-4 md:mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              Users
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              View customer list and inspect their orders.
            </p>
          </div>

          <div className="w-full md:w-72">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, email or ID"
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
              All Users
            </p>
            <span className="text-[11px] text-slate-500">
              {filtered.length} records
            </span>
          </div>

          {loadingUsers ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="animate-spin" size={16} />
              Loading users...
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
                      Name
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Email
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Phone
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user._id || user.user_id || user.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="py-2 pr-3 text-slate-800">
                        {user.user_id || user.id || String(user._id).slice(-6)}
                      </td>
                      <td className="py-2 pr-3 text-slate-800">
                        {user.name || "-"}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {user.email || "-"}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {user.phone || "-"}
                      </td>
                      <td className="py-2 pl-3 text-right">
                        <button
                          onClick={() => fetchUserDetails(user)}
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
              No users found.
            </p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedUser ? selectedUser.name || "User details" : "User details"}
        subtitle={
          selectedUser
            ? (selectedUser.email || "") +
              (selectedUser.phone ? " • " + selectedUser.phone : "")
            : ""
        }
        maxWidth="max-w-2xl"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                <UserCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {selectedUser.name || "-"}
                </p>
                <p className="text-xs text-slate-500">
                  ID:{" "}
                  {selectedUser.user_id ||
                    selectedUser.id ||
                    String(selectedUser._id).slice(-6)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                <span>{selectedUser.email || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                <span>{selectedUser.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <MapPin size={14} className="text-slate-400" />
                <span>
                  {selectedUser.pinCode ||
                    selectedUser.address ||
                    "No address available"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-slate-500" />
                  <p className="text-sm font-medium text-slate-900">
                    Orders
                  </p>
                </div>
                {loadingDetails && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Loader2 className="animate-spin" size={14} />
                    Loading
                  </span>
                )}
              </div>

              {userOrders.length > 0 ? (
                <div className="max-h-72 overflow-y-auto pr-1 space-y-3">
                  {userOrders.map((o) => {
                    const items = extractOrderItems(o);
                    return (
                      <div
                        key={o._id || o.order_id}
                        className="border border-slate-200 rounded-xl p-3 bg-slate-50/60"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs font-medium text-slate-900">
                              Order #{o.order_id || String(o._id).slice(-6)}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Amount: ₹
                              {(o.totalAmount || o.amount || 0).toLocaleString()}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-medium ${
                              String(o.order_status || "")
                                .toLowerCase()
                                .includes("delivered")
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : String(o.order_status || "")
                                    .toLowerCase()
                                    .includes("pending")
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-slate-50 text-slate-600 border border-slate-100"
                            }`}
                          >
                            {o.order_status || "N/A"}
                          </span>
                        </div>

                        {items.length > 0 ? (
                          <div className="space-y-2 mt-1">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 text-[11px]"
                              >
                                <div className="h-8 w-8 rounded-md bg-slate-200 flex items-center justify-center overflow-hidden">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon
                                      size={14}
                                      className="text-slate-400"
                                    />
                                  )}
                                </div>
                                <p className="text-slate-800 line-clamp-1">
                                  {item.name}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 mt-1">
                            No product details available.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : loadingDetails ? null : (
                <p className="text-[11px] text-slate-500">
                  No orders found for this user.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminUsers;
