import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MessageCircle,
  Users,
  Store,
  Clock,
  Loader2,
} from "lucide-react";

const api = import.meta.env.VITE_BACKEND_API;

function AdminMessages() {
  const token = localStorage.getItem("adminToken");

  const [activeTab, setActiveTab] = useState("users");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const url =
        activeTab === "users"
          ? `${api}/api/contact`
          : `${api}/api/admin/seller-support`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItems(res.data?.data || res.data || []);
      setSelected(null);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-6 md:py-7">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Admin Inbox
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Messages & Support
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Manage user contact requests and seller support tickets.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-slate-700">
              Live inbox • synced from API
            </span>
          </div>
        </div>

        <div className="mb-5 flex gap-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${
              activeTab === "users"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Users size={16} />
            User Messages
          </button>

          <button
            onClick={() => setActiveTab("sellers")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${
              activeTab === "sellers"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Store size={16} />
            Seller Tickets
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px,1fr] gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b text-sm font-medium text-slate-800">
              {activeTab === "users"
                ? "Latest User Messages"
                : "Latest Seller Tickets"}
            </div>

            {loading ? (
              <div className="flex items-center gap-2 p-4 text-sm text-slate-500">
                <Loader2 className="animate-spin" size={16} />
                Loading messages...
              </div>
            ) : items.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">
                No messages available.
              </p>
            ) : (
              <div className="max-h-[560px] overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item._id || item.contact_id || item.ticket_id}
                    onClick={() => setSelected(item)}
                    className={`px-4 py-3 border-b cursor-pointer transition ${
                      selected &&
                      (selected._id === item._id ||
                        selected.contact_id === item.contact_id ||
                        selected.ticket_id === item.ticket_id)
                        ? "bg-slate-100"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.subject || "No subject"}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-[2px] rounded-full border ${
                          String(item.status || "")
                            .toLowerCase()
                            .includes("resolved")
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : String(item.status || "")
                                .toLowerCase()
                                .includes("review")
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100"
                        }`}
                      >
                        {item.status || "new"}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-500 truncate">
                      {activeTab === "users"
                        ? item.email
                        : `Seller ID: ${item.seller_id}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <MessageCircle className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-600">
                  Select a message to view full details
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selected.subject || "Message"}
                  </h2>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    {activeTab === "users" ? (
                      <span>{selected.email}</span>
                    ) : (
                      <span>Seller ID: {selected.seller_id}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(
                        selected.createdAt || selected.updatedAt
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selected.message}
                </div>

                <div className="mt-4 text-[11px] text-slate-500">
                  Current status:{" "}
                  <span className="font-medium text-slate-700">
                    {selected.status || "new"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMessages;
