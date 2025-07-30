import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";

export default function OtpForm({ email, onVerified }) {
  const [otp, setOtp] = useState("");
  const { verifyOtp } = useAuthStore();
  const inputsRef = useRef([]);
  const [resendTimer, setResendTimer] = useState(30);
  const [typedText, setTypedText] = useState("");
  const fullText = `We’ve sent a 6-digit OTP to ${email}`;

  // Typing effect
  useEffect(() => {
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText((prev) => prev + fullText[i]);
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);
    return () => clearInterval(typeInterval);
  }, [email]);

  // Countdown for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    const newOtp = otp.split("");
    newOtp[idx] = val;
    const updatedOtp = newOtp.join("");
    setOtp(updatedOtp);
    if (val && inputsRef.current[idx + 1]) {
      inputsRef.current[idx + 1].focus();
    }
  };

  const handleVerify = async () => {
    if (otp.length === 6) {
      await verifyOtp(email, otp);
      onVerified();
    }
  };

  useEffect(() => {
    if (otp.length === 6) handleVerify();
  }, [otp]);

  const handleResend = () => {
    if (resendTimer > 0) return;
    alert("📨 OTP resent! (hook this to actual backend API)");
    setResendTimer(30);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-6 p-6 rounded-xl shadow-lg bg-[#0f172a] border border-cyan-400 max-w-md w-full"
    >
      <h2 className="text-2xl font-bold text-cyan-400 text-center drop-shadow-md">
        Verify Your Email
      </h2>
      <p className="text-sm text-center text-gray-300 h-5 min-h-[20px] whitespace-nowrap">
        {typedText}
        <span className="animate-pulse">|</span>
      </p>

      <div className="flex justify-center gap-2">
        {[...Array(6)].map((_, idx) => (
          <input
            key={idx}
            type="text"
            maxLength={1}
            value={otp[idx] || ""}
            onChange={(e) => handleChange(e, idx)}
            ref={(el) => (inputsRef.current[idx] = el)}
            className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-cyan-500 bg-[#1e293b] text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-150 shadow-md"
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        className="w-full mt-4 py-3 rounded-lg bg-cyan-400 text-black font-semibold hover:opacity-90 transition duration-200 shadow-md"
      >
        Verify OTP
      </button>

      <p className="text-center text-sm text-gray-400 mt-2">
        Didn’t receive the code?{" "}
        <button
          onClick={handleResend}
          disabled={resendTimer > 0}
          className={`${
            resendTimer > 0
              ? "text-gray-500 cursor-not-allowed"
              : "text-pink-400 hover:underline"
          } font-medium`}
        >
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
        </button>
      </p>
    </motion.div>
  );
}
