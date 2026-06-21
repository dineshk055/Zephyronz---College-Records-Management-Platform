import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiHome, FiLogIn, FiUserPlus, FiLogOut, FiUser, FiChevronDown, FiLock, FiShield } from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 theme-transition ${
        scrolled 
          ? "bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-lg" 
          : "bg-white dark:bg-slate-900 shadow-md border-b border-slate-100 dark:border-slate-800/40"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo Section */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
            >
              <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden shadow-md group-hover:shadow-indigo-500/20 border border-slate-200 transition-all duration-300 transform group-hover:scale-105">
                <img 
                  src="/pwa-192x192.png" 
                  alt="Zephyronz Emblem" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-655 transition-all duration-300">
                Zephyronz
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {!token ? (
                // Non-authenticated users
                <>
                  <Link
                    to="/"
                    className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <FiHome className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <FiLogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="ml-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-655 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </>
              ) : (
                // Authenticated users
                <>
                  <Link
                    to="/home"
                    className="px-4 py-2 text-gray-700 dark:text-slate-300 hover:text-indigo-655 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <FiHome className="w-4 h-4" />
                    <span>Home</span>
                  </Link>

                  {/* Admin Dashboard Button - Only visible for admin */}
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-md"
                    >
                      <FiShield className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  {/* User Dropdown */}
                  <div className="relative ml-4">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <span className="text-gray-700 dark:text-slate-300 hidden lg:inline font-medium">
                        {user?.name?.split(" ")[0] || "User"}
                      </span>
                      <FiChevronDown className={`w-4 h-4 text-gray-650 dark:text-slate-455 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setIsDropdownOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl z-50 border border-gray-200 dark:border-slate-800/80 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-850/50">
                            <p className="text-sm font-semibold text-gray-805 dark:text-slate-100">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{user?.email}</p>
                            {user?.role === "admin" && (
                              <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 rounded-full">
                                Administrator
                              </span>
                            )}
                          </div>
                          <div className="py-2">
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <FiUser className="w-4 h-4 text-indigo-500" />
                              <span>Profile Settings</span>
                            </Link>
                            {user?.role === "admin" && (
                              <Link
                                to="/admin"
                                className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <FiShield className="w-4 h-4 text-purple-650 dark:text-purple-400" />
                                <span>Admin Dashboard</span>
                              </Link>
                            )}
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            >
                              <FiLogOut className="w-4 h-4" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-indigo-650 hover:bg-indigo-50/55 focus:outline-none transition-colors"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
                <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}></span>
                <span className={`w-full h-0.5 bg-current transform transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="px-4 pt-2 pb-4 space-y-2 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-lg">
            {!token ? (
              <>
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-850/60 rounded-lg transition-colors"
                >
                  <FiHome className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-300 hover:text-indigo-655 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-850/60 rounded-lg transition-colors"
                >
                  <FiLogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-650 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors"
                >
                  <FiUserPlus className="w-5 h-5" />
                  <span>Register</span>
                </Link>
              </>
            ) : (
              <>
                {/* Mobile User Info */}
                <div className="px-4 py-3 mb-2 border-b border-gray-250 dark:border-slate-800 bg-gray-50 dark:bg-slate-850/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-805 dark:text-slate-100 font-semibold">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{user?.email}</p>
                      {user?.role === "admin" && (
                        <span className="inline-block mt-1 text-xs text-purple-600 dark:text-purple-400 font-semibold">Admin</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Link
                  to="/home"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-850/60 rounded-lg transition-colors"
                >
                  <FiHome className="w-5 h-5" />
                  <span>Home</span>
                </Link>

                {/* Admin Dashboard Link in Mobile Menu */}
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-650 hover:to-pink-655 transition-colors"
                  >
                    <FiShield className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-850/60 rounded-lg transition-colors"
                >
                  <FiUser className="w-5 h-5" />
                  <span>Profile Settings</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16 md:h-20"></div>
    </>
  );
};

export default Navbar;