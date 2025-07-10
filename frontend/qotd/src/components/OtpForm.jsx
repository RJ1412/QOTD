// src/components/OtpForm.jsx
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function OtpForm({ email, onVerified }) {
  const [otp, setOtp] = useState("");
  const { verifyOtp } = useAuthStore();

  const handleVerify = async () => {
    if (!otp) return;
    await verifyOtp(email, otp);
    onVerified();
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-[#0077b6] dark:text-white text-center">
        Verify Your Email
      </h2>
      <p className="text-sm text-center text-gray-600 dark:text-gray-300">
        We’ve sent an OTP to <span className="font-medium">{email}</span>
      </p>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white placeholder-gray-500 w-full"
      />
      <button
        onClick={handleVerify}
        className="w-full mt-2 bg-[#90e0ef] dark:bg-[#0077b6] text-[#1a1a1a] dark:text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
      >
        Verify OTP
      </button>
    </div>
  );
}
