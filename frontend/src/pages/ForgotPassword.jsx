import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import TopNav from "../components/TopNav";

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
              Forgot password
            </h2>

            {/* Subtext */}
            <p
              className={`${isDark ? "text-[#f5e9df]/70" : "text-white/90"}`}
              style={{ fontSize: "clamp(14px, 1.7vw, 20px)", fontWeight: 300 }}
            >
              Remembered?{" "}
              <Link
                to="/login"
                style={{
                  fontSize: "clamp(14px, 1.7vw, 20px)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: "#3F2BC6",
                }}
              >
                Sign in
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

              {/* Send Code Button */}
              <button
                type="submit"
                style={{
                  width: "100%",
                  height: "clamp(45px, 4.6vh, 55px)",
                  backgroundColor: "#6F422B",
                  color: "white",
                  borderRadius: "13px",
                  fontSize: "clamp(16px, 1.7vw, 20px)",
                  fontWeight: 500,
                  marginTop: "16px",
                }}
              >
                Send Code
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}