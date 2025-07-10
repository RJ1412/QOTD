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
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const signInSchema = signUpSchema.omit({ srn: true });

export default function HomePage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("signin");
  const [formData, setFormData] = useState({ srn: "", email: "", password: "" });
  const [isOtpPhase, setIsOtpPhase] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login, signup } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const schema = authMode === "signin" ? signInSchema : signUpSchema;
    const result = schema.safeParse(formData);

    if (!result.success) {
      const formattedErrors = result.error.format();
      setFormErrors(formattedErrors);
      return;
    }

    setFormErrors({});

    if (authMode === "signin") {
  const result = await login({ email: formData.email, password: formData.password });
  if (result?.success) {
    navigate("/dashboard");
  } else {
    console.error("Login failed");
  }
}

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2fe] via-[#fdfdea] to-[#fff1f5] dark:from-[#1a1a1a] dark:via-[#2a2a2a] dark:to-[#1c1c1c] transition-colors duration-500 flex flex-col justify-between">
      <main className="max-w-7xl mx-auto px-6 py-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-4xl md:text-5xl font-extrabold text-[#0077b6] dark:text-white mb-16"
        >
          Welcome to <span className="text-[#5b2c6f]">CodeClub</span>
        </motion.h1>

        <div className="grid md:grid-cols-2 items-start gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-md p-6 md:p-10 rounded-xl shadow-xl w-full max-w-md mx-auto"
          >
            {showForgotPassword ? (
              <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
            ) : isOtpPhase ? (
              <OtpForm
                email={otpEmail}
                onVerified={() => {
                  setIsOtpPhase(false);
                  setAuthMode("signin");
                }}
              />
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-6 text-[#0077b6] dark:text-white text-center">
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
                        className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white placeholder-gray-500 w-full"
                      />
                      {formErrors.srn && <p className="text-sm text-red-500 mt-1">{formErrors.srn._errors?.[0]}</p>}
                    </div>
                  )}
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white placeholder-gray-500 w-full"
                    />
                    {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email._errors?.[0]}</p>}
                  </div>
                  <div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white placeholder-gray-500 w-full"
                    />
                    {formErrors.password && <p className="text-sm text-red-500 mt-1">{formErrors.password._errors?.[0]}</p>}
                  </div>

                  <button
                    type="submit"
                    className="mt-4 bg-[#90e0ef] dark:bg-[#0077b6] text-[#1a1a1a] dark:text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
                  >
                    {authMode === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                </form>

                <div className="text-sm text-[#444] dark:text-gray-300 mt-4 text-center">
                  {authMode === "signin" ? (
                    <>
                      Don’t have an account?{' '}
                      <button onClick={() => setAuthMode("signup")} type="button" className="text-[#5b2c6f] dark:text-[#bfa3ff] font-semibold underline">
                        Sign Up
                      </button>
                      <br />
                      <button
                        onClick={() => setShowForgotPassword(true)}
                        type="button"
                        className="mt-2 inline-block text-sm text-blue-600 dark:text-blue-400 underline"
                      >
                        Forgot Password?
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button onClick={() => setAuthMode("signin")} type="button" className="text-[#5b2c6f] dark:text-[#bfa3ff] font-semibold underline">
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
            transition={{ duration: 0.7 }}
            className="w-full h-full bg-white/50 dark:bg-[#ffffff0a] backdrop-blur-lg text-[#1e293b] dark:text-[#cbd5e1] rounded-xl shadow-xl p-6 font-mono border border-[#e0e7ff] dark:border-[#334155] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <pre className="whitespace-pre-wrap text-sm md:text-base leading-relaxed text-[#334155] dark:text-[#e2e8f0]">
                {`> Initializing CodeClub...
> Compiling minds... ✓
> Uploading passion... ✓
> Challenge downloaded: conquer_daily()

🧠  Repeat:
    Code → Conquest → Conquer

🚀  Start your journey now.`}
              </pre>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-[#6b7280] dark:text-[#a1a1aa]">
        <p className="mb-2">Made with ❤️ by RJ for the KLETU CodeClub</p>
        <div className="flex justify-center gap-6 text-[#5b5b5b] dark:text-[#bcbcbc] text-sm flex-wrap">
          <a href="https://github.com/RJ1412" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://x.com/RJ__1412" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://www.linkedin.com/in/rj1412/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://www.instagram.com/tranquil.paradox/" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </footer>
    </div>
  );
}
