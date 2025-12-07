import React, { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { auth } from "../auth/firebase";
import Modal from "../componets/Modal";

const api = import.meta.env.VITE_BACKEND_API;

export default function SellerOtpLogin({ isOpen = true, onClose }) {
  const [step, setStep] = useState("send");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmation, setConfirmation] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);

  const [sellerForm, setSellerForm] = useState({
    name: "",
    email: "",
    shop_name: "",
    location: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
  });

  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!window.sellerRecaptchaVerifier) {
      window.sellerRecaptchaVerifier = new RecaptchaVerifier(
        auth,
        "seller-recaptcha-container",
        { size: "invisible" }
      );
    }
    return window.sellerRecaptchaVerifier;
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
    const appVerifier = setupRecaptcha();

    try {
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
      console.error("Seller OTP Error:", err);
      toast.error(err.message || "Failed to send OTP");
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
      const next = document.getElementById(`seller-otp-${index + 1}`);
      if (next) next.focus();
    }
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

      setSellerForm((prev) => ({
        ...prev,
        phone: phone || firebasePhone.replace("+91", ""),
      }));

      toast.success("OTP verified");
      setStep("details");
    } catch (err) {
      console.error("Seller OTP verify error:", err);
      toast.error("Invalid OTP ❌");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setSellerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitSellerDetails = async (e) => {
    e.preventDefault();

    if (
      !sellerForm.name ||
      !sellerForm.shop_name ||
      !sellerForm.location ||
      !sellerForm.bank_name ||
      !sellerForm.account_number ||
      !sellerForm.ifsc_code ||
      !sellerForm.phone
    ) {
      toast.error("All required fields must be filled");
      return;
    }

    setIsSubmittingDetails(true);

    try {
      const payload = {
        phone: String(sellerForm.phone),
        email: sellerForm.email.trim(),
        name: sellerForm.name.trim(),
        shop_name: sellerForm.shop_name.trim(),
        location: sellerForm.location.trim(),
        bank_name: sellerForm.bank_name.trim(),
        account_number: sellerForm.account_number.trim(),
        ifsc_code: sellerForm.ifsc_code.trim().toUpperCase(),
      };

      const res = await axios.post(`${api}/api/seller/profile`, payload);

      const seller =
        res.data?.data || res.data?.seller || res.data?.sellerData || null;
      const token =
        res.data?.token ||
        res.data?.data?.token ||
        res.data?.accessToken ||
        null;

      if (!seller) {
        throw new Error("Seller data not found in response");
      }

      if (!token) {
        throw new Error("Seller token not found in response");
      }

      localStorage.setItem("sellerToken", token);
      localStorage.setItem("sellerInfo", JSON.stringify(seller));

      toast.success("Seller profile saved");

      setStep("success");

      setTimeout(() => {
        if (onClose) onClose?.();

        if (seller.status === "approved") {
          navigate("/seller/dashboard");
        } else {
          navigate("/seller/status");
        }
      }, 800);
    } catch (err) {
      console.error("Seller details submit error:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to save seller details"
      );
    } finally {
      setIsSubmittingDetails(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    else navigate("/");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Seller Login"
      subtitle="Login with your mobile number to access your seller account."
      maxWidth="max-w-md"
    >
      <div id="seller-recaptcha-container" />

      <div className="flex flex-col items-center mb-4">
        <span className="text-xl font-black tracking-tight text-indigo-900">
          Swift<span className="font-light">Cart</span>
          <span className="ml-1 text-[10px] font-semibold uppercase text-indigo-500">
            Seller
          </span>
        </span>
        <p className="mt-1 text-xs text-slate-500">
          OTP login for your seller account
        </p>
      </div>

      <div className="mb-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
        <span
          className={`h-1.5 w-6 rounded-full ${
            step === "send" ||
            step === "verify" ||
            step === "details" ||
            step === "success"
              ? "bg-indigo-700"
              : "bg-slate-300"
          }`}
        />
        <span
          className={`h-1.5 w-6 rounded-full ${
            step === "verify" || step === "details" || step === "success"
              ? "bg-indigo-700"
              : "bg-slate-300"
          }`}
        />
        <span
          className={`h-1.5 w-6 rounded-full ${
            step === "details" || step === "success"
              ? "bg-indigo-700"
              : "bg-slate-300"
          }`}
        />
      </div>

      {step === "send" && (
        <>
          <p className="text-xs text-slate-500 mb-3">
            Enter your registered seller mobile number to receive a one-time
            password.
          </p>

          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Phone Number
          </label>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              +91
            </span>
            <input
              type="text"
              placeholder="Enter 10 digit number"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            onClick={sendOtp}
            disabled={isSending}
            className="w-full rounded-full bg-indigo-700 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isSending ? "Sending OTP..." : "Send OTP"}
          </button>
        </>
      )}

      {step === "verify" && (
        <>
          <p className="text-xs text-slate-600 mb-3 text-center">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold">+91 {phone}</span>
          </p>

          <div className="flex justify-between mb-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                id={`seller-otp-${i}`}
                maxLength={1}
                type="text"
                className="h-11 w-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300"
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

          <div className="text-center mt-3 text-xs text-slate-600">
            {timer === 0 ? (
              <button
                onClick={sendOtp}
                className="font-semibold text-indigo-700 hover:underline"
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
        <form onSubmit={submitSellerDetails} className="space-y-3">
          <p className="text-xs text-slate-600 mb-1">
            Complete your seller profile to continue.
          </p>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Name</label>
            <input
              type="text"
              name="name"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
              placeholder="Your full name"
              value={sellerForm.name}
              onChange={handleDetailsChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
              placeholder="you@shop.com"
              value={sellerForm.email}
              onChange={handleDetailsChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Shop Name
            </label>
            <input
              type="text"
              name="shop_name"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
              placeholder="Your store name"
              value={sellerForm.shop_name}
              onChange={handleDetailsChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
              placeholder="City, State"
              value={sellerForm.location}
              onChange={handleDetailsChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Bank Name
            </label>
            <input
              type="text"
              name="bank_name"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
              placeholder="e.g. SBI, HDFC"
              value={sellerForm.bank_name}
              onChange={handleDetailsChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Account Number
            </label>
            <input
              type="text"
              name="account_number"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
              value={sellerForm.account_number}
              onChange={handleDetailsChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              IFSC Code
            </label>
            <input
              type="text"
              name="ifsc_code"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
              placeholder="e.g. SBIN0000000"
              value={sellerForm.ifsc_code}
              onChange={handleDetailsChange}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingDetails}
            className="mt-2 w-full rounded-full bg-indigo-700 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isSubmittingDetails ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      )}

      {step === "success" && (
        <div className="text-center py-3">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            ✅
          </div>
          <h2 className="text-sm font-semibold text-emerald-700 mb-1">
            Seller Profile Saved
          </h2>
          <p className="text-xs text-slate-600">
            You&apos;ll be redirected to your seller area in a moment.
          </p>
        </div>
      )}
    </Modal>
  );
}
