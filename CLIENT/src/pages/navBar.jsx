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
  const { logout, isAuthenticated } = useAuth();
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
    <header className="w-full sticky top-0 bg-white/90 backdrop-blur border-b border-slate-100 z-50">
      <div className="mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight">
            Swift<span className="font-light">Cart</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-800 md:flex">
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-black">
              <Link to="/" className=" hover:text-black">
                Home
              </Link>
            </button>
          </div>

          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-black">
              <span>Shop</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            <div
              className="invisible absolute left-0 mt-3 w-48 rounded-2xl bg-white/95 
              shadow-[0_18px_45px_rgba(15,23,42,0.18)] ring-1 ring-black/5 opacity-0 translate-y-1
              transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 z-50"
            >
              <Link
                to="/products"
                className="block px-4 py-2 text-sm hover:bg-slate-50"
              >
                All Products
              </Link>
              <Link
                to="/new-arrivals"
                className="block px-4 py-2 text-sm hover:bg-slate-50"
              >
                New Arrivals
              </Link>
              <Link
                to="/best-sellers"
                className="block px-4 py-2 text-sm hover:bg-slate-50"
              >
                Best Sellers
              </Link>
            </div>
          </div>

          <Link to="/recommended" className="hover:text-black">
            Made for You
          </Link>

          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-black">
              <span>Pages</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            <div
              className="invisible absolute left-0 mt-3 w-48 rounded-2xl bg-white/95 
              shadow-[0_18px_45px_rgba(15,23,42,0.18)] ring-1 ring-black/5 opacity-0 translate-y-1
              transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 z-50"
            >
              <Link
                to="/about"
                className="block px-4 py-2 text-sm hover:bg-slate-50"
              >
                About Us
              </Link>
              <Link
                to="/faq"
                className="block px-4 py-2 text-sm hover:bg-slate-50"
              >
                FAQ
              </Link>
              <Link
                to="/policy"
                className="block px-4 py-2 text-sm hover:bg-slate-50"
              >
                Terms & Policy
              </Link>
            </div>
          </div>

          <Link to="/contact" className="hover:text-black">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 md:flex">
            <Search className="h-4 w-4" />
          </button>
          <Link
            to="/wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <Heart className="h-5 w-5" />
          </Link>

          <Link
            to="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-0.5 flex items-center justify-center rounded-full bg-black text-white text-[10px]">
                {cartCount}
              </span>
            )}
          </Link>

          {!isLoggedIn ? (
            <button
              onClick={() => setLoginOpen(true)}
              className="hidden md:inline-flex rounded-full border border-slate-200 px-6 py-1.5 
              text-sm shadow-sm hover:bg-slate-50"
            >
              Login
            </button>
          ) : (
            <div className="relative group hidden md:block">
              <button
                className="flex items-center gap-2 rounded-full border border-slate-200 
                px-3 py-1.5 text-sm shadow-sm hover:bg-slate-50"
              >
                <User className="h-4 w-4" />
                <span className="text-xs">Profile</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              <div
                className="invisible absolute right-0 mt-2 w-44 rounded-2xl bg-white/95 
                shadow-[0_18px_45px_rgba(15,23,42,0.18)] ring-1 ring-black/5 opacity-0 translate-y-1
                transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 z-50"
              >
                <Link
                  to="/account"
                  className="block px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Account
                </Link>
                <Link
                  to="/account/orders"
                  className="block px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Orders
                </Link>
                <Link
                  to="/payments"
                  className="block px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Payment
                </Link>
                <Link
                  to="/address"
                  className="block px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Address
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-white md:hidden relative z-50">
          <div className="flex flex-col px-4 py-3 text-sm">
            <button
              className="flex justify-between py-2"
              onClick={() => toggleDropdown("home")}
            >
              Home
              <ChevronDown
                className={`h-4 w-4 transition ${
                  openDropdown === "home" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "home" && (
              <div className="pl-4 text-xs">
                <Link to="/" className="block py-1">
                  Default Home
                </Link>
                <Link to="/minimal-home" className="block py-1">
                  Minimal Home
                </Link>
              </div>
            )}

            <button
              className="flex justify-between py-2"
              onClick={() => toggleDropdown("shop")}
            >
              Shop
              <ChevronDown
                className={`h-4 w-4 transition ${
                  openDropdown === "shop" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "shop" && (
              <div className="pl-4 text-xs">
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
              className="flex justify-between py-2"
              onClick={() => toggleDropdown("pages")}
            >
              Pages
              <ChevronDown
                className={`h-4 w-4 transition ${
                  openDropdown === "pages" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "pages" && (
              <div className="pl-4 text-xs">
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
                className="mt-2 rounded-full border border-slate-200 px-4 py-2 text-center shadow-sm"
              >
                Login
              </button>
            ) : (
              <div className="mt-3 border-t pt-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  Account
                </p>
                <Link to="/account" className="block py-1">
                  Account
                </Link>
                <Link to="/orders" className="block py-1">
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
                  className="mt-2 rounded-full border border-slate-200 px-4 py-2 text-center text-red-500 shadow-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={loginOpen} onClose={handleCloseLogin} maxWidth="max-w-sm">
        <OtpLogin onClose={handleCloseLogin} />
      </Modal>
    </header>
  );
}

export default Navbar;
