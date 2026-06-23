import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUser, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const BottomNavigation = () => {
  const location = useLocation();
  const { token, user } = useAuth();
  
  if (!token) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-slate-900/80 backdrop-blur-lg border border-slate-800/80 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-6 py-3 transition-all duration-300">
      <div className="flex items-center justify-around">
        <Link
          to="/home"
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive("/home")
              ? "text-blue-500 scale-110 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FiHome className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Home</span>
        </Link>

        {user?.role === "admin" && (
          <Link
            to="/admin"
            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
              isActive("/admin")
                ? "text-cyan-500 scale-110 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FiShield className="w-5 h-5" />
            <span className="text-[10px] tracking-wide">Admin</span>
          </Link>
        )}

        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${
            isActive("/profile")
              ? "text-cyan-500 scale-110 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FiUser className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;
