import Users from "../models/Users.js";
import bcrypt from "bcryptjs";

// In-memory store for reset tokens: token -> { email, expiresAt }
const pendingResets = {};

// Create a password reset token and send email via the provided sendEmail function
export async function createPasswordReset(email, sendEmail) {
  if (!email) throw { status: 400, message: "Email is required" };
  const user = await Users.findOne({ email });
  if (!user) {
    throw { status: 404, message: 'Email not found' };
  }

  const token = (Math.random().toString(36).slice(2) + Date.now().toString(36));
  const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour
  pendingResets[token] = { email, expiresAt };

  await sendEmail(email, token);
  return token;
}

// Reset password using token
export async function resetPassword(token, newPassword) {
  if (!token || !newPassword) throw { status: 400, message: "Token and new password are required" };
  const pending = pendingResets[token];
  if (!pending) throw { status: 400, message: "Invalid or expired token" };
  if (Date.now() > pending.expiresAt) {
    delete pendingResets[token];
    throw { status: 400, message: "Token expired" };
  }

  const user = await Users.findOne({ email: pending.email });
  if (!user) throw { status: 400, message: "User not found" };

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPassword, salt);
  user.password = hashed;
  await user.save();

  delete pendingResets[token];
  return user;
}

export default { createPasswordReset, resetPassword };
