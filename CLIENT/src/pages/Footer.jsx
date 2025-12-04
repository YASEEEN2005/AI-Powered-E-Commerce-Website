import React from "react";
import { Mail, ArrowRight } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-[#e3efef] pt-16 pb-10 mt-20">
      <div className="mx-auto max-w-[1400px] px-6 grid gap-12 md:grid-cols-4">

        <div>
          <h3 className="font-semibold text-lg text-slate-900 mb-4">
            Contact Info
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed">
            wayanad Kerala
             <br />
            India
          </p>

          <p className="mt-4 text-sm">
            <span className="font-semibold">Email:</span>{" "}
            info@.swiftcartcom
          </p>

          <p className="mt-2 text-sm">
            <span className="font-semibold">Phone:</span>{" "}
            9999999999
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-slate-900 mb-4">Our Store</h3>

          <ul className="text-slate-700 text-sm space-y-2">
            <li>--</li>
            <li>--</li>
            <li>--</li>
            <li>--</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-slate-900 mb-4">
            Useful Links
          </h3>

          <ul className="text-slate-700 text-sm space-y-2">
            <li>Login</li>
            <li>My Account</li>
            <li>Wishlist</li>
            <li>Checkout</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-slate-900 mb-4">
            Sign Up for Email
          </h3>

          <p className="text-sm text-slate-700 mb-4">
            Subscribe to our newsletter to receive news and updates.
          </p>

          <div className="flex items-center rounded-lg overflow-hidden bg-white shadow-sm w-full">
            <div className="px-3 text-slate-500">
              <Mail className="h-5 w-5" />
            </div>

            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 py-2 px-2 text-sm outline-none"
            />

            <button className="bg-black text-white px-4 py-2 text-sm font-semibold uppercase hover:bg-slate-900">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-300 mt-12 pt-6 text-center text-sm text-slate-600">
        © 2025, SwiftCart
      </div>
    </footer>
  );
}

export default Footer;
