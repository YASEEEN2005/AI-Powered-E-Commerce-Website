import React from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#e3efef] pt-12 pb-8 mt-12">
      <div className="mx-auto max-w-[1400px] px-6 grid gap-10 md:grid-cols-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">
            SwiftCart
          </h2>
          <p className="text-xs text-slate-600 mb-4">
            Your smart shopping companion for fashion, electronics & more.
          </p>

          <h3 className="font-semibold text-sm text-slate-900 mb-2">
            Contact Info
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed">
            Wayanad, Kerala <br />
            India
          </p>

          <p className="mt-3 text-sm text-slate-700">
            <span className="font-semibold">Email:</span> info@swiftcart.com
          </p>

          <p className="mt-1 text-sm text-slate-700">
            <span className="font-semibold">Phone:</span> +91 99999 99999
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-slate-900 mb-4">
            Our Store
          </h3>

          <ul className="text-slate-700 text-sm space-y-2">
            <li className="hover:text-slate-900 transition">
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-slate-600">
                Online Only
              </span>
            </li>
            <li className="hover:text-slate-900 transition">Secure Payments</li>
            <li className="hover:text-slate-900 transition">
              Fast & Reliable Delivery
            </li>
            <li className="hover:text-slate-900 transition">
              24/7 Support (Email)
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-slate-900 mb-4">
            Useful Links
          </h3>

          <ul className="text-slate-700 text-sm space-y-2">
            <li>
              <Link
                to="/login"
                className="hover:text-slate-900 hover:underline underline-offset-4 transition"
              >
                Seller Login
              </Link>
            </li>
            <li>
              <Link
                to="/account"
                className="hover:text-slate-900 hover:underline underline-offset-4 transition"
              >
                My Account
              </Link>
            </li>
            <li>
              <Link
                to="/wishlist"
                className="hover:text-slate-900 hover:underline underline-offset-4 transition"
              >
                Wishlist
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                className="hover:text-slate-900 hover:underline underline-offset-4 transition"
              >
                Checkout
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-slate-900 mb-4">
            Sign Up for Email
          </h3>

          <p className="text-sm text-slate-700 mb-4">
            Subscribe to receive updates on new arrivals, offers and
            personalized picks.
          </p>

          <div className="flex items-center rounded-lg overflow-hidden bg-white shadow-sm w-full">
            <div className="px-3 text-slate-500 flex items-center">
              <Mail className="h-5 w-5" />
            </div>

            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 py-2 px-2 text-sm outline-none text-slate-800 placeholder:text-slate-400"
            />

            <button className="flex items-center gap-1 bg-black text-white px-1 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-slate-900">
              Subscribe
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 text-[11px] text-slate-600">
            By subscribing, you agree to receive marketing emails from
            SwiftCart.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-300 mt-10 pt-5 text-center text-xs md:text-sm text-slate-600">
        <p>© 2025 SwiftCart. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
