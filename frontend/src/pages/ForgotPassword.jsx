import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

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
    alert('If this email exists, a reset link was sent (mock)') 
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
          Reset Password
        </h2>
        <p
          className={`mb-6 transition-colors duration-300 ${
            isDark ? "text-[#f5e9df]/70" : "text-[#5C4333]"
          }`}
        >
          Enter your email and we'll send reset instructions.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
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
            Send Reset Link
          </button>
        </form>
        <p
          className={`text-center mt-6 transition-colors duration-300 ${
            isDark ? "text-[#f5e9df]/70" : "text-[#5C4333]"
          }`}
        >
          Remembered?{' '}
          <Link
            to="/login"
            className={`font-semibold transition-colors duration-300 ${
              isDark ? "text-[#E59C5C] hover:text-[#e6b97d]" : "text-[#E59C5C] hover:text-[#d68a47]"
            }`}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
