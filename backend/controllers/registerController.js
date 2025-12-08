import * as registerService from "../services/registerService.js";
import * as emailService from "../services/emailVerificationService.js";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const token = await registerService.register(name, email, password, emailService.sendVerification);
    // In non-production, include token to allow manual testing without public URL
    const isProd = String(process.env.NODE_ENV).toLowerCase() === 'production';
    const payload = { message: "Verification email sent. Please check your inbox." };
    if (!isProd) {
      payload.debugToken = token;
      const backendBase = process.env.BACKEND_BASE || `http://localhost:${process.env.PORT || 5000}`;
      payload.debugVerifyUrl = `${backendBase.replace(/\/$/, '')}/api/verify-email?token=${token}`;
    }
    res.status(200).json(payload);
  } catch (err) {
    console.error("registerController error:", err);
    const status = err && err.status ? err.status : 500;
    const message = err && err.message ? err.message : "Internal server error";
    res.status(status).json({ message });
  }
}

export async function verify(req, res) {
  try {
    const { token } = req.query;
    const user = await registerService.verifyToken(token);
    // If a frontend base is configured, redirect the user there with a success hint
    const frontendBase = process.env.FRONTEND_BASE;
    if (frontendBase) {
      const target = `${frontendBase.replace(/\/$/, '')}/login?verified=1`;
      return res.redirect(target);
    }
    // Otherwise return a simple success message
    res.send("Email verified! You can now log in.");
  } catch (err) {
    console.error("verify controller error:", err);
    const status = err && err.status ? err.status : 500;
    const message = err && err.message ? err.message : "Error verifying email.";
    res.status(status).send(message);
  }
}

export default { register, verify };
