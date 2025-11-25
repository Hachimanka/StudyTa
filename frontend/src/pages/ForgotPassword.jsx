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
          className={`rounded-3xl shadow-xl grid grid-cols-2 gap-2 transition-colors duration-500 ${
            isDark ? "bg-[#2e2119]" : "bg-[#BE8E78]"
          }`}
          style={{ width: "1190px", height: "818px", padding: "50px" }}
        >
          {/* LEFT IMAGE BOX */}
          <div
            className={`rounded-xl ${
              isDark ? "bg-[#3a2a20]" : "bg-[#D9D9D9]"
            }`}
            style={{ width: "505px", height: "718px" }}
          ></div>

          {/* RIGHT FORM SECTION */}
          <div className="flex flex-col justify-center" style={{ marginTop: "-80px" }}>
            {/* Title */}
            <h2
              className={`${isDark ? "text-[#f5e9df]" : "text-white"}`}
              style={{
                fontSize: "48px",
                fontWeight: 500,
                fontStyle: "italic",
                marginBottom: "20px",
              }}
            >
              Forgot password
            </h2>

            {/* Subtext */}
            <p
              className={`${isDark ? "text-[#f5e9df]/70" : "text-white/90"}`}
              style={{ fontSize: "20px", fontWeight: 300 }}
            >
              Remembered?{" "}
              <Link
                to="/login"
                style={{
                  fontSize: "20px",
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: "#3F2BC6",
                }}
              >
                Sign in
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
                  width: "554px",
                  height: "55px",
                  paddingLeft: "15px",
                  fontSize: "20px",
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
                  width: "554px",
                  height: "55px",
                  backgroundColor: "#6F422B",
                  color: "white",
                  borderRadius: "13px",
                  fontSize: "20px",
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