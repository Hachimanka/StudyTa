import * as registerService from "../services/registerService.js";
import * as emailService from "../services/emailVerificationService.js";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    await registerService.register(name, email, password, emailService.sendVerification);
    res.status(200).json({ message: "Verification email sent. Please check your inbox." });
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
    await registerService.verifyToken(token);
    res.send("Email verified! You can now log in.");
  } catch (err) {
    console.error("verify controller error:", err);
    const status = err && err.status ? err.status : 500;
    const message = err && err.message ? err.message : "Error verifying email.";
    res.status(status).send(message);
  }
}

export default { register, verify };
