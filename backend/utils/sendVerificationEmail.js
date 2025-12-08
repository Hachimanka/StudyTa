import nodemailer from 'nodemailer';

// Sends a verification email. By default, links point to the backend verify endpoint
// (which definitely exists: `/api/verify-email`). Set `USE_FRONTEND_VERIFY_LINK=true`
// only if your frontend hosts a `/verify-email` page.
export async function sendVerificationEmail(email, token) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const useFrontend = String(process.env.USE_FRONTEND_VERIFY_LINK || '').toLowerCase() === 'true';
  const frontendBase = process.env.FRONTEND_BASE;
  const backendBase = process.env.BACKEND_BASE || `http://localhost:${process.env.PORT || 5000}`;

  let verificationUrl;
  if (useFrontend && frontendBase) {
    verificationUrl = `${frontendBase.replace(/\/$/, '')}/verify-email?token=${token}`;
  } else {
    verificationUrl = `${backendBase.replace(/\/$/, '')}/api/verify-email?token=${token}`;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your StudyTaa account',
    html: `<p>Click the link below to verify your account:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`
  };

  // Require SMTP credentials to actually send verification emails
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured to send verification emails');
  }

  // In production, a public BACKEND_BASE (or FRONTEND_BASE) must be set to avoid localhost links
  const isProd = String(process.env.NODE_ENV).toLowerCase() === 'production';
  if (isProd) {
    if (!frontendBase && (!process.env.BACKEND_BASE || process.env.BACKEND_BASE.includes('localhost'))) {
      throw new Error('In production, set BACKEND_BASE to your public HTTPS URL (e.g., https://api.yourdomain.com) or set FRONTEND_BASE and USE_FRONTEND_VERIFY_LINK=true.');
    }
  }

  // Log the link target for easier troubleshooting
  console.log('[Email] Sending verification link to', email, '->', verificationUrl);

  await transporter.sendMail(mailOptions);
}
