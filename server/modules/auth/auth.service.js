import bcrypt from "bcrypt";
import userModel from "../../models/userModel.js";
import { generateToken } from "../../utils/jwt.js";

/**
 * REGISTER USER
 */
export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = generateToken({ id: user._id });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

/**
 * LOGIN USER
 */
export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({ id: user._id });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

/**
 * GET CURRENT USER
 */
export const getCurrentUser = async (userId) => {
  const user = await userModel.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
};