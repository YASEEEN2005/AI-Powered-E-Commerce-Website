import React, { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  AlertCircle,
  Send,
  Clock,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

function SellerContact() {
  const api = import.meta.env.VITE_BACKEND_API;
  const { seller, token } = useAuth();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [order_id, setOrderId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    if (!seller?.seller_id) return;

    const fetchTickets = async () => {
      try {
        const res = await axios.get(
          `${api}/api/seller/support/${seller.seller_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRecentTickets(res.data.data.slice(0, 3));
      } catch {
        setRecentTickets([]);
      }
    };

    fetchTickets();
  }, [seller, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject || !category || !message) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${api}/api/seller/support`,
        {
          seller_id: seller.seller_id,
          subject,
          category,
          order_id,
          priority,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Support ticket submitted successfully");

      setSubject("");
      setCategory("");
      setOrderId("");
      setPriority("medium");
      setMessage("");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit support ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/70">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
              Support Center
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-bold text-slate-900">
              Contact{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                SwiftCart Seller Support
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Having trouble with products, orders, or payouts? Raise a ticket
              and our team will assist you shortly.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <Clock size={15} className="text-amber-500" />
            <span className="text-xs font-medium text-slate-700">
              Avg. response time:{" "}
              <span className="text-slate-900">2–4 hrs</span>
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1.2fr]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 sm:p-6 md:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Create Support Ticket
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Please provide accurate details for faster resolution.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-[11px] font-medium text-indigo-700 border border-indigo-100">
                <AlertCircle size={13} />
                Auto-escalation enabled
              </span>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Issue with order settlement"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
                  required
                />

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
                  required
                >
                  <option value="">Select category</option>
                  <option value="orders">Orders & Returns</option>
                  <option value="products">Product Listings</option>
                  <option value="payments">Payments & Payouts</option>
                  <option value="account">Account & KYC</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <input
                value={order_id}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order ID (optional)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
              />

              <div className="grid grid-cols-3 gap-2 text-xs">
                {["low", "medium", "high"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`rounded-full px-3 py-2 font-medium border transition ${
                      priority === p
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Describe your issue clearly..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm resize-none outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:from-indigo-700 hover:to-violet-600 disabled:opacity-60"
              >
                <Send size={16} />
                {loading ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </div>

          <div className="space-y-5">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-50 rounded-2xl p-5 shadow-lg border border-slate-700/70">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300 mb-2">
                Need quick help?
              </p>
              <h3 className="text-lg font-semibold mb-2">
                Priority Support for Sellers
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-indigo-300" />
                  <span>support-seller@swiftcart.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-emerald-300" />
                  <span>+91-80-1234-5678</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-violet-300" />
                  <span>Chat support: 9:00 AM – 9:00 PM IST</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Recent Tickets
                </h3>
                <span className="text-[11px] text-slate-500">
                  Last 3 tickets
                </span>
              </div>

              <div className="space-y-2.5">
                {recentTickets.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No tickets created yet.
                  </p>
                ) : (
                  recentTickets.map((ticket) => (
                    <div
                      key={ticket.ticket_id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          #{ticket.ticket_id} • {ticket.subject}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(ticket.updatedAt).toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={`px-2 py-1 rounded-full border text-[11px] font-medium ${
                          ticket.status === "resolved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : ticket.status === "in_review"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-indigo-50 text-indigo-700 border-indigo-100"
                        }`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerContact;
