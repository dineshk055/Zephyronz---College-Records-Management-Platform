import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiHome, FiLogIn, FiUserPlus, FiLogOut, FiUser, FiChevronDown, FiLock, FiSettings, FiShield } from "react-icons/fi";

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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg" 
          : "bg-white shadow-md"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo Section */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <FiLock className="relative w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-gray-800">
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
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <FiHome className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <FiLogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="ml-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
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
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-2"
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
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <span className="text-gray-700 hidden lg:inline font-medium">
                        {user?.name?.split(" ")[0] || "User"}
                      </span>
                      <FiChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setIsDropdownOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl z-50 border border-gray-200 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                            {user?.role === "admin" && (
                              <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">
                                Administrator
                              </span>
                            )}
                          </div>
                          <div className="py-2">
                            <Link
                              to="/profile"
                              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <FiUser className="w-4 h-4" />
                              <span>Profile Settings</span>
                            </Link>
                            {user?.role === "admin" && (
                              <Link
                                to="/admin"
                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <FiShield className="w-4 h-4 text-purple-600" />
                                <span>Admin Dashboard</span>
                              </Link>
                            )}
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
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
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition-colors"
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
          <div className="px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-200 shadow-lg">
            {!token ? (
              <>
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FiHome className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FiLogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
                >
                  <FiUserPlus className="w-5 h-5" />
                  <span>Register</span>
                </Link>
              </>
            ) : (
              <>
                {/* Mobile User Info */}
                <div className="px-4 py-3 mb-2 border-b border-gray-200 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-semibold">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {user?.role === "admin" && (
                        <span className="inline-block mt-1 text-xs text-purple-600 font-semibold">Admin</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Link
                  to="/home"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FiHome className="w-5 h-5" />
                  <span>Home</span>
                </Link>

                {/* Admin Dashboard Link in Mobile Menu */}
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                  >
                    <FiShield className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FiUser className="w-5 h-5" />
                  <span>Profile Settings</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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