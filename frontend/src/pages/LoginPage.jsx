import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import EyeIcon from "../components/EyeIcon";
import TopNav from "../components/TopNav";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
  <>
    <TopNav />

    <div
      className={`min-h-screen w-full flex items-center justify-center px-4 transition-colors duration-500 ${
        isDark ? "bg-[#1f1b16]" : "bg-[#F5E9DF]"
      }`}
    >
      {/* MAIN BOX */}
      <div
        className={`rounded-3xl shadow-xl transition-colors duration-500 ${
          isDark ? "bg-[#2e2119]" : "bg-[#BE8E78]"
        }`}
        style={{ 
          maxWidth: "1190px", 
          width: "90%",
          aspectRatio: "1190/818",
          padding: "clamp(20px, 4.2vw, 50px)",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "clamp(10px, 1.7vw, 20px)"
        }}
      >
        {/* LEFT IMAGE BOX */}
        <div
          className={`rounded-xl ${
            isDark ? "bg-[#3a2a20]" : "bg-[#D9D9D9]"
          }`}
          style={{ 
            width: "100%",
            height: "100%"
          }}
        ></div>

        {/* RIGHT FORM SECTION */}
        <div className="flex flex-col justify-center" style={{ padding: "0 clamp(5px, 1vw, 20px)" }}>
          {/* Title */}
          <h2
            className={`${isDark ? "text-[#f5e9df]" : "text-white"}`}
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 500,
              fontStyle: "italic",
              marginBottom: "clamp(8px, 1.7vh, 20px)",
            }}
          >
            Welcome Back!
          </h2>

          {/* Subtext */}
          <p
            className={`${isDark ? "text-[#f5e9df]/70" : "text-white/90"}`}
            style={{ fontSize: "clamp(14px, 1.7vw, 20px)", fontWeight: 300 }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                fontSize: "clamp(14px, 1.7vw, 20px)",
                fontWeight: 300,
                fontStyle: "italic",
                color: "#3F2BC6",
              }}
            >
              Create account
            </Link>
          </p>

          {/* FORM */}
          <form className="space-y-4" style={{ marginTop: "clamp(15px, 2vh, 24px)" }} onSubmit={onSubmit}>
            {/* Email Input */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border"
              style={{
                width: "100%",
                height: "clamp(45px, 4.6vh, 55px)",
                paddingLeft: "15px",
                fontSize: "clamp(16px, 1.7vw, 20px)",
                fontWeight: 200,
                fontStyle: "italic",
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
                  width: "100%",
                  height: "clamp(45px, 4.6vh, 55px)",
                  paddingLeft: "15px",
                  fontSize: "clamp(16px, 1.7vw, 20px)",
                  fontWeight: 200,
                  fontStyle: "italic",
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
                  width: "100%",
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
                      <span style={{ color: "#6F422B", fontSize: "14px", fontWeight: "bold" }}>
                        ✓
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      color: "white",
                      fontSize: "clamp(12px, 1.3vw, 15px)",
                      fontWeight: 300,
                      cursor: "pointer",
                    }}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    Show Password
                  </span>
                </div>
                
                {/* Forgot Password */}
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "clamp(12px, 1.3vw, 15px)",
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
                width: "100%",
                height: "clamp(45px, 4.6vh, 55px)",
                backgroundColor: "#6F422B",
                color: "white",
                borderRadius: "13px",
                fontSize: "clamp(16px, 1.7vw, 20px)",
                fontWeight: 500,
              }}
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3" style={{ marginTop: "clamp(15px, 2vh, 24px)" }}>
            <div className="flex-1 h-[1px] bg-[#6F422B]"></div>

            <span
              style={{
                fontSize: "clamp(9px, 0.9vw, 11px)",
                fontWeight: 300,
                color: "white",
              }}
            >
              or register with
            </span>

            <div className="flex-1 h-[1px] bg-[#6F422B]"></div>
          </div>

          {/* Social Buttons */}
          <div className="flex gap-4" style={{ marginTop: "clamp(15px, 2vh, 24px)" }}>
            <button
              style={{
                flex: 1,
                height: "clamp(45px, 4.6vh, 55px)",
                backgroundColor: "#6F422B",
                color: "#F7F7F7",
                fontSize: "clamp(16px, 1.7vw, 20px)",
                fontWeight: 200,
                borderRadius: "13px",
              }}
            >
              Google
            </button>

            <button
              style={{
                flex: 1,
                height: "clamp(45px, 4.6vh, 55px)",
                backgroundColor: "#6F422B",
                color: "#F7F7F7",
                fontSize: "clamp(16px, 1.7vw, 20px)",
                fontWeight: 200,
                borderRadius: "13px",
              }}
            >
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
}