import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home, ShoppingBag } from "lucide-react";

function NotFoundPage() {
  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
          </div>

          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-2">
            404 Error
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
            Page not found
          </h1>

          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            The page you’re looking for doesn’t exist or may have been moved.
            Let’s get you back to shopping.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-800 transition"
            >
              <Home className="h-4 w-4" />
              Go to home
            </Link>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-900 px-5 py-2.5 text-sm font-medium hover:bg-slate-50 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse products
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-4">
          © {new Date().getFullYear()} SwiftCart — Built for modern online
          shopping
        </p>
      </div>
    </div>
  );
}

export default NotFoundPage;
