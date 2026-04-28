import { verifyToken } from "../utils/jwt.js";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new Error("Unauthorized");
    }

    const decoded = verifyToken(token);

    req.userId = decoded.id;

    next();
  } catch (err) {
    next(err);
  }
};

export default authMiddleware;