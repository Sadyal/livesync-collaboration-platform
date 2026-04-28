import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

/**
 * 🌍 ENV
 */
const isProd = process.env.NODE_ENV === "production";

/**
 * 🔐 SECURITY HEADERS
 */
app.use(helmet());

/**
 * 📦 BODY PARSING (LIMIT SIZE)
 */
app.use(express.json({ limit: "10kb" }));

/**
 * 🍪 COOKIE PARSER
 */
app.use(cookieParser());

/**
 * 🌐 CORS CONFIG (STRICT + SAFE)
 */
const allowedOrigins = [
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server or Postman (no origin)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/**
 * 🧪 REQUEST LOGGER (DEV ONLY)
 */
if (!isProd) {
  app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.originalUrl}`);
    next();
  });
}

/**
 * ❤️ HEALTH CHECK
 */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API running",
    environment: process.env.NODE_ENV || "development",
  });
});

/**
 * 🚀 ROUTES
 */
app.use("/api/auth", authRoutes);

/**
 * ❌ 404 HANDLER (IMPORTANT)
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * ⚠️ GLOBAL ERROR HANDLER
 */
app.use(errorMiddleware);

export default app;