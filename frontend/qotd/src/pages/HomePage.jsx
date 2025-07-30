import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import OtpForm from "../components/OtpForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import { z } from "zod";

const signUpSchema = z.object({
  srn: z.string().regex(/^[0-9]{2}[A-Z]{2}[0-9]{2}[A-Z]{3}[0-9]{3}$/, "Invalid SRN format (e.g., 01FE23BCS252)"),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signInSchema = signUpSchema.omit({ srn: true });

export default function HomePage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("signin");
  const [formData, setFormData] = useState({ srn: "", email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isOtpPhase, setIsOtpPhase] = useState(false);

  const { login, signup, verifyOtp } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const schema = authMode === "signin" ? signInSchema : signUpSchema;
    const result = schema.safeParse(formData);

    if (!result.success) {
      setFormErrors(result.error.format());
      return;
    }

    setFormErrors({});

    if (authMode === "signin") {
      const result = await login({ email: formData.email, password: formData.password });
      if (result?.success) navigate("/dashboard");
    } else {
      // First phase: send OTP
      const result = await signup({ email: formData.email, srn: formData.srn, password: formData.password });
      if (result?.success !== false) {
        setIsOtpPhase(true);
      }
    }
  };

  const handleOtpVerified = async () => {
    await verifyOtp(formData.email, formData.otp);
    setIsOtpPhase(false);
    setAuthMode("signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#111827] to-[#000000] text-white font-mono flex flex-col justify-between">
      <main className="max-w-7xl mx-auto px-6 py-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-4xl md:text-5xl font-extrabold text-cyan-300 mb-16 tracking-wide"
        >
          <span className="glow">Welcome to CodeClub</span>
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-[#1a1a1a] shadow-[0_0_15px_#00ffff20] p-8 rounded-xl w-full max-w-md mx-auto border border-cyan-800/40"
          >
            {showForgotPassword ? (
              <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
            ) : isOtpPhase ? (
              <OtpForm
                email={formData.email}
                srn={formData.srn}
                password={formData.password}
                onVerified={handleOtpVerified}
              />
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-cyan-400 text-center">
                  {authMode === "signin" ? "Sign In to CodeClub" : "Create a CodeClub Account"}
                </h2>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  {authMode === "signup" && (
                    <div>
                      <input
                        type="text"
                        name="srn"
                        placeholder="SRN"
                        value={formData.srn}
                        onChange={(e) => setFormData({ ...formData, srn: e.target.value })}
                        className="input-style"
                      />
                      {formErrors.srn && <p className="error-text">{formErrors.srn._errors?.[0]}</p>}
                    </div>
                  )}

                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-style"
                    />
                    {formErrors.email && <p className="error-text">{formErrors.email._errors?.[0]}</p>}
                  </div>
                  <div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-style"
                    />
                    {formErrors.password && <p className="error-text">{formErrors.password._errors?.[0]}</p>}
                  </div>

                  <button
                    type="submit"
                    className="mt-4 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-cyan-300/50"
                  >
                    {authMode === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                </form>

                <div className="text-sm text-gray-400 mt-6 text-center">
                  {authMode === "signin" ? (
                    <>
                      Don’t have an account?{" "}
                      <button onClick={() => setAuthMode("signup")} type="button" className="text-cyan-300 underline">
                        Sign Up
                      </button>
                      <br />
                      <button
                        onClick={() => setShowForgotPassword(true)}
                        type="button"
                        className="mt-2 inline-block text-sm text-pink-400 underline"
                      >
                        Forgot Password?
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button onClick={() => setAuthMode("signin")} type="button" className="text-cyan-300 underline">
                        Sign In
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-[#101010] rounded-xl p-6 border border-cyan-700/30 shadow-lg text-sm leading-relaxed"
          >
            <div className="mb-4 flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <pre className="text-cyan-200 whitespace-pre-wrap">
{`> Initializing CodeClub...
> Compiling minds... ✓
> Uploading passion... ✓
> Challenge downloaded: conquer_daily()

🧠  Repeat:
    Code → Conquest → Conquer

🚀  Start your journey now.`}
            </pre>
          </motion.div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-cyan-100 bg-[#0f172a]/20">
        <p className="mb-2">Made with ❤️ by RJ for the KLETU CodeClub</p>
        <div className="flex justify-center gap-4 text-cyan-400 flex-wrap">
          <a href="https://github.com/RJ1412" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://x.com/RJ__1412" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://www.linkedin.com/in/rj1412/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://www.instagram.com/tranquil.paradox/" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </footer>

      <style jsx="true">{`
        .glow {
          text-shadow: 0 0 8px #00ffff, 0 0 16px #00ffff;
        }
        .input-style {
          background-color: #0f172a;
          border: 1px solid #334155;
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: white;
          width: 100%;
          transition: border 0.3s ease;
        }
        .input-style:focus {
          outline: none;
          border-color: #00ffff;
          box-shadow: 0 0 5px #00ffff40;
        }
        .error-text {
          color: #f87171;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
}
