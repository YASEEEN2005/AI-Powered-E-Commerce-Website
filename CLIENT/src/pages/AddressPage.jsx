import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Manage Addresses
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Save your delivery locations for faster checkout
            </p>
          </div>
          <button
            onClick={resetForm}
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition"
          >
            + Add New Address
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Saved Addresses</h3>
              <button
                onClick={resetForm}
                className="md:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium"
              >
                + Add New
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-gray-500">Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full border border-dashed border-gray-300 flex items-center justify-center mb-3">
                  <span className="text-xl">📍</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  You haven&apos;t added any address yet.
                </p>
                <button
                  onClick={resetForm}
                  className="mt-2 px-4 py-1.5 text-xs rounded-full border border-gray-300 hover:border-black hover:text-black transition"
                >
                  Add your first address
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="border border-gray-100 rounded-xl px-4 py-3 hover:border-black hover:shadow-sm transition flex justify-between gap-4"
                  >
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {addr.fullName}
                        </p>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide">
                          Home
                        </span>
                      </div>
                      <p className="text-gray-700">
                        {addr.houseNo}, {addr.roadName}
                      </p>
                      <p className="text-gray-700">
                        {addr.city}, {addr.state} - {addr.pinCode}
                      </p>
                      <p className="text-gray-500">
                        Phone: <span className="font-medium">{addr.phone}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-xs min-w-[84px]">
                      <button
                        onClick={() => handleEdit(addr)}
                        className="px-3 py-1 rounded-full border border-gray-300 hover:border-black hover:text-black transition"
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                {isEditing ? "Edit Address" : "Add New Address"}
              </h3>
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="text-xs text-gray-500 hover:text-black underline underline-offset-4"
                >
                  Clear
                </button>
              )}
            </div>

            {formError && (
              <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Full Name<span className="text-red-500"> *</span>
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Eg: Muhammad Yaseen"
                    className="w-full border border-gray-200 focus:border-black rounded-lg px-3 py-2 outline-none text-sm bg-gray-50 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Mobile Number<span className="text-red-500"> *</span>
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10 digit mobile number"
                    className="w-full border border-gray-200 focus:border-black rounded-lg px-3 py-2 outline-none text-sm bg-gray-50 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Pincode<span className="text-red-500"> *</span>
                  </label>
                  <input
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="Eg: 682024"
                    className="w-full border border-gray-200 focus:border-black rounded-lg px-3 py-2 outline-none text-sm bg-gray-50 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    State<span className="text-red-500"> *</span>
                  </label>
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Kerala"
                    className="w-full border border-gray-200 focus:border-black rounded-lg px-3 py-2 outline-none text-sm bg-gray-50 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    City<span className="text-red-500"> *</span>
                  </label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ernakulam"
                    className="w-full border border-gray-200 focus:border-black rounded-lg px-3 py-2 outline-none text-sm bg-gray-50 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  House / Flat No<span className="text-red-500"> *</span>
                </label>
                <input
                  name="houseNo"
                  value={formData.houseNo}
                  onChange={handleChange}
                  placeholder="House / Flat / Building"
                  className="w-full border border-gray-200 focus:border-black rounded-lg px-3 py-2 outline-none text-sm bg-gray-50 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Road / Area / Street<span className="text-red-500"> *</span>
                </label>
                <input
                  name="roadName"
                  value={formData.roadName}
                  onChange={handleChange}
                  placeholder="Road name, area, landmark"
                  className="w-full border border-gray-200 focus:border-black rounded-lg px-3 py-2 outline-none text-sm bg-gray-50 focus:bg-white transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-black text-white text-sm font-medium tracking-wide hover:bg-gray-900 disabled:opacity-70 transition"
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
                    className="px-4 py-2 rounded-full border border-gray-300 text-xs font-medium hover:border-black hover:text-black transition"
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
