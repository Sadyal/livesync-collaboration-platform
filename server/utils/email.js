import transporter from "../config/nodemailer.js";

/**
 * 🔒 Validate required fields
 */
const validateEmailPayload = ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    const err = new Error("Email payload missing required fields");
    err.status = 400;
    throw err;
  }
};

/**
 * 📧 Send Email (Generic Utility)
 */
export const sendEmail = async ({ to, subject, html }) => {
  validateEmailPayload({ to, subject, html });

  try {
    const mailOptions = {
      from: `"LiveSync Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    // 🔍 Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log("📤 Email sent:", {
        to,
        messageId: info.messageId,
      });
    }

    return info;
  } catch (error) {
    console.error("❌ Email Error:", error.message);

    const err = new Error("Failed to send email");
    err.status = 500;
    throw err;
  }
};

/**
 * ✉️ VERIFY EMAIL TEMPLATE
 */
export const generateVerifyEmailTemplate = (otp, email) => {
  return `
    <div style="font-family: Arial; max-width: 600px; margin: auto;">
      <h2>Email Verification</h2>
      <p>Hello,</p>
      <p>Your OTP is:</p>
      <h1 style="letter-spacing: 4px;">${otp}</h1>
      <p>This OTP is valid for <b>24 hours</b>.</p>
      <hr />
      <small>If you did not request this, please ignore.</small>
    </div>
  `;
};

/**
 * 🔐 RESET PASSWORD TEMPLATE
 */
export const generateResetPasswordTemplate = (otp, email) => {
  return `
    <div style="font-family: Arial; max-width: 600px; margin: auto;">
      <h2>Password Reset</h2>
      <p>Hello,</p>
      <p>Your OTP is:</p>
      <h1 style="letter-spacing: 4px;">${otp}</h1>
      <p>This OTP is valid for <b>15 minutes</b>.</p>
      <hr />
      <small>If you did not request this, secure your account.</small>
    </div>
  `;
};