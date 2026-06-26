import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiUserPlus, FiPhone } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    verificationMethod: "email",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number is invalid (must include country code, e.g. +1234567890)";
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
    return newErrors;
  };

  // handle register submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      // Request verification code first (do NOT create account immediately)
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/send-otp`,
        { 
          email: formData.email,
          phone: formData.phone,
          method: formData.verificationMethod
        }
      );
      
      if (response.data.success) {
        toast.success(response.data.message || "Verification code sent!");
        // Navigate to the separate verification page, passing user details in state
        navigate("/verify-otp", {
          state: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            verificationMethod: formData.verificationMethod,
            testOtp: response.data.testOtp || null
          }
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || error.response?.data?.msg || "Failed to send verification code"
      );
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
            Create Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Join us and access secure records</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full bg-white dark:bg-slate-950/65 border ${errors.name ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-800'} rounded-2xl pl-11 pr-4 py-3 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200`}
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-white dark:bg-slate-950/65 border ${errors.email ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-800'} rounded-2xl pl-11 pr-4 py-3 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200`}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full bg-white dark:bg-slate-950/65 border ${errors.phone ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-800'} rounded-2xl pl-11 pr-4 py-3 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200`}
                disabled={loading}
              />
            </div>
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.phone}</p>
            )}
          </div>

          {/* Verification Method Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Send Verification OTP via
            </label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="email"
                  checked={formData.verificationMethod === "email"}
                  onChange={handleChange}
                  className="accent-indigo-600"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">Email</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition">
                <input
                  type="radio"
                  name="verificationMethod"
                  value="sms"
                  checked={formData.verificationMethod === "sms"}
                  onChange={handleChange}
                  className="accent-indigo-600"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">SMS (Phone)</span>
              </label>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`w-full bg-white dark:bg-slate-950/65 border ${errors.password ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-800'} rounded-2xl pl-11 pr-12 py-3 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200`}
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
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full bg-white dark:bg-slate-950/65 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-800'} rounded-2xl pl-11 pr-12 py-3 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-205`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-650 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold">Already registered?</span>
          </div>
        </div>

        {/* Sign In Link */}
        <Link
          to="/login"
          className="block text-center w-full bg-slate-50 dark:bg-slate-950/65 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-350 py-3.5 rounded-2xl font-semibold transition-all duration-200 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 text-sm"
        >
          Sign In Here
        </Link>

        {/* Terms and Conditions */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-5 leading-relaxed">
          By signing up, you agree to our{' '}
          <a href="#" className="text-indigo-650 dark:text-indigo-400 hover:text-indigo-755 dark:hover:text-indigo-305 font-semibold transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-indigo-650 dark:text-indigo-400 hover:text-indigo-755 dark:hover:text-indigo-305 font-semibold transition-colors">
            Privacy Policy
          </a>
        </p>

      </div>
    </div>
  );
};

export default Register;