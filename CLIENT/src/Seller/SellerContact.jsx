import React from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  AlertCircle,
  Send,
  Clock,
} from "lucide-react";

function SellerContact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Support Center
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Contact{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                SwiftCart Seller Support
              </span>
            </h1>
            <p className="mt-2 text-sm md:text-[15px] text-slate-600 max-w-xl">
              Having trouble with products, orders, or payouts? Raise a ticket
              and our team will get back to you as soon as possible.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <Clock size={16} className="text-amber-500" />
            <span className="text-xs font-medium text-slate-700">
              Avg. response time:{" "}
              <span className="text-slate-900">2–4 hrs</span>
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr,1.2fr]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 md:p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                  Create Support Ticket
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Share more details so we can resolve your issue faster.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-[11px] font-medium text-indigo-700 border border-indigo-100">
                <AlertCircle size={13} />
                High priority issues get auto-escalated
              </span>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Eg: Issue with order settlement"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Order ID (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="#SC-2025-0001"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Priority <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 bg-slate-50/80 px-3 py-2 font-medium text-slate-700 hover:border-slate-300 transition"
                    >
                      Low
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-amber-200 bg-amber-50/80 px-3 py-2 font-medium text-amber-700 hover:border-amber-300 transition"
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-rose-300 bg-rose-50 px-3 py-2 font-medium text-rose-700 hover:border-rose-400 transition"
                    >
                      High
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Describe your issue <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Explain what went wrong, steps to reproduce, and any screenshots or references you have."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <AlertCircle size={13} className="text-amber-500" />
                  Do not share passwords, OTPs or full card details in this
                  form.
                </p>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-600 active:scale-[0.98] transition"
                >
                  <Send size={16} />
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4 md:space-y-5">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-50 rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-900/30 border border-slate-700/70">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300 mb-2">
                Need quick help?
              </p>
              <h3 className="text-lg font-semibold mb-2">
                Priority Support for Sellers
              </h3>
              <p className="text-[13px] text-slate-200/80 mb-4">
                For time-sensitive issues like payment failures or order
                blocking, you can reach our dedicated seller support channels.
              </p>

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

              <div className="mt-4 border-t border-slate-700/70 pt-3 flex items-center justify-between text-[11px] text-slate-300">
                <span>
                  Support hours:{" "}
                  <span className="font-medium text-white">All days</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/40">
                  Status: Online
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Tips for faster resolution
              </h3>
              <ul className="space-y-2 text-[13px] text-slate-600">
                <li className="flex gap-2">
                  <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Add exact{" "}
                  <span className="font-medium text-slate-800">
                    &nbsp;Order ID
                  </span>{" "}
                  / Product ID if your issue is order-related.
                </li>
                <li className="flex gap-2">
                  <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Mention error messages or screenshots if you see any failures.
                </li>
                <li className="flex gap-2">
                  <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Choose the correct priority level so our team can triage
                  properly.
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Recent Tickets
                </h3>
                <span className="text-[11px] text-slate-500">
                  Sample preview (static)
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-slate-800">
                      #SC-TK-1024 • Payment delay
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Updated 1 hr ago
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Resolved
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-slate-800">
                      #SC-TK-1031 • Product not visible
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Updated 20 min ago
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                    In Review
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerContact;
