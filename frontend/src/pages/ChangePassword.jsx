import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ChangePassword(){
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });
  const navigate = useNavigate()

  useEffect(() => {
    const onThemeChanged = () => {
      try {
        setIsDark(localStorage.getItem("theme") === "dark");
      } catch {
        setIsDark(false);
      }
    };

    window.addEventListener("themeChanged", onThemeChanged);
    window.addEventListener("storage", onThemeChanged);

    return () => {
      window.removeEventListener("themeChanged", onThemeChanged);
      window.removeEventListener("storage", onThemeChanged);
    };
  }, []);

  const onSubmit = (e) => {
    e.preventDefault()
    if(password.length < 6){ alert('Password must be at least 6 characters'); return }
    if(password !== confirm){ alert('Passwords do not match'); return }
    alert('Password changed (mock)')
    navigate('/dashboard')
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDark ? "bg-[#1f1b16]" : "bg-[#F2D9C7]"
      }`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-lg transition-colors duration-500 ${
          isDark
            ? "bg-[#2e2119] border border-[#3a2a20]"
            : "bg-white border border-[#E6C8B1]"
        }`}
      >
        <h2
          className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
            isDark ? "text-[#f5e9df]" : "text-[#4A2C1E]"
          }`}
        >
          Change Password
        </h2>
        <p
          className={`mb-6 transition-colors duration-300 ${
            isDark ? "text-[#f5e9df]/70" : "text-[#5C4333]"
          }`}
        >
          Set a new password for your account.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="New password"
            className={`w-full px-4 py-2 rounded-lg border transition-colors duration-300 ${
              isDark
                ? "bg-[#3a2a20] border-[#4a3a30] text-[#f5e9df] placeholder-[#f5e9df]/50"
                : "bg-[#F2D9C7] border-[#E6C8B1] text-[#4A2C1E] placeholder-[#5C4333]"
            }`}
          />
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className={`w-full px-4 py-2 rounded-lg border transition-colors duration-300 ${
              isDark
                ? "bg-[#3a2a20] border-[#4a3a30] text-[#f5e9df] placeholder-[#f5e9df]/50"
                : "bg-[#F2D9C7] border-[#E6C8B1] text-[#4A2C1E] placeholder-[#5C4333]"
            }`}
          />
          <button
            className={`w-full font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
              isDark
                ? "bg-[#E59C5C] text-[#1f1b16] hover:bg-[#e6b97d]"
                : "bg-[#E59C5C] text-white hover:bg-[#d68a47]"
            }`}
            type="submit"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  )
}
