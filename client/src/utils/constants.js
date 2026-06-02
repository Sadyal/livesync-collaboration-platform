// ==========================================
// FRONTEND ROUTES
// ==========================================
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",

  // Static route (for router config)
  DOC_EDITOR: "/docs/:id",

  // Dynamic route (for navigation)
  getDocEditor: (id) => `/docs/${id}`,
};


// ==========================================
// API ENDPOINTS (STRICTLY MATCH BACKEND)
// ==========================================
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",

    // Email verification
    SEND_VERIFY_OTP: "/api/auth/send-verify-otp",
    VERIFY_EMAIL: "/api/auth/verify-email",

    // Password reset
    SEND_RESET_OTP: "/api/auth/send-reset-otp",
    RESET_PASSWORD: "/api/auth/reset-password",

    // Token refresh
    REFRESH: "/api/auth/refresh-token",
  },

  DOCS: {
    // Base
    GET_ALL: "/api/docs",
    CREATE: "/api/docs",

    // Dynamic
    GET_BY_ID: (id) => `/api/docs/${id}`,
    RENAME: (id) => `/api/docs/${id}`,
    DELETE: (id) => `/api/docs/${id}`,
    SHARE: (id) => `/api/docs/${id}/share`,
  },
};