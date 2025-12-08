import bcrypt from "bcryptjs";
import Users from "../models/Users.js";

// In-memory pending verification store. Replace with DB in production.
const pendingVerifications = {};

export async function register(name, email, password, sendVerification) {
  if (!name || !email || !password) {
    throw { status: 400, message: "All fields are required" };
  }

  const existing = await Users.findOne({ email });
  if (existing) {
    throw { status: 400, message: "User already exists" };
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  // Generate token
  const token = (Math.random().toString(36).slice(2) + Date.now().toString(36));
  pendingVerifications[token] = { name, email, password: hashed };

  // sendVerification is a function that sends email (injected for testability)
  await sendVerification(email, token);

  return token;
}

export async function verifyToken(token) {
  const pending = pendingVerifications[token];
  if (!pending) {
    throw { status: 400, message: "Invalid or expired verification token" };
  }

  // Create user
  const newUser = new Users({ name: pending.name, email: pending.email, password: pending.password });
  await newUser.save();

  // Optionally create UserInfo document
  try {
    const UserInfo = (await import("../models/UserInfo.js")).default;
    await UserInfo.create({ userId: newUser._id, fullName: pending.name });
  } catch (e) {
    console.warn("Failed to create UserInfo during verification:", e.message);
  }

  // Clean up
  delete pendingVerifications[token];
  return newUser;
}

export default { register, verifyToken };
