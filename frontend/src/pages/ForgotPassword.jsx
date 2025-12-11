import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Leftpic from "../assets/Leftpic.svg";

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState(() => {
    try {
      const v = localStorage.getItem('studyta_fp_cooldown_until')
      return v ? Number(v) : 0
    } catch { return 0 }
  })
  const [now, setNow] = useState(Date.now())
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

    const t = setInterval(() => setNow(Date.now()), 1000)

    return () => {
      window.removeEventListener("themeChanged", onThemeChanged);
      window.removeEventListener("storage", onThemeChanged);
      clearInterval(t)
    };
  }, []);

  const onSubmit = async (e) => { 
    e.preventDefault();
    if (!email) {
      alert('Please enter your email');
      return;
    }
    if (cooldownUntil && Date.now() < cooldownUntil) {
      return; // still in cooldown, do nothing
    }
    try {
      setSubmitting(true)
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const res = await fetch(`${API_BASE}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Reset link sent to your email');
        // set 5 minutes cooldown
        const until = Date.now() + 5 * 60 * 1000;
        setCooldownUntil(until)
        try { localStorage.setItem('studyta_fp_cooldown_until', String(until)) } catch {}
      } else {
        alert(data.message || 'Failed to send reset link');
      }
    } catch (err) {
      console.error(err);
      alert('Error sending reset link');
    } finally {
      setSubmitting(false)
    }
  }

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
              fontStyle: "italic",
              marginBottom: "12px",
            }}
          >
            Forgot password
          </h2>

          {/* Subtext */}
          <p
            className={`${isDark ? "text-[#f5e9df]/70" : "text-white/90"}`}
            style={{ fontSize: "14px", fontWeight: 300 }}
          >
            Remembered?{" "}
            <Link
              to="/login"
              style={{
                fontSize: "14px",
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
                width: "300px",
                height: "42px",
                paddingLeft: "10px",
                fontSize: "14px",
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
              disabled={submitting || (cooldownUntil && now < cooldownUntil)}
              style={{
                width: "300px",
                height: "42px",
                backgroundColor: submitting || (cooldownUntil && now < cooldownUntil) ? "#8b6b59" : "#6F422B",
                color: "white",
                borderRadius: "13px",
                fontSize: "14px",
                fontWeight: 500,
                marginTop: "12px",
              }}
            >
              {submitting ? 'Sending...' : (cooldownUntil && now < cooldownUntil ? `Resend in ${Math.ceil((cooldownUntil - now)/1000)}s` : 'Send Code')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}