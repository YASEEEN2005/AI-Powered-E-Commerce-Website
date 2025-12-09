import React, { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { auth } from "../auth/firebase";
import { useAuth } from "../context/AuthContext";

export default function OtpLogin({ onClose }) {
  const [step, setStep] = useState("send");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmation, setConfirmation] = useState(null);
  const [timer, setTimer] = useState(0);
  const [userPhone, setUserPhone] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);
  const api = import.meta.env.VITE_BACKEND_API;

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    pinCode: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal", 
          callback: (response) => {
          },
          "expired-callback": () => {
            toast.error("reCAPTCHA expired, please verify again.");
          },
        }
      );
    }
    return window.recaptchaVerifier;
  };

  const startTimer = () => {
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    if (!phone || phone.length !== 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    setIsSending(true);

    try {
      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(
        auth,
        "+91" + phone,
        appVerifier
      );
      setConfirmation(result);
      setStep("verify");
      startTimer();
      toast.success(`OTP sent to +91 ${phone}`);
    } catch (err) {
      console.error("OTP Error:", err);
      toast.error(err.message || "Failed to send OTP");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const checkExistingUser = async (phoneNumber) => {
    try {
      const res = await axios.get(`${api}/api/users/by-phone/${phoneNumber}`);

      const existingUser =
        res.data?.data || res.data?.user || res.data?.userData || null;

      const token =
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.data?.token ||
        null;

      if (existingUser && token) {
        login(existingUser, token);
        toast.success("Welcome back 👋");

        if (onClose) onClose();
        navigate("/");
        return true;
      }
    } catch (err) {
      console.log("No existing user found for phone:", phoneNumber);
    }
    return false;
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Enter full 6-digit OTP");
      return;
    }

    if (!confirmation) {
      toast.error("OTP session expired, please resend");
      return;
    }

    setIsVerifying(true);
    try {
      const data = await confirmation.confirm(code);
      const firebasePhone = data.user.phoneNumber || "";
      const finalPhone = phone || firebasePhone.replace("+91", "");

      setUserPhone(firebasePhone);

      setUserForm((prev) => ({
        ...prev,
        phone: finalPhone,
      }));

      toast.success("OTP verified");

      const existed = await checkExistingUser(finalPhone);

      if (!existed) {
        setStep("details");
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      toast.error("Invalid OTP ❌");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitUserDetails = async (e) => {
    e.preventDefault();

    if (
      !userForm.name ||
      !userForm.email ||
      !userForm.phone ||
      !userForm.pinCode
    ) {
      toast.error("All fields are required");
      return;
    }

    setIsSubmittingDetails(true);

    try {
      const userPayload = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        phone: Number(userForm.phone),
        pinCode: Number(userForm.pinCode),
      };

      const userRes = await axios.post(`${api}/api/users`, userPayload);

      const createdUser =
        userRes.data?.data || userRes.data?.user || userRes.data;
      const userId =
        createdUser?.user_id ?? createdUser?.id ?? createdUser?._id;

      if (!userId) {
        throw new Error("User ID not found from API response");
      }

      const sessionRes = await axios.post(`${api}/api/users/session`, {
        user_id: userId,
      });

      const token =
        sessionRes.data?.token ||
        sessionRes.data?.data?.token ||
        sessionRes.data?.accessToken;

      if (!token) {
        throw new Error("Token not found in session response");
      }

      login(createdUser, token);

      toast.success("Profile saved and logged in");
      setStep("success");

      setTimeout(() => {
        if (onClose) onClose();
        navigate("/");
      }, 800);
    } catch (err) {
      console.error("User details submit error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to save user details"
      );
    } finally {
      setIsSubmittingDetails(false);
    }
  };

  return (
    <div>
      {step === "send" && (
        <div className="mb-4">
          <div className="mb-5 flex flex-col items-center">
            <span className="text-xl font-black tracking-tight text-slate-900">
              Swift<span className="font-light">Cart</span>
            </span>
            <p className="mt-1 text-xs text-slate-500">
              Secure OTP login for your account
            </p>
          </div>

          <div className="mb-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span className="h-1.5 w-6 rounded-full bg-slate-900" />
            <span className="h-1.5 w-6 rounded-full bg-slate-300" />
            <span className="h-1.5 w-6 rounded-full bg-slate-300" />
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Enter your mobile number to receive a one-time password.
          </p>

          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Phone Number
          </label>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              +91
            </span>
            <input
              type="text"
              placeholder="Enter 10 digit number"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="mb-3 flex justify-center">
            <div id="recaptcha-container" />
          </div>
          <p className="mb-4 text-[10px] text-slate-400 text-center leading-snug">
            This site is protected by reCAPTCHA and the Google{" "}
            <span className="underline">Privacy Policy</span> and{" "}
            <span className="underline">Terms of Service</span> apply.
          </p>

          <button
            onClick={sendOtp}
            disabled={isSending}
            className="w-full rounded-full bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isSending ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      )}

      {step === "verify" && (
        <>
          <div className="flex flex-col items-center mb-4">
            <span className="text-xl font-black tracking-tight text-slate-900">
              Swift<span className="font-light">Cart</span>
            </span>
            <p className="mt-1 text-xs text-slate-500">
              Verify your OTP to continue
            </p>
          </div>

          <div className="mb-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span className="h-1.5 w-6 rounded-full bg-slate-900" />
            <span className="h-1.5 w-6 rounded-full bg-slate-900" />
            <span className="h-1.5 w-6 rounded-full bg-slate-300" />
          </div>

          <p className="text-xs text-slate-600 mb-3 text-center">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold">+91 {phone}</span>
          </p>

          <div className="flex justify-between mb-5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                id={`otp-${i}`}
                maxLength={1}
                type="text"
                className="h-11 w-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-lg outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-300"
                value={otp[i]}
                onChange={(e) => handleOtpChange(e.target.value, i)}
              />
            ))}
          </div>

          <button
            onClick={verifyOtp}
            disabled={isVerifying}
            className="w-full rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center mt-4 text-xs text-slate-600">
            {timer === 0 ? (
              <button
                onClick={sendOtp}
                className="font-semibold text-slate-900 hover:underline"
              >
                Resend OTP
              </button>
            ) : (
              <span>Resend OTP in {timer}s</span>
            )}
          </div>
        </>
      )}

      {step === "details" && (
        <form onSubmit={submitUserDetails} className="space-y-3">
          <div className="flex flex-col items-center mb-3">
            <span className="text-xl font-black tracking-tight text-slate-900">
              Swift<span className="font-light">Cart</span>
            </span>
            <p className="mt-1 text-xs text-slate-500">
              Complete your profile to continue
            </p>
          </div>

          <div className="mb-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            <span className="h-1.5 w-6 rounded-full bg-slate-900" />
            <span className="h-1.5 w-6 rounded-full bg-slate-900" />
            <span className="h-1.5 w-6 rounded-full bg-slate-900" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Name</label>
            <input
              type="text"
              name="name"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              placeholder="Your full name"
              value={userForm.name}
              onChange={handleDetailsChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              placeholder="you@example.com"
              value={userForm.email}
              onChange={handleDetailsChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Phone</label>
            <input
              type="text"
              name="phone"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              value={userForm.phone}
              onChange={handleDetailsChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Pin Code
            </label>
            <input
              type="text"
              name="pinCode"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              placeholder="e.g. 673002"
              value={userForm.pinCode}
              onChange={handleDetailsChange}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingDetails}
            className="mt-2 w-full rounded-full bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isSubmittingDetails ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      )}

      {step === "success" && (
        <div className="text-center py-4">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            ✅
          </div>
          <h2 className="text-sm font-semibold text-emerald-700 mb-1">
            Login Complete
          </h2>
          <p className="text-xs text-slate-600">
            You are now logged in and your profile is saved.
          </p>
        </div>
      )}
    </div>
  );
}
