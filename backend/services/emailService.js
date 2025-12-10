import nodemailer from 'nodemailer';

// Sends a password reset email. Uses FRONTEND_BASE if present, otherwise defaults to localhost:5173.
export async function sendPasswordResetEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Always use the frontend URL for password reset (user needs to enter new password in UI)
  const frontendBase = process.env.FRONTEND_BASE || 'http://localhost:5173';
  const resetUrl = `${frontendBase.replace(/\/$/, '')}/reset-password?token=${token}`;

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
