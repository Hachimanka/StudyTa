import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    passwordHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("EmailVerification", emailVerificationSchema);
