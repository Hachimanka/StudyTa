import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import Leftpic from "../assets/Leftpic.svg";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
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
  const [verifyInfo, setVerifyInfo] = useState(null);

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
    if (!name || !email || !password) {
      alert("All fields are required!");
      return;
    }
    if (!agreeTerms) {
      alert("You must agree to the Terms & Conditions!");
      return;
    }
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.debugVerifyUrl) setVerifyInfo({ url: data.debugVerifyUrl });
        alert(data.message || 'Verification email sent. Please check your inbox.');
        navigate('/login');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert('Registration error');
    } finally {
      setLoading(false);
    }
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
          {/* Title */}
          <h2
            className={`${isDark ? "text-[#f5e9df]" : "text-white"}`}
            style={{
              fontSize: "30px",
              fontWeight: 500,
              marginBottom: "16px",
            }}
          >
            Create an account
          </h2>

          {/* Subtext */}
          <p
            className={`${isDark ? "text-[#f5e9df]/70" : "text-white/90"}`}
            style={{ fontSize: "14px", fontWeight: 300 }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                fontSize: "14px",
                fontWeight: 300,
                fontStyle: "italic",
                color: "#3F2BC6",
              }}
            >
              Login
            </Link>
          </p>

          {/* FORM */}
          <form className="space-y-4 mt-6" onSubmit={onSubmit}>
            {verifyInfo?.url && (
              <div style={{ backgroundColor: '#3F2BC6', color: 'white', borderRadius: '8px', padding: '8px 12px', fontSize: '12px' }}>
                Dev verify link: <a href={verifyInfo.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: 'white' }}>{verifyInfo.url}</a>
              </div>
            )}
            {/* First Name and Last Name - Side by Side */}
            <div style={{ display: "flex", gap: "14px" }}>
              <input
                type="text"
                placeholder="First name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border"
                style={{
                  width: "140px",
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

              <input
                type="text"
                placeholder="Last name"
                className="rounded-md border"
                style={{
                  width: "140px",
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
            </div>

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
            <div>
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

              {/* SHOW PASSWORD AND TERMS - Single Line */}
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  width: "300px",
                }}
              >
                {/* Show Password */}
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      width: "16px",
                      height: "16px",
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
                      fontSize: "10px",
                      fontWeight: 300,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    Show Password
                  </span>
                </div>

                {/* Terms & Conditions */}
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div
                    onClick={() => setAgreeTerms((v) => !v)}
                    style={{
                      width: "16px",
                      height: "16px",
                      border: isDark ? "1px solid #f5e9df" : "1px solid white",
                      backgroundColor: agreeTerms ? "white" : "transparent",
                      cursor: "pointer",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {agreeTerms && (
                      <span style={{ color: "#6F422B", fontSize: "11px", fontWeight: "bold" }}>
                        ✓
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      color: "white",
                      fontSize: "10px",
                      fontWeight: 300,
                      whiteSpace: "nowrap",
                    }}
                  >
                    I agree on{" "}
                    <Link
                      to="/terms"
                      style={{
                        color: "#3F2BC6",
                        textDecoration: "underline",
                      }}
                    >
                      Terms & Conditions
                    </Link>
                  </span>
                </div>
              </div>
            </div>

            {/* Create Account Button */}
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
                marginTop: "12px",
              }}
            >
              {loading ? "Creating Account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}