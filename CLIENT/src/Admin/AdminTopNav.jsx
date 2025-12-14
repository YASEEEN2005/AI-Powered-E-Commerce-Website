import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Menu, Plus, Mail } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "../componets/Modal";

const api = import.meta.env.VITE_BACKEND_API;

function AdminTopNav() {
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menu = [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Users", to: "/admin/users" },
    { label: "Sellers", to: "/admin/sellers" },
    { label: "Products", to: "/admin/products" },
    { label: "Orders", to: "/admin/orders" },
    { label: "Payments", to: "/admin/payments" },
    { label: "Revenue", to: "/admin/revenue" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    window.location.href = "/admin";
  };

  const openAddAdmin = () => {
    setAddEmail("");
    setAddPassword("");
    setIsAddOpen(true);
  };

  const closeAddAdmin = () => {
    if (isSubmitting) return;
    setIsAddOpen(false);
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    if (!addEmail.trim() || !addPassword.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setIsSubmitting(true);

      await axios.post(`${api}/api/admin/login`, {
        email: addEmail,
        password: addPassword,
      });

      toast.success("Admin added successfully");
      setIsAddOpen(false);
      setAddEmail("");
      setAddPassword("");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to add admin"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="w-full bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900">
              Swift<span className="font-light">Cart</span>
            </span>
            <span className="ml-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-red-500 bg-red-50 border border-red-200 rounded-full px-2 py-[2px]">
              Admin
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-xs md:text-sm">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "inline-flex items-center h-8 px-3 rounded-full transition-colors duration-150",
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <NavLink
              to="/admin/messages"
              className="relative h-9 w-9 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 hover:bg-slate-900 hover:text-white transition"
            >
              <Mail size={16} />
            </NavLink>

            <div className="hidden sm:flex flex-col items-end">
              <p className="text-xs text-slate-700">
                {adminInfo?.email || "admin@swiftcart.com"}
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Super Admin
              </p>
            </div>

            <button
              type="button"
              onClick={openAddAdmin}
              className="hidden sm:inline-flex items-center justify-center h-8 px-2.5 rounded-full border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
            >
              <Plus size={14} className="mr-1" />
              Add
            </button>

            <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-semibold text-slate-50">
              {adminInfo?.email
                ? adminInfo.email.charAt(0).toUpperCase()
                : "A"}
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-[11px] md:text-xs font-medium text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Out</span>
            </button>

            <button className="md:hidden text-slate-700">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <Modal
        isOpen={isAddOpen}
        onClose={closeAddAdmin}
        title="Add Admin"
        subtitle="Create a new admin using email and password"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddAdminSubmit} className="space-y-4 text-sm">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={addPassword}
              onChange={(e) => setAddPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeAddAdmin}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? "Adding..." : "Add admin"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default AdminTopNav;
