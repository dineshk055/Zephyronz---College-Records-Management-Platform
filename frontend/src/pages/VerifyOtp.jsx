import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';
import { FiShield, FiAlertTriangle, FiArrowLeft } from "react-icons/fi";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Retrieve credentials passed from Register state
  const registrationData = location.state || {};
  const { name, email, password, testOtp: initialTestOtp } = registrationData;

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
        `${import.meta.env.VITE_API_URL}/api/auth/send-otp`,
        { email }
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
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        { name, email, password, otp }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-8">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative backdrop-blur-xl bg-white/80 border border-blue-100 shadow-[0_0_50px_rgba(59,130,246,0.15)] rounded-3xl p-8 md:p-10 w-full max-w-md transform transition-all duration-300 hover:shadow-[0_0_60px_rgba(59,130,246,0.25)]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 via-blue-500 to-blue-700 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Verify Email
          </h1>
          <p className="text-gray-500 mt-2 text-sm">We've sent a 6-digit code to <span className="text-gray-800 font-semibold">{email}</span></p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium animate-in fade-in duration-200 leading-relaxed">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2 text-center">
              Enter Verification Code
            </label>
            <input
              type="text"
              name="otp"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-white border border-gray-300 rounded-2xl py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 text-center tracking-[8px] font-bold text-2xl"
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
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-blue-600 hover:text-blue-700"
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
            <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl p-4 text-xs font-medium animate-in slide-in-from-top duration-300 leading-relaxed">
              <div className="flex gap-3">
                <span className="text-base">⚙️</span>
                <div>
                  <p className="font-semibold text-amber-800">Developer Testing Mode</p>
                  <p className="mt-1 text-gray-600">
                    SMTP server is not configured in your backend `.env`. Please verify your registration using this code: 
                    <span className="ml-1.5 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 tracking-[1.5px] font-mono text-sm">{developerOtp}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || resendLoading}
            className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 hover:from-blue-700 hover:via-blue-600 hover:to-blue-800 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
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

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <Link to="/register" className="text-xs text-gray-500 hover:text-gray-700 transition-colors font-semibold uppercase tracking-wider">
            ← Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;