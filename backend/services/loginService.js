import Users from "../models/Users.js";
import bcrypt from "bcryptjs";

// Authenticate a user by email/password. Throws an object {status,message} on known errors.
export async function authenticate(email, password) {
  if (!email || !password) {
    throw { status: 400, message: "All fields are required" };
  }

  const user = await Users.findOne({ email });
  if (!user) {
    throw { status: 400, message: "Invalid email or password" };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 400, message: "Invalid email or password" };
  }

  return user;
}

export default { authenticate };
