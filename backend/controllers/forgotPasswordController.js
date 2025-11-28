import * as passwordResetService from "../services/passwordResetService.js";
import * as emailService from "../services/emailService.js";

export async function requestReset(req, res) {
  try {
    const { email } = req.body;
    await passwordResetService.createPasswordReset(email, emailService.sendPasswordResetEmail);
    // Always return success to avoid leaking which emails exist
    res.status(200).json({ message: "If this email exists, a reset link was sent" });
  } catch (err) {
    console.error("requestReset error:", err);
    const status = err && err.status ? err.status : 500;
    const message = err && err.message ? err.message : "Internal server error";
    res.status(status).json({ message });
  }
}

export async function reset(req, res) {
  try {
    const { token, newPassword } = req.body;
    await passwordResetService.resetPassword(token, newPassword);
    res.status(200).json({ message: "Password has been reset" });
  } catch (err) {
    console.error("reset error:", err);
    const status = err && err.status ? err.status : 500;
    const message = err && err.message ? err.message : "Internal server error";
    res.status(status).json({ message });
  }
}

export default { requestReset, reset };
