import React, { useState } from "react";
import { auth } from "../auth/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function OtpLogin({ onClose }) {
  const [step, setStep] = useState("send");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [confirmation, setConfirmation] = useState(null);
  const [timer, setTimer] = useState(0);
  const [userPhone, setUserPhone] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
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
      console.log("OTP Error:", err);
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
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Enter full 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const data = await confirmation.confirm(code);
      setUserPhone(data.user.phoneNumber);
      setStep("success");
      toast.success("Login successful 🎉");

      setTimeout(() => {
        if (onClose) onClose();
        navigate("/");
      }, 800);
    } catch (err) {
      toast.error("Invalid OTP ❌");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <div id="recaptcha-container" />

      <div className="flex flex-col items-center mb-5">
        <span className="text-xl font-black tracking-tight text-slate-900">
          Swift<span className="font-light">Cart</span>
        </span>
        <p className="mt-1 text-xs text-slate-500">
          Secure OTP login for your account
        </p>
      </div>

      <div className="mb-4 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
        <span
          className={`h-1.5 w-6 rounded-full ${
            step === "send" || step === "verify" || step === "success"
              ? "bg-slate-900"
              : "bg-slate-300"
          }`}
        />
        <span
          className={`h-1.5 w-6 rounded-full ${
            step === "verify" || step === "success"
              ? "bg-slate-900"
              : "bg-slate-300"
          }`}
        />
        <span
          className={`h-1.5 w-6 rounded-full ${
            step === "success" ? "bg-slate-900" : "bg-slate-300"
          }`}
        />
      </div>

      {step === "send" && (
        <>
          <p className="text-xs text-slate-500 mb-4">
            Enter your mobile number to receive a one-time password.
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
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            onClick={sendOtp}
            disabled={isSending}
            className="w-full rounded-full bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed transition"
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

      {step === "success" && (
        <div className="text-center py-4">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            ✅
          </div>
          <h2 className="text-sm font-semibold text-emerald-700 mb-1">
            Login Successful
          </h2>
          <p className="text-xs text-slate-600">
            Welcome, <span className="font-semibold">{userPhone}</span>
          </p>
        </div>
      )}
    </div>
  );
}
