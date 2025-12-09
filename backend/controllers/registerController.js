import * as registerService from "../services/registerService.js";
import * as emailService from "../services/emailVerificationService.js";
import EmailVerification from "../models/EmailVerification.js";

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
    let { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).send('Missing verification token');
    }
    token = decodeURIComponent(token).trim();
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

// Resend verification email: regenerates token for provided email if user not verified yet
export async function resend(req, res) {
  try {
    const { email, name, password } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existing = await (await import('../models/Users.js')).default.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // If name/password provided, create a fresh token; else fail fast
    if (!name || !password) {
      return res.status(400).json({ message: 'Name and password required to resend verification for new account' });
    }

    const token = await registerService.register(name, email, password, emailService.sendVerification);
    const isProd = String(process.env.NODE_ENV).toLowerCase() === 'production';
    const payload = { message: 'Verification email resent.' };
    if (!isProd) {
      const backendBase = process.env.BACKEND_BASE || `http://localhost:${process.env.PORT || 5000}`;
      payload.debugToken = token;
      payload.debugVerifyUrl = `${backendBase.replace(/\/$/, '')}/api/verify-email?token=${token}`;
    }
    res.status(200).json(payload);
  } catch (err) {
    console.error('resend error:', err);
    res.status(err?.status || 500).json({ message: err?.message || 'Failed to resend verification' });
  }
}

// Debug endpoint to check token existence and expiry (non-production recommended)
export async function debugCheckToken(req, res) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Missing token' });
    const record = await EmailVerification.findOne({ token });
    if (!record) return res.status(404).json({ message: 'Token not found' });
    res.json({
      email: record.email,
      name: record.name,
      expiresAt: record.expiresAt,
      expired: record.expiresAt ? (record.expiresAt.getTime() < Date.now()) : null,
      createdAt: record.createdAt,
    });
  } catch (err) {
    console.error('debugCheckToken error:', err);
    res.status(500).json({ message: 'Internal error', details: err.message });
  }
}

export default { register, verify };
