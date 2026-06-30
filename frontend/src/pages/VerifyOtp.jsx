import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';
import { FiShield, FiAlertTriangle, FiArrowLeft } from "react-icons/fi";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registrationData = location.state || {};
  
  const { name, email, password, phone, verificationMethod, testOtp: initialTestOtp } = registrationData;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [developerOtp, setDeveloperOtp] = useState(initialTestOtp || "");
  const [cooldown, setCooldown] = useState(60); // 60 seconds resend cooldown
  const [error, setError] = useState("");

  // Cooldown countdown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // If no registration data is present, prompt redirection
  if (!email || !name || !password) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="backdrop-blur-xl bg-white/80 border border-blue-100 p-8 rounded-3xl max-w-md w-full text-center shadow-xl">
          <FiAlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Session</h2>
          <p className="text-gray-500 text-sm mb-6">We could not find any active registration session. Please fill in your details first.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all">
            <FiArrowLeft className="w-4 h-4" />
            <span>Go to Register</span>
          </Link>
        </div>
      </div>
    );
  }

  // Handle resend OTP code
  const handleResend = async () => {
    if (cooldown > 0) return;
    
    try {
      setResendLoading(true);
      setError("");
      
       const response = await axios.post(
        `${apiUrl}/api/auth/send-otp`,
        { email, phone, method: verificationMethod }
      );
      
      if (response.data.success) {
        toast.success("A new verification code has been sent!");
        setCooldown(60); // Reset 60s cooldown timer
        if (response.data.testOtp) {
          setDeveloperOtp(response.data.testOtp);
        } else {
          setDeveloperOtp("");
        }
      }
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data?.message || error.response?.data?.msg || "Failed to resend code";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setResendLoading(false);
    }
  };

  // Handle code submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("Verification code is required");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError("Verification code must be exactly 6 digits");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${apiUrl}/api/auth/register`,
        { name, email, password, phone, otp }
      );

      if (response.data.success) {
        toast.success("Account verified and registered successfully!");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
      const errMsg = error.response?.data?.message || error.response?.data?.msg || "Verification failed";
      setError(errMsg);
      toast.error(errMsg);
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
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg shadow-indigo-500/10 border border-slate-200/50 bg-white overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img 
              src="/pwa-512x512.png" 
              alt="Zephyronz Emblem" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            {verificationMethod === "sms" ? "Verify Phone" : "Verify Email"}
          </h1>
          <p className="text-slate-550 dark:text-slate-400 mt-2 text-sm font-medium">We've sent a 6-digit code to <span className="text-slate-800 dark:text-slate-200 font-semibold">{verificationMethod === "sms" ? phone : email}</span></p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold animate-in fade-in duration-200 leading-relaxed">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 text-center">
              Enter Verification Code
            </label>
            <input
              type="text"
              name="otp"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-white dark:bg-slate-950/65 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 text-center tracking-[8px] font-bold text-2xl"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Resend Cooldown Notice / Link */}
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={handleResend}
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

          {/* Developer Notice for Local Testing */}
          {developerOtp && (
            <div className="bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-2xl p-4 text-xs font-medium animate-in slide-in-from-top duration-300 leading-relaxed">
              <div className="flex gap-3">
                <span className="text-base">⚙️</span>
                <div>
                  <p className="font-semibold text-amber-300">Developer Testing Mode</p>
                  <p className="mt-1 text-slate-400">
                    SMTP server is not configured in your backend `.env`. Please verify your registration using this code: 
                    <span className="ml-1.5 font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 tracking-[1.5px] font-mono text-sm">{developerOtp}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || resendLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying Code...
              </span>
            ) : (
              "Verify & Register"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <Link to="/register" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350 transition-colors font-bold uppercase tracking-wider">
            ← Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;