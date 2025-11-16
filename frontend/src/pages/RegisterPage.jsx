import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import EyeIcon from "../components/EyeIcon.jsx";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });
  const { signup } = useAuth();
  const navigate = useNavigate();

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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      alert("All fields are required!");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    await signup(name, email, password, () => {
      setLoading(false);
      alert("Registration started! Please check your email and verify your account before logging in.");
      navigate("/login");
    });
    setLoading(false);
  };

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
          Create Account
        </h2>
        <p
          className={`mb-6 transition-colors duration-300 ${
            isDark ? "text-[#f5e9df]/70" : "text-[#5C4333]"
          }`}
        >
          Join us today
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border transition-colors duration-300 ${
              isDark
                ? "bg-[#3a2a20] border-[#4a3a30] text-[#f5e9df] placeholder-[#f5e9df]/50"
                : "bg-[#F2D9C7] border-[#E6C8B1] text-[#4A2C1E] placeholder-[#5C4333]"
            }`}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border transition-colors duration-300 ${
              isDark
                ? "bg-[#3a2a20] border-[#4a3a30] text-[#f5e9df] placeholder-[#f5e9df]/50"
                : "bg-[#F2D9C7] border-[#E6C8B1] text-[#4A2C1E] placeholder-[#5C4333]"
            }`}
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border transition-colors duration-300 ${
                isDark
                  ? "bg-[#3a2a20] border-[#4a3a30] text-[#f5e9df] placeholder-[#f5e9df]/50"
                  : "bg-[#F2D9C7] border-[#E6C8B1] text-[#4A2C1E] placeholder-[#5C4333]"
              }`}
              style={{ paddingRight: 32 }}
            />
            <EyeIcon visible={showPassword} onClick={() => setShowPassword((v) => !v)} />
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border transition-colors duration-300 ${
                isDark
                  ? "bg-[#3a2a20] border-[#4a3a30] text-[#f5e9df] placeholder-[#f5e9df]/50"
                  : "bg-[#F2D9C7] border-[#E6C8B1] text-[#4A2C1E] placeholder-[#5C4333]"
              }`}
              style={{ paddingRight: 32 }}
            />
            <EyeIcon visible={showConfirmPassword} onClick={() => setShowConfirmPassword((v) => !v)} />
          </div>

          <button
            type="submit"
            className={`w-full font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
              isDark
                ? "bg-[#E59C5C] text-[#1f1b16] hover:bg-[#e6b97d]"
                : "bg-[#E59C5C] text-white hover:bg-[#d68a47]"
            }`}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {loading && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span
              className="loader"
              style={{
                display: "inline-block",
                width: 32,
                height: 32,
                border: `4px solid ${isDark ? "#4a3a30" : "#E6C8B1"}`,
                borderTop: `4px solid #E59C5C`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></span>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          <button
            className={`font-medium px-4 py-2 rounded-lg border transition-colors duration-300 ${
              isDark
                ? "bg-[#3a2a20] border-[#4a3a30] text-[#f5e9df] hover:bg-[#4a3a30]"
                : "bg-white border-[#E6C8B1] text-[#4A2C1E] hover:bg-[#F2D9C7]"
            }`}
          >
            Continue with Google
          </button>
          <button
            className={`font-medium px-4 py-2 rounded-lg border transition-colors duration-300 ${
              isDark
                ? "bg-[#3a2a20] border-[#4a3a30] text-[#f5e9df] hover:bg-[#4a3a30]"
                : "bg-white border-[#E6C8B1] text-[#4A2C1E] hover:bg-[#F2D9C7]"
            }`}
          >
            Continue with other accounts
          </button>
        </div>

        <p
          className={`text-center mt-6 transition-colors duration-300 ${
            isDark ? "text-[#f5e9df]/70" : "text-[#5C4333]"
          }`}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className={`font-semibold transition-colors duration-300 ${
              isDark ? "text-[#E59C5C] hover:text-[#e6b97d]" : "text-[#E59C5C] hover:text-[#d68a47]"
            }`}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
