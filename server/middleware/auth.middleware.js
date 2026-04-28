import { verifyToken } from "../utils/token.js";

/**
 * 🔐 AUTH MIDDLEWARE (Production-Grade)
 * Supports:
 * - Cookie-based auth (browser)
 * - Bearer token (API / Postman / mobile)
 */
const authMiddleware = (req, res, next) => {
  try {
    let token = null;

    /**
     * 🔹 1. Extract token from cookies
     */
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    /**
     * 🔹 2. Extract token from Authorization header
     * Format: Bearer <token>
     */
    else if (req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");

      if (parts.length === 2 && parts[0] === "Bearer") {
        token = parts[1];
      }
    }

    /**
     * 🔹 3. No token found
     */
    if (!token) {
      const error = new Error("Unauthorized: Token missing");
      error.status = 401;
      throw error;
    }

    /**
     * 🔹 4. Verify token
     */
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      const error = new Error("Unauthorized: Invalid or expired token");
      error.status = 401;
      throw error;
    }

    /**
     * 🔹 5. Attach user to request
     */
    req.userId = decoded.id;

    next();
  } catch (err) {
    err.status = err.status || 401;
    next(err);
  }
};

export default authMiddleware;