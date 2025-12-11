import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopNav from "../components/TopNav";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleThemeChange = () => {
      try {
        setIsDark(localStorage.getItem("theme") === "dark");
      } catch {
        setIsDark(false);
      }
    };
    window.addEventListener("themeChanged", handleThemeChange);
    window.addEventListener("storage", handleThemeChange);
    return () => {
      window.removeEventListener("themeChanged", handleThemeChange);
      window.removeEventListener("storage", handleThemeChange);
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("No token provided");
      return;
    }
    if (!newPassword) {
      alert("Please enter a new password");
      return;
    }
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "";
      const res = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Password reset successful");
        navigate("/login");
      } else {
        alert(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      alert("Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className={`min-h-screen w-full flex items-center justify-center px-4 ${isDark ? 'bg-[#1f1b16]' : 'bg-[#F5E9DF]'}`}>
        <div className={`${isDark ? 'bg-[#2e2119]' : 'bg-[#BE8E78]'} rounded-3xl shadow-xl p-6`} style={{ width: "520px" }}>
          <h2 style={{color: isDark ? "#f5e9df" : "#FFFFFF", fontSize: "34px", marginBottom: "12px" }}>Reset Password</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%", height: "44px", paddingLeft: "10px", backgroundColor: isDark ? "#3a2a20" : "#ffffff", color: isDark ? "#f5e9df" : "#000", borderRadius: "8px", border: isDark ? "1px solid #4a3728" : "1px solid #ccc" }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", height: "44px", backgroundColor: isDark ? "#E59C5C" : "#6F422B", color: "white", borderRadius: "8px" }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
  );
}
