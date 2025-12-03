import React, { useState } from "react";
import {
  ChevronDown,
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <header className="w-full bg-white">
      <div className="mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between">


        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight">
            Swift<span className="font-light">Cart</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-800 md:flex">

          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-black">
              <span>Home</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            <div className="invisible absolute left-0 mt-3 w-44 rounded-xl border border-slate-100 bg-white opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all group-hover:visible group-hover:opacity-100">
              <Link to="/" className="block px-4 py-2 text-sm hover:bg-slate-50">
                Default Home
              </Link>
              <Link to="/minimal-home" className="block px-4 py-2 text-sm hover:bg-slate-50">
                Minimal Home
              </Link>
            </div>
          </div>

          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-black">
              <span>Shop</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            <div className="invisible absolute left-0 mt-3 w-44 rounded-xl border border-slate-100 bg-white opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all group-hover:visible group-hover:opacity-100">
              <Link to="/products" className="block px-4 py-2 text-sm hover:bg-slate-50">
                All Products
              </Link>
              <Link to="/new-arrivals" className="block px-4 py-2 text-sm hover:bg-slate-50">
                New Arrivals
              </Link>
              <Link to="/best-sellers" className="block px-4 py-2 text-sm hover:bg-slate-50">
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

            <div className="invisible absolute left-0 mt-3 w-44 rounded-xl border border-slate-100 bg-white opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all group-hover:visible group-hover:opacity-100">
              <Link to="/about" className="block px-4 py-2 text-sm hover:bg-slate-50">
                About Us
              </Link>
              <Link to="/faq" className="block px-4 py-2 text-sm hover:bg-slate-50">
                FAQ
              </Link>
              <Link to="/policy" className="block px-4 py-2 text-sm hover:bg-slate-50">
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

          <Link to="/wishlist" className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
            <Heart className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
              0
            </span>
          </Link>

          <Link to="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
              0
            </span>
          </Link>

          <Link
            to="/login"
            className="hidden rounded-full border border-slate-200 ml-2 px-6 py-1.5 text-sm font-medium text-slate-900 shadow-sm hover:border-slate-300 hover:bg-slate-50 md:inline-flex"
          >
            Login
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 md:hidden"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-white md:hidden">
          <div className="flex flex-col px-4 py-3 text-sm">

            <button
              className="flex w-full items-center justify-between py-2"
              onClick={() => toggleDropdown("home")}
            >
              Home
              <ChevronDown
                className={`h-4 w-4 transition ${openDropdown === "home" ? "rotate-180" : ""}`}
              />
            </button>

            {openDropdown === "home" && (
              <div className="pl-4 text-xs">
                <Link to="/" className="block py-1">Default Home</Link>
                <Link to="/minimal-home" className="block py-1">Minimal Home</Link>
              </div>
            )}

            <button
              className="flex w-full items-center justify-between py-2"
              onClick={() => toggleDropdown("shop")}
            >
              Shop
              <ChevronDown
                className={`h-4 w-4 transition ${openDropdown === "shop" ? "rotate-180" : ""}`}
              />
            </button>

            {openDropdown === "shop" && (
              <div className="pl-4 text-xs">
                <Link to="/products" className="block py-1">All Products</Link>
                <Link to="/new-arrivals" className="block py-1">New Arrivals</Link>
                <Link to="/best-sellers" className="block py-1">Best Sellers</Link>
              </div>
            )}

            <Link to="/recommended" className="py-2">
              Made for You
            </Link>

            <button
              className="flex w-full items-center justify-between py-2"
              onClick={() => toggleDropdown("pages")}
            >
              Pages
              <ChevronDown
                className={`h-4 w-4 transition ${openDropdown === "pages" ? "rotate-180" : ""}`}
              />
            </button>

            {openDropdown === "pages" && (
              <div className="pl-4 text-xs">
                <Link to="/about" className="block py-1">About Us</Link>
                <Link to="/faq" className="block py-1">FAQ</Link>
                <Link to="/policy" className="block py-1">Terms & Policy</Link>
              </div>
            )}

            <Link to="/contact" className="py-2">
              Contact
            </Link>

            <Link
              to="/login"
              className="mt-2 rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-medium shadow-sm hover:border-slate-300 hover:bg-slate-50"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
