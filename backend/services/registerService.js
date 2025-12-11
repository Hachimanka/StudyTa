import bcrypt from "bcryptjs";
import Users from "../models/Users.js";
import EmailVerification from "../models/EmailVerification.js";

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

  // Generate token and store in DB with expiry (24 hours)
  const token = (Math.random().toString(36).slice(2) + Date.now().toString(36));
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await EmailVerification.create({ token, name, email, passwordHash: hashed, expiresAt });

  // sendVerification is a function that sends email (injected for testability)
  await sendVerification(email, token);

  return token;
}

export async function verifyToken(token) {
  console.log('[verifyToken] Incoming token:', token);
  const record = await EmailVerification.findOne({ token });
  if (!record) {
    console.warn('[verifyToken] No record found for token');
  } else {
    console.log('[verifyToken] Found record for email:', record.email, 'expiresAt:', record.expiresAt);
  }
  if (!record) {
    throw { status: 400, message: "Invalid or expired verification token" };
  }
  if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
    console.warn('[verifyToken] Token expired at:', record.expiresAt);
    await EmailVerification.deleteOne({ _id: record._id });
    throw { status: 400, message: "Invalid or expired verification token" };
  }

  // Prevent duplicate account creation
  const existing = await Users.findOne({ email: record.email });
  if (existing) {
    console.log('[verifyToken] User already exists for email, cleaning token');
    await EmailVerification.deleteOne({ _id: record._id });
    return existing;
  }

  // Create user
  const newUser = new Users({ name: record.name, email: record.email, password: record.passwordHash });
  await newUser.save();

  // Create UserInfo document
  try {
    const UserInfo = (await import("../models/UserInfo.js")).default;
    await UserInfo.create({ userId: newUser._id, fullName: record.name });
  } catch (e) {
    console.warn("Failed to create UserInfo during verification:", e.message);
  }

  // Create Profile document with fullName from registration
  try {
    const Profile = (await import("../models/profileModel.js")).default;
    await Profile.create({
      userId: newUser._id,
      fullName: record.name,
      username: record.name ? record.name.replace(/\s+/g, '').toLowerCase() : '',
    });
  } catch (e) {
    console.warn("Failed to create Profile during verification:", e.message);
  }

  // Clean up token
  await EmailVerification.deleteOne({ _id: record._id });
  console.log('[verifyToken] Verification complete, token removed');
  return newUser;
}

export default { register, verifyToken };
