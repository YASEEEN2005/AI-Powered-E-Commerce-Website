import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Modal from "../componets/Modal";
import OtpLogin from "../pages/OtpLogin";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { cartCount } = useCart();

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("authToken");
    if (tokenFromStorage) setIsLoggedIn(true);
  }, []);

  const handleCloseLogin = () => {
    setLoginOpen(false);
    const tokenFromStorage = localStorage.getItem("authToken");
    if (tokenFromStorage) setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      <header className="w-full sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-3 md:py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xl md:text-2xl font-black tracking-tight">
                Swift
              </span>
              <span className="text-xl md:text-2xl font-light tracking-tight">
                Cart
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[13px] font-medium text-slate-700 md:flex">
            <Link
              to="/"
              className="relative px-1 py-0.5 hover:text-slate-950 transition-colors"
            >
              Home
            </Link>

            <div className="relative group">
              <button className="flex items-center gap-1 px-1 py-0.5 hover:text-slate-950 transition-colors">
                <span>Shop</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              <div
                className="invisible absolute left-0 mt-3 w-56 rounded-2xl bg-white/95 
                shadow-[0_22px_60px_rgba(15,23,42,0.20)] ring-1 ring-black/5 opacity-0 translate-y-1
                transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 z-40"
              >
                <div className="px-3 py-2 border-b border-slate-100/80">
                  <p className="text-[11px] font-semibold text-slate-500 tracking-[0.18em] uppercase">
                    Browse
                  </p>
                </div>
                <Link
                  to="/products"
                  className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                >
                  All Products
                </Link>
                <Link
                  to="/"
                  onClick={() =>
                    sessionStorage.setItem("scrollTo", "best-selling")
                  }
                  className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                >
                  Best Sellers
                </Link>

                <Link
                  to="/"
                  onClick={() =>
                    sessionStorage.setItem("scrollTo", "new-arrivals")
                  }
                  className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                >
                  New Arrivals
                </Link>
              </div>
            </div>

            <Link
              to="/recommended"
              className="px-1 py-0.5 hover:text-slate-950 transition-colors"
            >
              Made for You
            </Link>

            <div className="relative group">
              <button className="flex items-center gap-1 px-1 py-0.5 hover:text-slate-950 transition-colors">
                <span>Pages</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              <div
                className="invisible absolute left-0 mt-3 w-56 rounded-2xl bg-white/95 
                shadow-[0_22px_60px_rgba(15,23,42,0.20)] ring-1 ring-black/5 opacity-0 translate-y-1
                transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 z-40"
              >
                <Link
                  to="/about"
                  className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                >
                  About Us
                </Link>
                <Link
                  to="/faq"
                  className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                >
                  FAQ
                </Link>
                <Link
                  to="/policy"
                  className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                >
                  Terms & Policy
                </Link>
              </div>
            </div>

            <Link
              to="/contact"
              className="px-1 py-0.5 hover:text-slate-950 transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-1.5 md:gap-2.5">
            <button className="hidden h-9 w-9 items-center justify-center rounded-full bg-white hover:bg-slate-50 md:flex shadow-sm">
              <Link to="/products">
                <Search className="h-4 w-4 text-slate-700" />
              </Link>
            </button>

            <Link
              to="/wishlist"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white hover:bg-slate-50 shadow-sm"
            >
              <Heart className="h-4 w-4 text-slate-700" />
            </Link>

            <Link
              to="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white hover:bg-slate-50 shadow-sm"
            >
              <ShoppingBag className="h-4 w-4 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-0.5 flex items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>

            {!isLoggedIn ? (
              <button
                onClick={() => setLoginOpen(true)}
                className="hidden md:inline-flex items-center rounded-full border border-slate-200/80 px-5 py-1.5 
                text-[12px] font-medium text-slate-900 bg-slate-900/5 shadow-sm hover:bg-slate-900 hover:text-white active:scale-[0.98] transition"
              >
                Login
              </button>
            ) : (
              <div className="relative group hidden md:block">
                <button
                  className="flex items-center gap-2 rounded-full border border-slate-200/80 
                  px-3.5 py-1.5 text-[12px] font-medium text-slate-900 bg-white shadow-sm hover:bg-slate-50"
                >
                  <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px]">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span>Profile</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                <div
                  className="invisible absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 
                  shadow-[0_22px_60px_rgba(15,23,42,0.20)] ring-1 ring-black/5 opacity-0 translate-y-1
                  transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 z-40"
                >
                  <Link
                    to="/account"
                    className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                  >
                    Account
                  </Link>
                  <Link
                    to="/account/orders"
                    className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/payments"
                    className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                  >
                    Payment
                  </Link>
                  <Link
                    to="/address"
                    className="block px-4 py-2.5 text-sm hover:bg-slate-50"
                  >
                    Address
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 shadow-sm"
            >
              {mobileOpen ? (
                <X className="h-5 w-5 text-slate-900" />
              ) : (
                <Menu className="h-5 w-5 text-slate-900" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white md:hidden relative z-20">
            <div className="flex flex-col px-4 py-3 text-sm">
              <button
                className="flex justify-between py-2 items-center"
                onClick={() => toggleDropdown("home")}
              >
                <span>Home</span>
                <ChevronDown
                  className={`h-4 w-4 transition ${
                    openDropdown === "home" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === "home" && (
                <div className="pl-4 text-xs text-slate-700">
                  <Link to="/" className="block py-1">
                    Default Home
                  </Link>
                  <Link to="/minimal-home" className="block py-1">
                    Minimal Home
                  </Link>
                </div>
              )}

              <button
                className="flex justify-between py-2 items-center"
                onClick={() => toggleDropdown("shop")}
              >
                <span>Shop</span>
                <ChevronDown
                  className={`h-4 w-4 transition ${
                    openDropdown === "shop" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === "shop" && (
                <div className="pl-4 text-xs text-slate-700">
                  <Link to="/products" className="block py-1">
                    All Products
                  </Link>
                  <Link to="/new-arrivals" className="block py-1">
                    New Arrivals
                  </Link>
                  <Link to="/best-sellers" className="block py-1">
                    Best Sellers
                  </Link>
                </div>
              )}

              <Link to="/recommended" className="py-2">
                Made for You
              </Link>

              <button
                className="flex justify-between py-2 items-center"
                onClick={() => toggleDropdown("pages")}
              >
                <span>Pages</span>
                <ChevronDown
                  className={`h-4 w-4 transition ${
                    openDropdown === "pages" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === "pages" && (
                <div className="pl-4 text-xs text-slate-700">
                  <Link to="/about" className="block py-1">
                    About Us
                  </Link>
                  <Link to="/faq" className="block py-1">
                    FAQ
                  </Link>
                  <Link to="/policy" className="block py-1">
                    Terms & Policy
                  </Link>
                </div>
              )}

              <Link to="/contact" className="py-2">
                Contact
              </Link>

              {!isLoggedIn ? (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="mt-3 rounded-full border border-slate-200 px-4 py-2 text-center text-sm bg-white shadow-sm hover:bg-slate-50"
                >
                  Login
                </button>
              ) : (
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">
                    Account
                  </p>
                  <Link to="/account" className="block py-1">
                    Account
                  </Link>
                  <Link to="/account/orders" className="block py-1">
                    Orders
                  </Link>
                  <Link to="/payments" className="block py-1">
                    Payment
                  </Link>
                  <Link to="/address" className="block py-1">
                    Address
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mt-2 rounded-full border border-slate-200 px-4 py-2 text-center text-sm text-red-500 bg-white shadow-sm hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <Modal isOpen={loginOpen} onClose={handleCloseLogin} maxWidth="max-w-sm">
        <OtpLogin onClose={handleCloseLogin} />
      </Modal>
    </>
  );
}

export default Navbar;
