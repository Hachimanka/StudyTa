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

  // State to hold the fetched profile image URL
  const [fetchedAvatarUrl, setFetchedAvatarUrl] = useState(null);

  // Fetch profile data on mount and when profile updates
  useEffect(() => {
    const fetchProfileAvatar = async () => {
      try {
        // First check localStorage for immediate update
        const raw = localStorage.getItem("stuyta_user");
        if (raw) {
          const parsed = JSON.parse(raw);
          const localAvatar = parsed?.profile?.profileImageUrl || parsed?.avatarUrl || parsed?.profileImageUrl;
          if (localAvatar) {
            setFetchedAvatarUrl(localAvatar);
          }
        }
        
        // Then fetch from API for the most accurate data
        const userId = user?._id;
        if (userId) {
          const API_BASE = import.meta.env.VITE_API_BASE || '';
          const res = await fetch(`${API_BASE}/api/profile/${userId}`);
          if (res.ok) {
            const data = await res.json();
            const avatarFromApi = data?.profile?.profileImageUrl || data?.user?.profileImageUrl;
            if (avatarFromApi) {
              setFetchedAvatarUrl(avatarFromApi);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to fetch profile avatar:', e);
      }
    };
    
    fetchProfileAvatar();
  }, [user?._id]);

  // Add a new effect to refresh avatar when profile updates
  useEffect(() => {
    const handleProfileUpdate = async () => {
      setForceUpdate((prev) => prev + 1);
      
      // Re-fetch avatar URL after profile update with a small delay to ensure DB is updated
      setTimeout(async () => {
        try {
          // Check localStorage first (updated by profileSection.jsx)
          const raw = localStorage.getItem("stuyta_user");
          if (raw) {
            const parsed = JSON.parse(raw);
            const localAvatar = parsed?.profile?.profileImageUrl || parsed?.avatarUrl || parsed?.profileImageUrl;
            if (localAvatar) {
              setFetchedAvatarUrl(localAvatar);
              return;
            }
          }
          
          // Fallback to API fetch
          const userId = user?._id;
          if (userId) {
            const API_BASE = import.meta.env.VITE_API_BASE || '';
            const res = await fetch(`${API_BASE}/api/profile/${userId}`);
            if (res.ok) {
              const data = await res.json();
              const avatarFromApi = data?.profile?.profileImageUrl || data?.user?.profileImageUrl;
              if (avatarFromApi) {
                setFetchedAvatarUrl(avatarFromApi);
              }
            }
          }
        } catch (e) {
          console.warn('Failed to refresh avatar:', e);
        }
      }, 100);
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user?._id]);

  // Update the useMemo to prioritize freshly updated data
  const { displayName, initial, avatarUrl } = useMemo(() => {
    let parsedStorage = null;
    try {
      const raw = localStorage.getItem("stuyta_user") || localStorage.getItem("studytA_user") || localStorage.getItem("user");
      if (raw) parsedStorage = JSON.parse(raw);
    } catch {
      parsedStorage = null;
    }

    const nameFromUser = user?.name || user?.fullName || null;
    const nameFromStorage = parsedStorage?.name || parsedStorage?.fullName || null;
    const usernameCandidate = user?.profile?.username || user?.username || parsedStorage?.profile?.username || parsedStorage?.username || null;
    
    const name = usernameCandidate || nameFromUser || nameFromStorage || user?.email || "Account";
    // Use email's first letter for the avatar placeholder (consistent across the app)
    const email = user?.email || parsedStorage?.email || null;
    const init = email ? email.charAt(0).toUpperCase() : (name?.trim?.()?.[0] || "U").toUpperCase();

    let avatar = null;
    
    // FIRST: Check fetchedAvatarUrl (from API fetch, most reliable)
    if (fetchedAvatarUrl) {
      avatar = fetchedAvatarUrl;
    }
    // Check user object (from AuthContext)
    else if (user?.profile?.profileImageUrl) {
      avatar = user.profile.profileImageUrl;
    } else if (user?.profileImageUrl) {
      avatar = user.profileImageUrl;
    } else if (user?.avatarUrl) {
      avatar = user.avatarUrl;
    } else if (user?.avatar) {
      avatar = user.avatar;
    }
    
    // Then check localStorage
    if (!avatar && parsedStorage) {
      if (parsedStorage.profile?.profileImageUrl) {
        avatar = parsedStorage.profile.profileImageUrl;
      } else if (parsedStorage.profileImageUrl) {
        avatar = parsedStorage.profileImageUrl;
      } else if (parsedStorage.avatarUrl) {
        avatar = parsedStorage.avatarUrl;
      } else if (parsedStorage.avatar) {
        avatar = parsedStorage.avatar;
      }
    }
    
    // If avatar is a relative path (doesn't start with http or /), resolve it against API base
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      if (avatar && !avatar.startsWith('http') && !avatar.startsWith('/')) {
        const cleaned = avatar.replace(/^\.\//, '').replace(/^\//, '');
        avatar = API_BASE ? `${API_BASE.replace(/\/$/, '')}/${cleaned}` : `/${cleaned}`;
      }
    } catch (e) {
      // If import.meta is not available for some reason, just keep avatar as-is
    }
    
    return { displayName: name, initial: init, avatarUrl: avatar };
  }, [user, forceUpdate, fetchedAvatarUrl]);

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

  const bioText =
    user?.profile?.bio ||
    user?.bio ||
    user?.about ||
    (() => {
      try {
        const raw = localStorage.getItem('stuyta_user') || localStorage.getItem('studytA_user') || localStorage.getItem('user');
        if (!raw) return '';
        const parsed = JSON.parse(raw);
        return parsed?.profile?.bio || parsed?.bio || '';
      } catch (_) {
        return '';
      }
    })();

  // Authenticated Topbar UI (after login)
  if (isAuthenticated) {
    return (
      <nav className="sticky top-0 w-full h-15 bg-[#845845] shadow-sm z-50">
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
                  key={avatarUrl}
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
                        key={avatarUrl}
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
                  <p className="italic text-sm text-[#FFFFFF] mt-2 mb-4 line-clamp-2 max-w-[13rem] text-center">
                    {bioText || 'No bio provided'}
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

  // NOT authenticated - show simple nav with logo and theme toggle for ALL pages
  return (
    <nav
      className={`shadow-md transition-all duration-500 ${
        isDark ? "bg-[#2e2119]" : "bg-[#845C47]"
      }`}
    >
      <div className="relative w-full flex items-center" style={{ minHeight: '56px' }}>
        {/* Logo */}
        <div className="absolute left-0 flex items-center space-x-3 pl-3 md:pl-4 lg:pl-5 h-full">
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

        {/* Nav Links - only show on landing page */}
        {isLanding && (
          <div className="hidden md:flex space-x-8 mx-auto justify-center w-full">
            {[
              { label: "Home", hash: "home" },
              { label: "How it Works", hash: "how-it-works" },
              { label: "Features", hash: "features" },
              { label: "About", hash: "about" }
            ].map((item) => (
              <a
                key={item.label}
                href={`#${item.hash}`}
                className={`transition-all duration-300 font-regular ${
                  isDark
                    ? "text-[#f5e9df] hover:text-[#e6b97d]"
                    : "text-[#FDF3EA] hover:text-[#E59C5C]"
                }`}
                onClick={e => {
                  e.preventDefault();
                  const el = document.getElementById(item.hash);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}

        {/* Right Side - only show on landing page */}
        {isLanding && (
          <div className="absolute right-0 flex items-center space-x-2 pr-3 md:pr-4 lg:pr-5 h-full">
            <Link
              to="/register"
              className={`px-8 py-2 rounded-full font-medium border transition-all duration-300 ${
                isDark
                  ? "border-[#f5e9df] text-[#f5e9df] hover:bg-[#3a2a20]"
                  : "border-[#FDF3EA] text-[#FDF3EA] hover:bg-[#A4714D]/40"
              }`}
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className={`px-8 py-2 rounded-full font-medium transition-all duration-300 ${
                isDark
                  ? "bg-[#E59C5C] text-[#1f1b16] hover:bg-[#e6b97d]"
                  : "bg-[#E59C5C] text-white hover:bg-[#d68a47]"
              }`}
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}