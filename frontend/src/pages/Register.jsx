import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiUserPlus, FiShield } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [developerOtp, setDeveloperOtp] = useState("");
  const [errors, setErrors] = useState({});

  // handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (otpSent) {
      if (!formData.otp) {
        newErrors.otp = "Verification code is required";
      } else if (!/^\d{6}$/.test(formData.otp)) {
        newErrors.otp = "Verification code must be 6 digits";
      }
    }
    return newErrors;
  };

  // send OTP helper
  const handleSendOtp = async () => {
    try {
      setOtpLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/send-otp`,
        { email: formData.email }
      );
      if (response.data.success) {
        setOtpSent(true);
        if (response.data.testOtp) {
          setDeveloperOtp(response.data.testOtp);
        } else {
          setDeveloperOtp("");
        }
        toast.success("Verification code sent to your email!");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || error.response?.data?.msg || "Failed to send verification code"
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // handle register
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!otpSent) {
      await handleSendOtp();
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          otp: formData.otp,
        }
      );
      toast.success("User Registered, please wait for admin approval");
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.msg || error.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-slate-950 flex items-center justify-center px-4 py-8">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative backdrop-blur-xl bg-slate-900/60 border border-slate-800 shadow-[0_0_50px_rgba(99,102,241,0.15)] rounded-3xl p-8 md:p-10 w-full max-w-md transform transition-all duration-300 hover:shadow-[0_0_60px_rgba(99,102,241,0.25)]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
            <FiUserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Join us and access secure records</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full bg-slate-950/40 border ${errors.name ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200`}
                disabled={loading || otpLoading}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-slate-950/40 border ${errors.email ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200`}
                disabled={loading || otpLoading || otpSent}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`w-full bg-slate-950/40 border ${errors.password ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl pl-11 pr-12 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200`}
                disabled={loading || otpLoading || otpSent}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                disabled={otpSent}
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full bg-slate-950/40 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl pl-11 pr-12 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200`}
                disabled={loading || otpLoading || otpSent}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                disabled={otpSent}
              >
                {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.confirmPassword}</p>
            )}
          </div>

          {/* OTP Field (Only shown if OTP is sent) */}
          {otpSent && (
            <div className="animate-in fade-in duration-300 space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Verification Code (OTP)
                </label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none disabled:opacity-50 transition-colors"
                >
                  {otpLoading ? "Resending..." : "Resend Code"}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiShield className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  name="otp"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={formData.otp}
                  onChange={handleChange}
                  className={`w-full bg-slate-950/40 border ${errors.otp ? 'border-red-500/50' : 'border-slate-800'} rounded-2xl pl-11 pr-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition duration-200 text-center tracking-[4px] font-semibold text-lg`}
                />
              </div>
              {errors.otp && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.otp}</p>
              )}

              {/* Developer Notice for Local Testing */}
              {developerOtp && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-4 text-xs font-medium animate-in slide-in-from-top duration-300 leading-relaxed">
                  <div className="flex gap-3">
                    <span className="text-base">⚙️</span>
                    <div>
                      <p className="font-semibold text-amber-200">Developer Testing Mode</p>
                      <p className="mt-1 text-slate-400">
                        SMTP server is not configured in your backend `.env`. Please verify your registration using this code: 
                        <span className="ml-1.5 font-bold text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30 tracking-[1.5px] font-mono text-sm">{developerOtp}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otpLoading}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading || otpLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {otpLoading ? "Sending Verification..." : loading ? "Registering Account..." : "Processing..."}
              </span>
            ) : otpSent ? (
              "Verify OTP & Register"
            ) : (
              "Send Verification Code"
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="px-3 bg-slate-900/60 text-slate-500 font-semibold">Already registered?</span>
          </div>
        </div>

        {/* Sign In Link */}
        <Link
          to="/login"
          className="block text-center w-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-300 py-3.5 rounded-2xl font-semibold transition-all duration-200 border border-slate-800 hover:border-indigo-500/50 text-sm"
        >
          Sign In Here
        </Link>

        {/* Terms and Conditions */}
        <p className="text-center text-xs text-slate-500 mt-6 leading-relaxed">
          By signing up, you agree to our{' '}
          <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Privacy Policy
          </a>
        </p>

      </div>
    </div>
  );
};

export default Register;