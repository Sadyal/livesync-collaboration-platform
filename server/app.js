import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import docRoutes from "./modules/document/doc.routes.js";

import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

/**
 * CORE MIDDLEWARES
 */
app.use(express.json());
app.use(cookieParser());

/**
 * CORS (production-safe + localhost)
 */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        origin === "http://localhost:5173" ||
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
 * HEALTH CHECK
 */
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API running" });
});

/**
 * ROUTES
 */
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/docs", docRoutes);

/**
 * ERROR HANDLER (LAST)
 */
app.use(errorMiddleware);

export default app;