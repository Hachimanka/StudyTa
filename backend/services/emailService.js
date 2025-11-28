import nodemailer from 'nodemailer';

// Sends a password reset email. Uses FRONTEND_BASE if present, otherwise BACKEND_BASE.
export async function sendPasswordResetEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const frontendBase = process.env.FRONTEND_BASE;
  const backendBase = process.env.BACKEND_BASE || `http://localhost:${process.env.PORT || 5000}`;

  const resetUrl = frontendBase
    ? `${frontendBase.replace(/\/$/, '')}/reset-password?token=${token}`
    : `${backendBase.replace(/\/$/, '')}/api/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your StudyTa password',
    html: `<p>Click the link below to reset your password (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
  };

  // Require email credentials to actually send emails
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw { status: 500, message: 'EMAIL_USER and EMAIL_PASS must be configured to send emails' };
  }

  await transporter.sendMail(mailOptions);
}

export default { sendPasswordResetEmail };
