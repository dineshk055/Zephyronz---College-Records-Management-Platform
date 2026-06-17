import { useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast';
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (res.data.success) {
        // Log in using AuthContext
        login(res.data.token, res.data.user);

        // Show success message
        toast.success(res.data.msg || "Login successful!");
        
        // Navigate to home page after successful login
        setTimeout(() => {
          navigate("/home");
        }, 800);
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle different error scenarios
      if (error.response) {
        const errorMsg = error.response.data?.msg || 
                        error.response.data?.message || 
                        "Login failed";
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (error.request) {
        setError("Cannot connect to server. Please check your connection.");
        toast.error("Cannot connect to server. Please check if the backend is running.");
      } else {
        setError("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-slate-950 px-4 py-8">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative backdrop-blur-xl bg-slate-900/60 border border-slate-800 shadow-[0_0_50px_rgba(99,102,241,0.15)] rounded-3xl p-8 md:p-10 w-full max-w-md transform transition-all duration-300 hover:shadow-[0_0_60px_rgba(99,102,241,0.25)]">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
            <FiLogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-slate-400 mt-2 text-sm">Please login to access your secure records</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl text-sm font-medium animate-in fade-in duration-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
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
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password field */}
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
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-11 pr-12 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying Credentials...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500">
            Demo Administrator: <span className="text-slate-400 font-mono">admin@example.com</span> / <span className="text-slate-400 font-mono">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;