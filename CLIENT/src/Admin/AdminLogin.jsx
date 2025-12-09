import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_BACKEND_API; 

function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${api}/api/admin/login`, {
        email: form.email,
        password: form.password,
      });

      if (!res.data?.success) {
        toast.error(res.data?.message || "Invalid email or password");
        return;
      }

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminInfo", JSON.stringify(res.data.data));

      toast.success("Admin login successful");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-7">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Admin Panel
          </p>
          <div className="flex items-center justify-between mt-1">
            <h1 className="text-lg font-semibold text-slate-900">
              SwiftCart Admin Login
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-500 border border-red-200">
              ADMIN ONLY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to manage users, sellers and orders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-600 mb-1 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
              placeholder="admin@swiftcart.com"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 mb-1 block">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg py-2.5 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
