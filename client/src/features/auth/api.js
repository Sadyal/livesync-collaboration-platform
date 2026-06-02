import api from "../../utils/axios";
import { API_ENDPOINTS } from "../../utils/constants";

const extractData = (res) => res?.data;

const extractError = (err) => {
  if (err?.response?.data) return err.response.data;
  return {
    success: false,
    message: err?.message || "Network error",
  };
};

export const authApi = {
  // ===============================
  // LOGIN
  // ===============================
  async login(credentials) {
    try {
      const res = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return extractData(res);
    } catch (err) {
      throw extractError(err);
    }
  },

  // ===============================
  // REGISTER
  // ===============================
  async register(userData) {
    try {
      const res = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return extractData(res);
    } catch (err) {
      throw extractError(err);
    }
  },

  // ===============================
  // LOGOUT
  // ===============================
  async logout() {
    try {
      const res = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      return extractData(res);
    } catch (err) {
      throw extractError(err);
    }
  },

  // ===============================
  // GET CURRENT USER
  // ===============================
  async getMe() {
    try {
      const res = await api.get(API_ENDPOINTS.AUTH.ME);
      return extractData(res);
    } catch (err) {
      throw extractError(err);
    }
  },

  // ===============================
  // REFRESH TOKEN (IMPORTANT)
  // ===============================
  async refreshToken() {
    try {
      const res = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
      return extractData(res);
    } catch (err) {
      throw extractError(err);
    }
  },
};