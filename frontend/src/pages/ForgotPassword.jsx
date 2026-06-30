import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiHash } from "react-icons/fi";

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);

  // Cooldown & Expiration countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password/send-otp`,
        { email: formData.email }
      );

      if (res.data.success) {
        toast.success(res.data.message || "OTP sent to your email!");
        if (res.data.testOtp) {
          console.log("Test OTP:", res.data.testOtp);
        }
        setCooldown(60);
        setExpiresIn(300);
        setStep(2);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || "Failed to send OTP";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    try {
      setResendLoading(true);
      setError("");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password/send-otp`,
        { email: formData.email }
      );
      if (res.data.success) {
        toast.success("A new verification code has been sent!");
        setCooldown(60);
        setExpiresIn(300);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || "Failed to resend OTP";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.otp.trim() || formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    if (!formData.newPassword || formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password/reset`,
        {
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }
      );

      if (res.data.success) {
        toast.success("Password reset successfully! You can now log in.");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || "Failed to reset password";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden px-4 py-8">
      {/* Background ambient glows */}
      <div className="absolute -top-12 -left-12 w-96 h-96 bg-indigo-350/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-12 -right-12 w-96 h-96 bg-purple-350/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative backdrop-blur-xl bg-white/70 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800/40 shadow-[0_0_50px_rgba(99,102,241,0.05)] rounded-3xl p-8 md:p-10 w-full max-w-md transform transition-all duration-300 hover:shadow-[0_0_65px_rgba(99,102,241,0.1)]">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg shadow-indigo-500/10 border border-slate-200/50 bg-white overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img 
              src="/pwa-512x512.png" 
              alt="Zephyronz Emblem" 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            Reset Password
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            {step === 1 ? "Enter your email to receive a code" : "Enter the OTP and your new password"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold animate-in fade-in duration-200 leading-relaxed">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Registered Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full bg-white dark:bg-slate-950/65 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-650 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  6-Digit OTP Code
                </label>
                <span className={`text-xs font-bold ${expiresIn > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500'} bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md`}>
                  {expiresIn > 0 ? `Expires in ${formatTime(expiresIn)}` : "Code Expired"}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiHash className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full bg-white dark:bg-slate-950/65 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-950/65 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-12 py-3.5 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || resendLoading || expiresIn === 0}
              className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            
            <div className="text-center text-sm mt-4">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || resendLoading}
                className={`font-semibold focus:outline-none transition-colors ${
                  cooldown > 0 
                    ? "text-slate-400 dark:text-slate-500 cursor-not-allowed" 
                    : "text-indigo-605 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                }`}
              >
                {resendLoading 
                  ? "Resending..." 
                  : cooldown > 0 
                    ? `Resend Code in ${cooldown}s` 
                    : "Resend Verification Code"
                }
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setStep(1); setError(""); }}
              disabled={loading}
              className="w-full mt-2 text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Back to Email
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-slate-200 dark:border-slate-800/50 pt-6">
          <p className="text-sm text-slate-550 dark:text-slate-400">
            Remember your password?{" "}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
