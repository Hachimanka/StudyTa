import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import Leftpic from "../assets/Leftpic.svg";
import { useModal } from "../context/ModalContext";

export default function Signup() {
  const { showModal } = useModal();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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
      showModal("All fields are required!", "Input Required", "warning");
      return;
    }
    if (!agreeTerms) {
      showModal("You must agree to the Terms & Conditions!", "Terms Required", "warning");
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
        showModal(data.message || 'Verification email sent. Please check your inbox.', 'Success', 'success');
        navigate('/login');
      } else {
        showModal(data.message || 'Registration failed', 'Error', 'error');
      }
    } catch (err) {
      showModal('Registration error', 'Error', 'error');
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
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTermsModal(true);
                      }}
                      style={{
                        color: "#3F2BC6",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Terms & Conditions
                    </span>
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

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowTermsModal(false)}
        >
          <div
            style={{
              backgroundColor: isDark ? "#2e2119" : "#F5E9DF",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                backgroundColor: isDark ? "#3a2a20" : "#BE8E78",
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  color: isDark ? "#f5e9df" : "white",
                  fontSize: "22px",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Terms & Conditions
              </h2>
              <button
                onClick={() => setShowTermsModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: isDark ? "#f5e9df" : "white",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "0",
                  lineHeight: "1",
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div
              style={{
                padding: "24px",
                overflowY: "auto",
                maxHeight: "calc(80vh - 140px)",
                color: isDark ? "#f5e9df" : "#4a3728",
                fontSize: "14px",
                lineHeight: "1.7",
              }}
            >
              <p style={{ marginBottom: "16px" }}>
                <strong>Last Updated:</strong> December 11, 2025
              </p>

              <p style={{ marginBottom: "16px" }}>
                Welcome to StudyTa! By creating an account and using our platform, you agree to the following Terms & Conditions. Please read them carefully before proceeding.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 600, marginTop: "20px", marginBottom: "10px", color: isDark ? "#d4a574" : "#6F422B" }}>
                1. Acceptance of Terms
              </h3>
              <p style={{ marginBottom: "16px" }}>
                By accessing or using StudyTa, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you may not use our services.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 600, marginTop: "20px", marginBottom: "10px", color: isDark ? "#d4a574" : "#6F422B" }}>
                2. Account Registration
              </h3>
              <p style={{ marginBottom: "16px" }}>
                To use certain features of StudyTa, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 600, marginTop: "20px", marginBottom: "10px", color: isDark ? "#d4a574" : "#6F422B" }}>
                3. User Conduct
              </h3>
              <p style={{ marginBottom: "16px" }}>
                You agree not to use StudyTa for any unlawful purpose or in any way that could damage, disable, or impair the platform. You shall not upload, share, or distribute any content that is offensive, harmful, or violates the rights of others. Academic integrity is paramount — do not use our platform to facilitate cheating or plagiarism.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 600, marginTop: "20px", marginBottom: "10px", color: isDark ? "#d4a574" : "#6F422B" }}>
                4. Intellectual Property
              </h3>
              <p style={{ marginBottom: "16px" }}>
                All content, features, and functionality of StudyTa, including but not limited to text, graphics, logos, and software, are the exclusive property of StudyTa and are protected by copyright, trademark, and other intellectual property laws. You retain ownership of any content you upload but grant StudyTa a license to use it for providing our services.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 600, marginTop: "20px", marginBottom: "10px", color: isDark ? "#d4a574" : "#6F422B" }}>
                5. Privacy Policy
              </h3>
              <p style={{ marginBottom: "16px" }}>
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy. By using StudyTa, you consent to the collection and use of your information as described therein. We do not sell your personal data to third parties.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 600, marginTop: "20px", marginBottom: "10px", color: isDark ? "#d4a574" : "#6F422B" }}>
                6. Service Availability
              </h3>
              <p style={{ marginBottom: "16px" }}>
                StudyTa strives to provide uninterrupted access to our services. However, we do not guarantee that the platform will be available at all times. We reserve the right to modify, suspend, or discontinue any part of the service without prior notice.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 600, marginTop: "20px", marginBottom: "10px", color: isDark ? "#d4a574" : "#6F422B" }}>
                7. Limitation of Liability
              </h3>
              <p style={{ marginBottom: "16px" }}>
                StudyTa and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability shall not exceed the amount you paid for using our services, if any.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 600, marginTop: "20px", marginBottom: "10px", color: isDark ? "#d4a574" : "#6F422B" }}>
                8. Termination
              </h3>
              <p style={{ marginBottom: "16px" }}>
                We reserve the right to terminate or suspend your account at any time, without prior notice, for conduct that we believe violates these Terms & Conditions or is harmful to other users, us, or third parties. Upon termination, your right to use the platform will immediately cease.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 600, marginTop: "20px", marginBottom: "10px", color: isDark ? "#d4a574" : "#6F422B" }}>
                9. Changes to Terms
              </h3>
              <p style={{ marginBottom: "16px" }}>
                StudyTa reserves the right to modify these Terms & Conditions at any time. We will notify users of significant changes via email or through the platform. Continued use of StudyTa after such modifications constitutes your acceptance of the updated terms.
              </p>

              <h3 style={{ fontSize: "16px", fontWeight: 600, marginTop: "20px", marginBottom: "10px", color: isDark ? "#d4a574" : "#6F422B" }}>
                10. Contact Us
              </h3>
              <p style={{ marginBottom: "16px" }}>
                If you have any questions about these Terms & Conditions, please contact us at support@studyta.com.
              </p>

              <p style={{ marginTop: "24px", fontStyle: "italic", opacity: 0.8 }}>
                By clicking "I agree" and creating an account, you confirm that you have read, understood, and agree to these Terms & Conditions.
              </p>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: `1px solid ${isDark ? "#3a2a20" : "#d3b49b"}`,
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setShowTermsModal(false)}
                style={{
                  padding: "10px 24px",
                  backgroundColor: isDark ? "#3a2a20" : "#d3b49b",
                  color: isDark ? "#f5e9df" : "#4a3728",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAgreeTerms(true);
                  setShowTermsModal(false);
                }}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#6F422B",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}