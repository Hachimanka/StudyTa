import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopNav from "../components/TopNav";
import { useModal } from "../context/ModalContext";

export default function ResetPassword() {
  const { showModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showModal("No token provided", "Error", "error");
      return;
    }
    if (!newPassword) {
      showModal("Please enter a new password", "Input Required", "warning");
      return;
    }
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "";
      const res = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showModal(data.message || "Password reset successful", "Success", "success");
        navigate("/login");
      } else {
        showModal(data.message || "Failed to reset password", "Error", "error");
      }
    } catch (err) {
      console.error(err);
      showModal("Error resetting password", "Error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen w-full flex items-center justify-center px-4">
        <div className="bg-[#BE8E78] rounded-3xl shadow-xl p-6" style={{ width: "520px" }}>
          <h2 style={{color: "#FFFFFF", fontSize: "34px", marginBottom: "12px" }}>Reset Password</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: "100%", height: "44px", paddingLeft: "10px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", height: "44px", backgroundColor: "#6F422B", color: "white", borderRadius: "8px" }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
  );
}
