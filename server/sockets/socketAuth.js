import jwt from "jsonwebtoken";

export const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return next(new Error("Invalid token payload"));
    }

    socket.userId = decoded.id.toString();

    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
};