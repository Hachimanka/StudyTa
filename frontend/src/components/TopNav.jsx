import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopNav() {
  const { isAuthenticated, user, logout } = useAuth();
  const [forceUpdate, setForceUpdate] = useState(0);
  const navigate = useNavigate();

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

  // Derive user's display name, initial (uppercase), and potential avatar image
  const { displayName, initial, avatarUrl } = useMemo(() => {
    let parsedStorage = null;
    try {
      const raw = localStorage.getItem("studytA_user") || localStorage.getItem("user");
      if (raw) parsedStorage = JSON.parse(raw);
    } catch {
      parsedStorage = null;
    }

    const nameFromUser =
      user?.name ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.fullName || null;
    const nameFromStorage = parsedStorage
      ? parsedStorage?.name ||
        parsedStorage?.fullName ||
        [parsedStorage?.firstName, parsedStorage?.lastName].filter(Boolean).join(" ")
      : null;

    const name = nameFromUser || nameFromStorage || user?.username || user?.email || "Account";
    const init = (name?.trim?.()?.[0] || user?.email?.[0] || "U").toUpperCase();

    // Common possible avatar fields
    const avatarCandidates = [
      user?.avatar,
      user?.avatarUrl,
      user?.profilePicture,
      user?.photo,
      user?.image,
      parsedStorage?.avatar,
      parsedStorage?.avatarUrl,
      parsedStorage?.profilePicture,
      parsedStorage?.photo,
      parsedStorage?.image
    ].filter(Boolean);
    const avatar = avatarCandidates.find((v) => typeof v === "string" && v.length > 3) || null;
    return { displayName: name, initial: init, avatarUrl: avatar };
  }, [user, forceUpdate]);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarButtonRef = useRef(null);

  // Close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        avatarButtonRef.current &&
        !avatarButtonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const bioText = user?.bio || user?.about || "Bio";

  // Authenticated Topbar UI (after login)
  if (isAuthenticated && !isLanding) {
    return (
      <nav className="sticky top-0 w-full h-15 bg-[#845845] shadow-sm">
        <div className="mx-auto flex items-center justify-between px-6 py-3">
          {/* Left: Logo + Brand */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 focus:outline-none group"
            aria-label="Go to dashboard"
          >
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
              <img
                src="/StudyTa.ico"
                alt="StudyTa"
                className="w-full h-full object-contain"
                width={32}
                height={32}
                loading="eager"
              />
            </div>
            <span className="text-[#E9D8D0] font-semibold text-xl tracking-wide group-hover:opacity-90 transition-opacity">StudyTa</span>
          </button>

          {/* Right: User name + avatar initial */}
          <div className="relative flex items-center gap-3 select-none">
            <span className="text-[#FFFFFF] text-base hidden sm:inline" aria-hidden={!open}>{displayName}</span>
            <button
              ref={avatarButtonRef}
              onClick={() => setOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={open}
              className="w-10 h-10 rounded-full bg-[#FFFFFF] border-2 border-[#6F422B] text-[#845C47] flex items-center justify-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#FDF3EA]/60 focus:ring-offset-2 focus:ring-offset-[#845845] transition-shadow overflow-hidden"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${displayName} avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                initial
              )}
            </button>

            {open && (
              <div
                ref={dropdownRef}
                role="dialog"
                aria-label="Profile menu"
                className="absolute top-10 right-0 mt-5 w-70 h-85 rounded-3xl bg-[#BE8E78] text-[#6F422B] shadow-lg p-6 origin-top-right animate-[fadeIn_160ms_ease-out]"
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
              >
                {/* Avatar Large */}
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full bg-[#FFFFFF] border-3 border-[#6F422B] flex items-center justify-center text-5xl font-semibold mb-4 overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${displayName} avatar large`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <h2 className="text-center font-semibold text-lg leading-tight text-[#FFFFFF]">
                    {displayName}
                  </h2>
                  <p className="italic text-sm text-[#FFFFFF] mt-1 mb-4 line-clamp-2 max-w-[13rem] text-center">
                    {bioText}
                  </p>
                </div>
                <div className="space-y-3 mt-2">
                  <button
                    onClick={() => { navigate('/profile'); setOpen(false); }}
                    className="flex items-center justify-center w-full gap-3 px-3 py-2 rounded-xl hover:bg-[#B58875] focus:outline-none focus:bg-[#B58875] transition-colors group"
                  >
                    <span className="w-7 h-7 flex items-center justify-center rounded-md text-[#5D3A2A] group-hover:scale-105 transition-transform">
                      <img 
                        src="/ProfileIcons/Settings.png" 
                        alt="Settings" 
                        className="w-5 h-5 object-contain block"
                      />
                    </span>
                    <span className="text-[#FFFFFF] font-regular">Settings</span>
                  </button>
                  <button
                    onClick={() => { logout(() => navigate('/')); setOpen(false); }}
                    className="flex items-center justify-center w-full gap-3 px-3 py-2 rounded-xl hover:bg-[#B58875] focus:outline-none focus:bg-[#B58875] transition-colors group"
                  >
                    <span className="w-7 h-7 flex items-center justify-center rounded-md text-[#5D3A2A] group-hover:scale-105 transition-transform">
                      <img 
                        src="/ProfileIcons/LogOut.png" 
                        alt="Log Out" 
                        className="w-5 h-5 object-contain block"
                      />
                    </span>
                    <span className="text-[#FFFFFF] font-regular">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // Hide nav entirely on non-landing pages when not authenticated
  if (!isAuthenticated && !isLanding) {
    return null;
  }

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
