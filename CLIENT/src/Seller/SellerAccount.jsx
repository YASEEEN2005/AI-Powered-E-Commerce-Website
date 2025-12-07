import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Store,
  Phone,
  Mail,
  MapPin,
  Banknote,
  BadgeCheck,
  Clock,
  Loader2,
  Edit3,
  X,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_BACKEND_API;

function SellerAccount() {
  const { seller, sellerToken } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    shop_name: "",
    location: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
  });

  useEffect(() => {
    if (!seller?.seller_id || !sellerToken) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${api}/api/seller/${seller.seller_id}`,
          {
            headers: { Authorization: `Bearer ${sellerToken}` },
          }
        );
        const data = res.data?.data || null;
        setProfile(data);

        const base = data || seller || {};
        setForm({
          name: base.name || "",
          phone: base.phone || "",
          email: base.email || "",
          shop_name: base.shop_name || "",
          location: base.location || "",
          bank_name: base.bank_name || "",
          account_number: base.account_number || "",
          ifsc_code: base.ifsc_code || "",
        });
      } catch (err) {
        console.error("Error loading seller profile:", err);
        toast.error("Failed to load account details.");
        if (seller) {
          setProfile(seller);
          setForm({
            name: seller.name || "",
            phone: seller.phone || "",
            email: seller.email || "",
            shop_name: seller.shop_name || "",
            location: seller.location || "",
            bank_name: seller.bank_name || "",
            account_number: seller.account_number || "",
            ifsc_code: seller.ifsc_code || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [seller?.seller_id, sellerToken]);

  const data = profile || seller || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const maskAccountNumber = (acc) => {
    if (!acc) return "-";
    const str = String(acc);
    if (str.length <= 4) return str;
    return "•••• •••• " + str.slice(-4);
  };

  const getStatusBadge = (statusRaw) => {
    const status = (statusRaw || "pending").toLowerCase();
    let base =
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide border ";

    if (status === "approved" || status === "active") {
      return (
        <span
          className={
            base + "bg-emerald-50 text-emerald-700 border-emerald-100"
          }
        >
          <ShieldCheck className="h-3 w-3" />
          {status}
        </span>
      );
    }
    if (status === "pending") {
      return (
        <span
          className={
            base + "bg-amber-50 text-amber-700 border-amber-100"
          }
        >
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    }
    if (status === "rejected" || status === "blocked") {
      return (
        <span
          className={
            base + "bg-rose-50 text-rose-700 border-rose-100"
          }
        >
          <X className="h-3 w-3" />
          {status}
        </span>
      );
    }
    return (
      <span
        className={
          base + "bg-slate-100 text-slate-700 border-slate-200"
        }
      >
        {status}
      </span>
    );
  };

  const memberSince = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  const handleToggleEdit = () => {
    if (editMode) {

      const base = profile || seller || {};
      setForm({
        name: base.name || "",
        phone: base.phone || "",
        email: base.email || "",
        shop_name: base.shop_name || "",
        location: base.location || "",
        bank_name: base.bank_name || "",
        account_number: base.account_number || "",
        ifsc_code: base.ifsc_code || "",
      });
    }
    setEditMode((prev) => !prev);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!seller?.seller_id) {
      toast.error("Seller info missing.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        seller_id: seller.seller_id,
        name: form.name,
        phone: form.phone,
        email: form.email,
        shop_name: form.shop_name,
        location: form.location,
        bank_name: form.bank_name,
        account_number: form.account_number,
        ifsc_code: form.ifsc_code,
      };

      const res = await axios.post(`${api}/api/seller/profile`, payload, {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });

      const updated = res.data?.data || payload;
      setProfile(updated);
      toast.success("Account details updated.");
      setEditMode(false);
    } catch (err) {
      console.error("Error saving seller profile:", err);
      toast.error("Failed to update account details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-1/3 bg-slate-200 rounded-lg" />
            <div className="h-28 w-full bg-slate-200 rounded-2xl" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-52 bg-slate-200 rounded-2xl" />
              <div className="h-52 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials =
    (data.shop_name || data.name || "S")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Account
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Account & Profile</span>
              <BadgeCheck className="h-5 w-5 text-indigo-600" />
            </h1>
            <p className="mt-2 text-sm md:text-[15px] text-slate-600 max-w-xl">
              Manage your seller profile, contact details and payout bank
              information. Keep everything up to date for smooth order
              processing and payments.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleEdit}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            {editMode ? (
              <>
                <X className="h-3.5 w-3.5" />
                Cancel
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xl font-semibold shadow-sm">
                {initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-1.5">
                    <Store className="h-4 w-4 text-indigo-600" />
                    <span>{data.shop_name || "Your Store"}</span>
                  </h2>
                  {getStatusBadge(data.status)}
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Seller ID:{" "}
                  <span className="font-medium text-slate-800">
                    {data.seller_id || "-"}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  Member since {memberSince}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-[11px]">
              {data.location && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>{data.location}</span>
                </div>
              )}
              {data.phone && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>{data.phone}</span>
                </div>
              )}
              {data.email && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span className="truncate max-w-[180px]">
                    {data.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="grid gap-5 md:grid-cols-2 items-start"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Profile details
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Basic information about you and your store.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Owner name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full rounded-lg border px-3 py-2 text-[12px] outline-none ${
                    editMode
                      ? "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      : "border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Shop name
                </label>
                <input
                  type="text"
                  name="shop_name"
                  value={form.shop_name}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full rounded-lg border px-3 py-2 text-[12px] outline-none ${
                    editMode
                      ? "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      : "border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                  placeholder="Store / brand name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full rounded-lg border px-3 py-2 text-[12px] outline-none ${
                      editMode
                        ? "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        : "border-slate-100 bg-slate-50 text-slate-700"
                    }`}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full rounded-lg border px-3 py-2 text-[12px] outline-none ${
                      editMode
                        ? "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        : "border-slate-100 bg-slate-50 text-slate-700"
                    }`}
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full rounded-lg border px-3 py-2 text-[12px] outline-none ${
                    editMode
                      ? "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      : "border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                  placeholder="City / district"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center">
                  <Banknote className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Payout / Bank details
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Used to settle your order payments securely.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Bank name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={form.bank_name}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full rounded-lg border px-3 py-2 text-[12px] outline-none ${
                    editMode
                      ? "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      : "border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                  placeholder="Bank name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Account number
                </label>
                <input
                  type="text"
                  name="account_number"
                  value={editMode ? form.account_number : maskAccountNumber(form.account_number)}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full rounded-lg border px-3 py-2 text-[12px] outline-none ${
                    editMode
                      ? "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      : "border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                  placeholder="Bank account number"
                />
                {!editMode && form.account_number && (
                  <p className="mt-1 text-[10px] text-slate-400">
                    Only last 4 digits are shown for security.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  IFSC code
                </label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={form.ifsc_code}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full rounded-lg border px-3 py-2 text-[12px] outline-none uppercase ${
                    editMode
                      ? "border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      : "border-slate-100 bg-slate-50 text-slate-700"
                  }`}
                  placeholder="IFSC"
                />
              </div>

              <div className="mt-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 flex items-start gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 mt-0.5" />
                <p className="text-[10px] text-slate-500">
                  Your payout information is encrypted and only used to process
                  settlements for completed orders.
                </p>
              </div>
            </div>
          </div>

          {editMode && (
            <div className="md:col-span-2 flex justify-end pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-black disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <Edit3 className="h-3.5 w-3.5" />
                    Save changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default SellerAccount;
