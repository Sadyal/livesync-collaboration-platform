import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "./auth.service.js";

import { successResponse } from "../../utils/response.js";

/**
 * COOKIE CONFIG (FIXED FOR LOCAL + PROD)
 */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/**
 * REGISTER
 */
export const register = async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body);

    res.cookie("token", token, cookieOptions);

    return successResponse(res, { user }, "Registration successful", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * LOGIN
 */
export const login = async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);

    res.cookie("token", token, cookieOptions);

    return successResponse(res, { user }, "Login successful");
  } catch (err) {
    next(err);
  }
};

/**
 * LOGOUT
 */
export const logout = async (req, res) => {
  res.clearCookie("token", cookieOptions);

  return successResponse(res, {}, "Logout successful");
};

/**
 * GET CURRENT USER
 */
export const me = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.userId);

    return successResponse(res, { user });
  } catch (err) {
    next(err);
  }
};