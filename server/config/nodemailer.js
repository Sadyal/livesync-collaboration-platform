import nodemailer from "nodemailer";

/**
 * 🔒 REQUIRED ENV VALIDATION (fail fast)
 */
const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }
});

/**
 * 📧 CREATE SMTP TRANSPORTER (Brevo / Any SMTP)
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true only for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  /**
   * 🛠️ DEBUG (only in development)
   */
  ...(process.env.NODE_ENV === "development" && {
    logger: true,
    debug: true,
  }),
});

/**
 * ✅ VERIFY CONNECTION (non-blocking)
 * Ensures SMTP is ready at startup
 */
const verifySMTPConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP server is ready (Brevo)");
  } catch (error) {
    console.error("❌ SMTP connection failed:", error.message);
  }
};

// Run verification (don't block app startup)
verifySMTPConnection();

/**
 * 🚀 EXPORT TRANSPORTER
 */
export default transporter;