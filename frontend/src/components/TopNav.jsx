import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopNav() {
  const { isAuthenticated } = useAuth();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Listen for auth and localStorage changes
  useEffect(() => {
    const handleStorageChange = () => setForceUpdate((prev) => prev + 1);
    const handleAuthChange = () => setForceUpdate((prev) => prev + 1);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChanged", handleAuthChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, []);

  // Theme toggle (persisted)
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#1f1b16"; // deep dark brown
      document.body.style.color = "#f5e9df"; // light beige text
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#f5e9df"; // beige background
      document.body.style.color = "#4a2d18"; // dark brown text
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
    try {
      window.dispatchEvent(new Event("themeChanged"));
    } catch {}
  }, [isDark]);

  const location = useLocation();
  const isLanding = location && location.pathname === "/";

  return (
    <nav
      className={`mx-6 mt-6 px-8 py-4 rounded-2xl shadow-md transition-all duration-500 ${
        isDark ? "bg-[#2e2119]" : "bg-[#8B5E3C]"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
            <img
              src="/StudyTa.ico"
              alt="Logo"
              className="w-full h-full object-contain"
              width={40}
              height={40}
              style={{ imageRendering: "auto" }}
              loading="eager"
            />
          </div>
          <span
            className={`text-xl font-bold ${
              isDark ? "text-[#f5e9df]" : "text-[#FDF3EA]"
            }`}
          >
            StudyTa
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex space-x-8">
          {["Home", "How it Works", "Features", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className={`transition-all duration-300 font-medium ${
                isDark
                  ? "text-[#f5e9df] hover:text-[#e6b97d]"
                  : "text-[#FDF3EA] hover:text-[#E59C5C]"
              }`}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDark((d) => !d)}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? "hover:bg-[#3a2a20]"
                : "hover:bg-[#A4714D]/40"
            }`}
            aria-label="Toggle dark mode"
            title="Toggle Dark Mode"
          >
            {isDark ? (
              // Sun Icon
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f5e9df"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
            ) : (
              // Moon Icon
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FDF3EA"
                strokeWidth="1.5"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2">
            <Link
              to="/register"
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                isDark
                  ? "bg-[#E59C5C] text-[#1f1b16] hover:bg-[#e6b97d]"
                  : "bg-[#E59C5C] text-white hover:bg-[#d68a47]"
              }`}
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className={`px-4 py-2 rounded-full font-medium border transition-all duration-300 ${
                isDark
                  ? "border-[#f5e9df] text-[#f5e9df] hover:bg-[#3a2a20]"
                  : "border-[#FDF3EA] text-[#FDF3EA] hover:bg-[#A4714D]/40"
              }`}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
