import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  // UI state: sidebar open/closed (hamburger toggles)
  const [isOpen, setIsOpen] = useState(false);
  // Track hovered item for hover highlight without opening
  const [hovered, setHovered] = useState(null);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Chocolate Brownie palette
  const COLORS = {
    accent: "#D69055", // pill highlight
    bg: "#F2D9C5", // sidebar background
    bgAlt: "#E9D8CE", // subtle alt/hover
    brown: "#8C5A41", // mid brown
    dark: "#6F422B", // text/icons
  };

  const handleLogout = () => {
    logout(() => navigate("/"));
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "/SideBarIcons/DshBrd.png" },
    { name: "Summarize", path: "/summarize", icon: "/SideBarIcons/Sum.png" },
    { name: "Calendar", path: "/calendar", icon: "/SideBarIcons/Clndr.png" },
    { name: "Study Mode", path: "/flashcards", icon: "/SideBarIcons/StdMd.png" },
    { name: "Library", path: "/library", icon: "/SideBarIcons/Lib.png" },
    { name: "Analytics", path: "/progress", icon: "/SideBarIcons/Anl.png" },
    { name: "Music", path: "/music", icon: "/SideBarIcons/Msc.png" },
  ];
  return (
    <aside
      className={`fixed top-15 bottom-0 z-50 flex flex-col transition-all duration-300 ease-in-out`}
      style={{
        backgroundColor: COLORS.bg,
        color: COLORS.dark,
        borderRight: `1px solid ${COLORS.dark}20`,
        borderLeft: `1px solid ${COLORS.dark}10`,
        boxShadow: `0 8px 24px ${COLORS.dark}22` ,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        width: isOpen ? 260 : 64,
      }}
    >
      {/* Header with hamburger + label */}
      <div className="flex items-center px-3 py-4 min-h-[64px]">
        <button
          aria-label="Toggle menu"
          onClick={() => setIsOpen((v) => !v)}
          className="h-9 w-9 flex items-center justify-center rounded-xl overflow-hidden"
          style={{ backgroundColor: isOpen ? `${COLORS.bgAlt}80` : "transparent" }}
        >
          <img src="/SideBarIcons/Men.png" alt="Menu" className="w-7 h-7 object-contain" />
        </button>
        {isOpen && (
          <span className="ml-3 text-2xl font-semibold tracking-wide" style={{ color: COLORS.dark }}>
            Menu
          </span>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col flex-grow space-y-3">
        {menuItems.map((item, i) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={i}
              to={item.path}
              className={`group relative transition-all duration-200 select-none ${isOpen ? "px-3" : "px-0"}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {isOpen ? (
                <div
                  className={`flex items-center justify-start gap-3 py-2.5 rounded-xl`}
                  style={{
                    backgroundColor: active ? `${COLORS.accent}80` : hovered === i ? `${COLORS.accent}80` : "transparent",
                    color: active ? "#3b2a20" : COLORS.dark,
                  }}
                >
                  <span className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ lineHeight: 0, marginLeft: "6px" }}>
                    <img src={item.icon} alt={item.name} className="w-7 h-7 object-contain" />
                  </span>
                  <span className="text-base select-none">{item.name}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span
                    className="flex items-center justify-center mx-auto"
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      backgroundColor: active ? `${COLORS.accent}80` : hovered === i ? `${COLORS.accent}80` : "transparent",
                    }}
                  >
                    <img src={item.icon} alt={item.name} className="w-7 h-7 object-contain" />
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout - bottom */}
      {isAuthenticated && (
        <div className="px-2 pb-3 mt-auto">
          <button
            onClick={handleLogout}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            className={`w-full ${isOpen ? "px-2" : "px-0"} transition-all duration-200`}
          >
            {isOpen ? (
              <div
                className={`flex items-center justify-start gap-3 py-2.5 rounded-xl`}
                style={{
                  backgroundColor: logoutHovered ? `${COLORS.accent}80` : "transparent",
                  color: COLORS.dark,
                }}
              >
                <span className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ lineHeight: 0, marginLeft: "6px" }}>
                  <img src="/SideBarIcons/LgOut.png" alt="Logout" className="w-7 h-7 object-contain" />
                </span>
                <span className="text-base select-none">Log out</span>
              </div>
            ) : (
              <div className="flex items-center justify-center py-1.5">
                <span
                  className="flex items-center justify-center mx-auto"
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    backgroundColor: logoutHovered ? `${COLORS.accent}80` : "transparent",
                  }}
                >
                  <img src="/SideBarIcons/LgOut.png" alt="Logout" className="w-7 h-7 object-contain" />
                </span>
              </div>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
