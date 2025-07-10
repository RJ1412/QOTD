import { useState } from "react";
import { z } from "zod";
import { useAuthStore } from "../store/useAuthStore";

const emailSchema = z.string().email("Enter a valid email");
const resetSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export default function ForgotPasswordForm() {
  const { forgotPassword, resetPassword } = useAuthStore();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState("request");
  const [errors, setErrors] = useState({});

  const handleEmailSubmit = async (e) => {
  e.preventDefault();
  try {
    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      const errorMsg = result.error.errors?.[0]?.message || "Invalid email";
      setErrors({ email: errorMsg });
      return;
    }

    // If valid, proceed
    setErrors({});
    await forgotPassword(email);
    setStep("verify");
  } catch (err) {
    console.error("Unexpected error:", err);
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
    <div className="w-full bg-white/70 dark:bg-white/10 backdrop-blur-md p-6 md:p-10 rounded-xl shadow-xl max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-center text-[#0077b6] dark:text-white">
        {step === "done" ? "Password Reset Successful" : "Reset Your Password"}
      </h2>

      {step === "done" ? (
        <p className="text-center text-green-600 dark:text-green-400">
          Your password has been reset. Please login with your new password.
        </p>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={step === "request" ? handleEmailSubmit : handleResetSubmit}
        >
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white placeholder-gray-500"
            disabled={step === "verify"}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          {step === "verify" && (
            <>
              <input
                type="text"
                placeholder="OTP sent to your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white placeholder-gray-500"
              />
              {errors.otp && <p className="text-red-500 text-sm">{errors.otp}</p>}

              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white placeholder-gray-500"
              />
              {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
            </>
          )}

          <button
            type="submit"
            className="mt-4 bg-[#90e0ef] dark:bg-[#0077b6] text-[#1a1a1a] dark:text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
          >
            {step === "request" ? "Send OTP" : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}
