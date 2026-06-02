import axios from "axios";
import { API_ENDPOINTS } from "./constants";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
  withCredentials: true,
});

// ==========================================
// REFRESH CONTROL
// ==========================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================
API.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================
API.interceptors.response.use(
  (response) => response, // ✅ always return full response

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // ==============================
    // TOKEN EXPIRED → REFRESH FLOW
    // ==============================
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(API(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("Invalid refresh response");
        }

        // Save new token
        localStorage.setItem("accessToken", newAccessToken);

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // ❌ Clear auth safely (NO redirect here)
        localStorage.removeItem("accessToken");

        return Promise.reject({
          success: false,
          message: "Session expired. Please login again.",
          status: 401,
        });
      } finally {
        isRefreshing = false;
      }
    }

    // ==============================
    // NORMAL ERROR HANDLING
    // ==============================
    return Promise.reject({
      success: false,
      message:
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong",
      status,
    });
  }
);

export default API;