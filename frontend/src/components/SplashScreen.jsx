import { useEffect, useState } from "react";

const SplashScreen = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Start animation on mount
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm px-4">
        {/* Logo Container with Zoom and Fade-in animation */}
        <div 
          className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-white shadow-2xl border border-slate-800 transition-all duration-1000 ease-out transform ${
            animate 
              ? "scale-100 opacity-100 rotate-0" 
              : "scale-75 opacity-0 -rotate-12"
          }`}
        >
          <img 
            src="/pwa-512x512.png" 
            alt="Zephyronz Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Brand Name with Fade-in and Up animation */}
        <div 
          className={`transition-all duration-1000 delay-300 ease-out transform ${
            animate 
              ? "translate-y-0 opacity-100" 
              : "translate-y-4 opacity-0"
          }`}
        >
          <h1 className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Zephyronz
          </h1>
          <p className="text-slate-400 text-xs mt-2 font-medium tracking-widest uppercase">
            Records Management Platform
          </p>
        </div>
      </div>
      
      {/* Premium Loader at the bottom */}
      <div 
        className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-500 ease-out ${
          animate ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
