import { useState } from "react";
import { z } from "zod";
import { useAuthStore } from "../store/useAuthStore";

const emailSchema = z.string().email("Enter a valid email");
const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export default function ForgotPasswordForm({ onBack }) {
  const { forgotPassword, resetPassword } = useAuthStore();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState("request");
  const [errors, setErrors] = useState({});

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setErrors({ email: result.error.errors?.[0]?.message || "Invalid email" });
      return;
    }
    try {
      setErrors({});
      await forgotPassword(email);
      setStep("verify");
    } catch {
      setErrors({ email: "Something went wrong. Try again." });
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    try {
      resetSchema.parse({ email, otp, newPassword });
      setErrors({});
      await resetPassword(email, otp, newPassword);
      setStep("done");
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.errors.forEach((e) => (fieldErrors[e.path[0]] = e.message));
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl p-8 md:p-10 border border-white/20 backdrop-blur-lg bg-gradient-to-br from-white/20 via-white/10 to-transparent dark:from-[#1a1a1a]/30 dark:via-[#1a1a1a]/10 shadow-[0_0_30px_rgba(0,255,200,0.1)] animate-fade-in text-white">
      <h2 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-green-400 dark:to-teal-300">
        {step === "done" ? "Password Reset Successful" : "Reset Your Password"}
      </h2>

      {step === "done" ? (
        <>
          <p className="text-center text-green-500 mb-4">
            Your password has been reset. Please login with your new password.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-green-400 dark:to-teal-400 text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md shadow-cyan-500/20 dark:shadow-green-400/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 cursor-pointer"
          >
            ← Back to Sign In
          </button>
        </>
      ) : (
        <form
          onSubmit={step === "request" ? handleEmailSubmit : handleResetSubmit}
          className="flex flex-col gap-4"
          aria-label="Forgot Password Form"
        >
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={step === "verify"}
            className="px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 text-black dark:text-white border border-white/30 placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-400 dark:focus:ring-green-400 outline-none transition-all duration-200"
            required
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          {step === "verify" && (
            <>
              <input
                type="text"
                placeholder="OTP sent to your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 text-black dark:text-white border border-white/30 placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-400 dark:focus:ring-green-400 outline-none transition-all duration-200"
                required
              />
              {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}

              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 text-black dark:text-white border border-white/30 placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-400 dark:focus:ring-green-400 outline-none transition-all duration-200"
                required
              />
              {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
            </>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
            <button
              type="submit"
              className="w-full md:w-auto bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-green-400 dark:to-teal-400 text-white font-semibold py-3 px-6 rounded-xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md shadow-cyan-500/20 dark:shadow-green-400/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 cursor-pointer"
            >
              {step === "request" ? "Send OTP" : "Reset Password"}
            </button>

            {step === "verify" && (
              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setOtp("");
                  setNewPassword("");
                  setErrors({});
                }}
                className="text-sm underline text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                ← Back to Email
              </button>
            )}
          </div>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-white/70">
        Remembered your password?{" "}
        <button
          onClick={onBack}
          className="text-cyan-400 hover:underline hover:text-cyan-300 transition-colors cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
