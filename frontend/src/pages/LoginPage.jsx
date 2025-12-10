import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Leftpic from "../assets/Leftpic.svg";

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifiedMsg, setVerifiedMsg] = useState("");

  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onThemeChanged = () => {
      setIsDark(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("themeChanged", onThemeChanged);
    window.addEventListener("storage", onThemeChanged);
    return () => {
      window.removeEventListener("themeChanged", onThemeChanged);
      window.removeEventListener("storage", onThemeChanged);
    };
  }, []);

  // Show a friendly message if redirected after email verification
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verified") === "1") {
      setVerifiedMsg("Your email is verified. Please sign in.");
    }
  }, [location.search]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("All fields are required!");
      return;
    }
    setLoading(true);
    await login(email, password, () => {
      setLoading(false);
      navigate("/dashboard");
    });
    setLoading(false);
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center px-4 transition-colors duration-500 ${
        isDark ? "bg-[#1f1b16]" : "bg-[#F5E9DF]"
      }`}
    >
      {/* MAIN BOX */}
      <div
        className={`rounded-3xl shadow-xl grid grid-cols-2 gap-2 transition-colors duration-500 ${
          isDark ? "bg-[#2e2119]" : "bg-[#BE8E78]"
        }`}
        style={{ width: "700px", height: "580px", padding: "12px" }}
      >
        {/* LEFT IMAGE BOX */}
        <div
          className={`rounded-xl overflow-hidden ${
            isDark ? "bg-[#3a2a20]" : "bg-[#D9D9D9]"
          }`}
          style={{ width: "300px", height: "556px" }}
        >
          <img 
            src={Leftpic}
            alt="Decoration" 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover" 
            }}
          />
        </div>

        {/* RIGHT FORM SECTION */}
        <div className="flex flex-col justify-center" style={{ marginTop: "-20px" }}>
          {verifiedMsg && (
            <div
              style={{
                backgroundColor: "#3F2BC6",
                color: "white",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "12px",
                marginBottom: "10px",
              }}
            >
              {verifiedMsg}
            </div>
          )}
          {/* Title */}
          <h2
            className={`${isDark ? "text-[#f5e9df]" : "text-white"}`}
            style={{
              fontSize: "30px",
              fontWeight: 500,
              marginBottom: "12px",
            }}
          >
            Welcome Back!
          </h2>

          {/* Subtext */}
          <p
            className={`${isDark ? "text-[#f5e9df]/70" : "text-white/90"}`}
            style={{ fontSize: "14px", fontWeight: 300 }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                fontSize: "14px",
                fontWeight: 300,
                fontStyle: "italic",
                color: "#3F2BC6",
              }}
            >
              Create account
            </Link>
          </p>

          {/* FORM */}
          <form className="space-y-4 mt-6" onSubmit={onSubmit}>
            {/* Email Input */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border"
              style={{
                width: "300px",
                height: "42px",
                paddingLeft: "10px",
                fontSize: "14px",
                fontWeight: 200,
                color: "#796060",
                backgroundColor: isDark ? "#3a2a20" : "white",
                borderColor: "#d3b49b",
                outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "#6F422B"}
              onBlur={(e) => e.target.style.borderColor = "#d3b49b"}
            />

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border"
                style={{
                  width: "300px",
                  height: "42px",
                  paddingLeft: "10px",
                  fontSize: "14px",
                  fontWeight: 200,
                  color: "#796060",
                  backgroundColor: isDark ? "#3a2a20" : "white",
                  borderColor: "#d3b49b",
                  outline: "none",
                }}
                onFocus={(e) => e.target.style.borderColor = "#6F422B"}
                onBlur={(e) => e.target.style.borderColor = "#d3b49b"}
              />
              {/* SHOW PASSWORD BOX - Below input, aligned with Forgot Password */}
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  width: "300px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      width: "20px",
                      height: "20px",
                      border: isDark ? "1px solid #f5e9df" : "1px solid white",
                      backgroundColor: showPassword ? "white" : "transparent",
                      cursor: "pointer",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showPassword && (
                      <span style={{ color: "#6F422B", fontSize: "11px", fontWeight: "bold" }}>
                        ✓
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      color: "white",
                      fontSize: "11px",
                      fontWeight: 300,
                      cursor: "pointer",
                    }}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    Show Password
                  </span>
                </div>
                {/* Forgot Password moved here */}
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "11px",
                    color: "#3F2BC6",
                    fontWeight: 300,
                  }}
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "300px",
                height: "42px",
                backgroundColor: "#6F422B",
                color: "white",
                borderRadius: "13px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}