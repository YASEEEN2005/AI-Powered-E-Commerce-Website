// src/Admin/AdminTopNav.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";

function AdminTopNav() {
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  const menu = [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Users", to: "/admin/users" },
    { label: "Sellers", to: "/admin/sellers" },
    { label: "Products", to: "/admin/products" },
    { label: "Orders", to: "/admin/orders" },
    { label: "Payments", to: "/admin/payments" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    window.location.href = "/admin";
  };

  return (
    <header className="w-full bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        {/* Left – Logo + badge */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center text-slate-900 text-sm font-bold shadow-sm">
            SC
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-sm md:text-base font-semibold text-slate-50">
                SwiftCart
              </p>
              <span className="px-2 py-[2px] rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/40 hidden sm:inline-flex">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Control center for users, sellers & orders
            </p>
          </div>
        </div>

        {/* Center – Nav links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs md:text-sm">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "relative inline-flex items-center h-8 px-2.5 rounded-full transition-all duration-150",
                  isActive
                    ? "bg-slate-800 text-slate-50 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-900/70",
                ].join(" ")
              }
            >
              <span className="leading-none">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right – admin info + logout */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-xs text-slate-300">
              {adminInfo?.email || "admin@swiftcart.com"}
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Super Admin
            </p>
          </div>

          <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-100">
            {adminInfo?.email
              ? adminInfo.email.charAt(0).toUpperCase()
              : "A"}
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-500/60 bg-red-500/10 px-3 py-1.5 text-[11px] md:text-xs font-medium text-red-300 hover:bg-red-500/20 hover:border-red-400/80 transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminTopNav;
