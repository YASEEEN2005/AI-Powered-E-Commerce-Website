import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function EditProfileModal({ isOpen, onClose, profile, onUpdate }) {
  const { token, user } = useAuth();

  const [form, setForm] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    pinCode: profile?.pinCode || ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.pinCode) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.put(
        `http://localhost:5000/api/users/${user.user_id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Profile updated successfully");
      onUpdate(res.data.data);
      onClose();
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Edit Profile</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-slate-600 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Phone Number</label>
            <input
              value={profile.phone}
              disabled
              className="w-full border border-slate-200 bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-red-500 mt-1">
              Phone number cannot be edited.
            </p>
          </div>

          <div>
            <label className="block text-slate-600 mb-1">Pincode</label>
            <input
              type="number"
              name="pinCode"
              value={form.pinCode}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-full border border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-1.5 text-sm rounded-full bg-black text-white hover:bg-slate-900 disabled:bg-slate-400"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
