import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 theme-transition ${
        scrolled 
          ? "bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-lg" 
          : "bg-white dark:bg-slate-900 shadow-md border-b border-slate-100 dark:border-slate-800/40"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16 md:h-20">
            
            {/* Logo Section - Centered */}
            <Link 
              to="/" 
              className="flex items-center group"
            >
              <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-655 transition-all duration-300">
                Zephyronz
              </span>
            </Link>

          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16 md:h-20"></div>
    </>
  );
};

export default Navbar;