import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { MapPin, Plus } from "lucide-react";

const api = import.meta.env.VITE_BACKEND_API;

function AddressPage() {
  const { token, user } = useAuth();
  const userId = user?.user_id;

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    pinCode: "",
    state: "",
    city: "",
    houseNo: "",
    roadName: "",
  });

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const fetchAddresses = async () => {
    if (!token || !userId) {
      setError("User not logged in or user details missing");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `${api}/api/address/user/${userId}`,
        axiosConfig
      );
      setAddresses(res.data.data || res.data);
    } catch (err) {
      setError("Unable to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId) fetchAddresses();
  }, [token, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      pinCode: "",
      state: "",
      city: "",
      houseNo: "",
      roadName: "",
    });
    setIsEditing(false);
    setEditingId(null);
    setFormError("");
  };

  const handleEdit = (addr) => {
    setIsEditing(true);
    setEditingId(addr._id);
    setFormData({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      pinCode: addr.pinCode || "",
      state: addr.state || "",
      city: addr.city || "",
      houseNo: addr.houseNo || "",
      roadName: addr.roadName || "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this address?")) return;
    try {
      setSaving(true);
      await axios.delete(`${api}/api/address/item/${id}`, axiosConfig);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert("Failed to delete address");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.pinCode ||
      !formData.state ||
      !formData.city ||
      !formData.houseNo ||
      !formData.roadName
    ) {
      setFormError("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        ...formData,
        user_id: userId,
      };

      const url = isEditing
        ? `${api}/api/address/item/${editingId}`
        : `${api}/api/address/add`;

      const method = isEditing ? axios.put : axios.post;

      await method(url, payload, axiosConfig);
      await fetchAddresses();
      resetForm();
    } catch (err) {
      setFormError("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
              Account
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Manage Addresses</span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200/80">
                <MapPin className="h-3 w-3" />
                Delivery locations
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Save your delivery locations for a faster checkout experience.
            </p>
          </div>
          <button
            onClick={resetForm}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-medium hover:bg-black shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs md:text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-7">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900">
                  Saved Addresses
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select or edit your existing delivery locations
                </p>
              </div>
              <button
                onClick={resetForm}
                className="md:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-medium"
              >
                <Plus className="h-3 w-3" />
                Add New
              </button>
            </div>

            {loading ? (
              <p className="text-xs md:text-sm text-slate-500">
                Loading addresses...
              </p>
            ) : addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 flex items-center justify-center mb-3 bg-slate-50">
                  <MapPin className="h-5 w-5 text-slate-500" />
                </div>
                <p className="text-sm text-slate-700 mb-1">
                  You haven&apos;t added any address yet.
                </p>
                <p className="text-[11px] text-slate-500">
                  Add a delivery address to speed up checkout.
                </p>
                <button
                  onClick={resetForm}
                  className="mt-3 px-4 py-1.5 text-[11px] rounded-full border border-slate-300 hover:border-slate-900 hover:text-slate-900 transition bg-white"
                >
                  Add your first address
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {addresses.map((addr, index) => (
                  <div
                    key={addr._id}
                    className="border border-slate-100 rounded-xl px-4 py-3 hover:border-slate-900/50 hover:shadow-sm transition flex justify-between gap-4 bg-white"
                  >
                    <div className="space-y-1 text-xs md:text-sm">
                      <div className="flex items-center flex-wrap gap-2">
                        <p className="font-semibold text-slate-900">
                          {addr.fullName}
                        </p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-[0.12em]">
                          {index === 0 ? "Default" : "Saved"}
                        </span>
                      </div>
                      <p className="text-slate-700">
                        {addr.houseNo}, {addr.roadName}
                      </p>
                      <p className="text-slate-700">
                        {addr.city}, {addr.state} - {addr.pinCode}
                      </p>
                      <p className="text-slate-500">
                        Phone:{" "}
                        <span className="font-medium">{addr.phone}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-[11px] min-w-[92px]">
                      <button
                        onClick={() => handleEdit(addr)}
                        className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(addr._id)}
                        disabled={saving}
                        className="px-3 py-1 rounded-full border border-red-200 text-red-500 hover:border-red-500 hover:bg-red-50 transition disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900">
                  {isEditing ? "Edit Address" : "Add New Address"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  All fields are required for delivery.
                </p>
              </div>
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="text-[11px] text-slate-500 hover:text-slate-900 underline underline-offset-4"
                >
                  Clear
                </button>
              )}
            </div>

            {formError && (
              <p className="mb-3 text-[11px] md:text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Full Name<span className="text-red-500"> *</span>
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Eg: John Doe"
                    className="w-full border border-slate-200 focus:border-slate-900 rounded-lg px-3 py-2 outline-none text-sm bg-slate-50 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Mobile Number<span className="text-red-500"> *</span>
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10 digit mobile number"
                    className="w-full border border-slate-200 focus:border-slate-900 rounded-lg px-3 py-2 outline-none text-sm bg-slate-50 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Pincode<span className="text-red-500"> *</span>
                  </label>
                  <input
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="Eg: 682024"
                    className="w-full border border-slate-200 focus:border-slate-900 rounded-lg px-3 py-2 outline-none text-sm bg-slate-50 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    State<span className="text-red-500"> *</span>
                  </label>
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Kerala"
                    className="w-full border border-slate-200 focus:border-slate-900 rounded-lg px-3 py-2 outline-none text-sm bg-slate-50 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    City<span className="text-red-500"> *</span>
                  </label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ernakulam"
                    className="w-full border border-slate-200 focus:border-slate-900 rounded-lg px-3 py-2 outline-none text-sm bg-slate-50 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  House / Flat No<span className="text-red-500"> *</span>
                </label>
                <input
                  name="houseNo"
                  value={formData.houseNo}
                  onChange={handleChange}
                  placeholder="House / Flat / Building"
                  className="w-full border border-slate-200 focus:border-slate-900 rounded-lg px-3 py-2 outline-none text-sm bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Road / Area / Street<span className="text-red-500"> *</span>
                </label>
                <input
                  name="roadName"
                  value={formData.roadName}
                  onChange={handleChange}
                  placeholder="Road name, area, landmark"
                  className="w-full border border-slate-200 focus:border-slate-900 rounded-lg px-3 py-2 outline-none text-sm bg-slate-50 focus:bg-white transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium tracking-wide hover:bg-black disabled:opacity-70 transition shadow-sm"
                >
                  {saving
                    ? "Saving..."
                    : isEditing
                    ? "Update Address"
                    : "Save Address"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-full border border-slate-300 text-[11px] font-medium hover:border-slate-900 hover:text-slate-900 transition bg-white"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressPage;
