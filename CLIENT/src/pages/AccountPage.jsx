import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Loader2,
  Home,
} from "lucide-react";
import { toast } from "react-toastify";
import EditProfileModal from "../componets/EditProfileModal";

function AccountPage() {
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const api = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    if (!isAuthenticated || !user?.user_id) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${api}/api/users/${user.user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(res.data.data);
      } catch (err) {
        toast.error("Failed to load account details");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isAuthenticated, user, token]);

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <p className="text-sm text-slate-700 mb-2">
            Please sign in to view your account.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-full bg-black text-white px-5 py-2 text-xs font-semibold shadow-sm hover:bg-slate-900"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
          <p className="text-sm text-slate-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <p className="text-sm text-slate-700 mb-2">
            We could not load your account details.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-full bg-black text-white px-5 py-2 text-xs font-semibold shadow-sm hover:bg-slate-900"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase mb-1">
            My Account
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hello, {profile.name}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your profile, contact details, and addresses.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Profile details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Basic information linked to your SwiftCart account.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 text-xs text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-500">Name</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {profile.name}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-500">Email</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {profile.email}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-500">Phone</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {profile.phone}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-500">Default Pincode</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {profile.pinCode}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setEditOpen(true)}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                >
                  Edit profile
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Login & security
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your account is protected with secure OTP-based login.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-700 mb-2">
                SwiftCart uses secure authentication to keep your account safe.
                Never share your OTP or login link with anyone.
              </p>

              <ul className="text-[11px] text-slate-600 list-disc pl-4 space-y-1">
                <li>We do not store your password on this platform.</li>
                <li>Login sessions are limited and can be revoked anytime.</li>
                <li>Use your own device and network for best security.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Saved addresses
                  </h2>
                  <p className="text-xs text-slate-500">
                    Quickly select where your orders should be delivered.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-xs text-slate-600">
                <p className="font-medium text-slate-800 mb-1">
                  Address management coming soon
                </p>
                <p>
                  You will be able to add, edit and select multiple delivery
                  addresses here. For now, orders will use your pincode{" "}
                  <span className="font-semibold">{profile.pinCode}</span> as
                  the default delivery region.
                </p>
              </div>

              <button
                disabled
                className="mt-3 w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm cursor-not-allowed"
              >
                Add new address (coming soon)
              </button>
            </div>

            <div className="rounded-2xl bg-slate-900 text-white p-5 sm:p-6">
              <h2 className="text-sm font-semibold mb-1">
                Quick tips for your account
              </h2>
              <p className="text-[11px] text-slate-200 mb-2">
                Keep your details up to date so we can deliver smoothly and
                contact you about your orders.
              </p>
              <ul className="text-[11px] text-slate-100 list-disc pl-4 space-y-1">
                <li>Use a valid mobile number and email for OTP and alerts.</li>
                <li>Update your pincode if you move to a new location.</li>
                <li>
                  Review your orders and payments regularly in the Orders and
                  Payments sections.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onUpdate={(updated) => setProfile(updated)}
      />
    </div>
  );
}

export default AccountPage;
