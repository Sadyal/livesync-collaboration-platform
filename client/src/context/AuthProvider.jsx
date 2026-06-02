import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { authApi } from "../features/auth/api";

export const AuthProvider = ({ children }) => {
  // ==========================================
  // STATE
  // ==========================================
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // ==========================================
  // FETCH CURRENT USER
  // ==========================================
  const fetchUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();

      setUser(res?.success ? res.data : null);
    } catch {
      setUser(null);
    }
  }, []);

  // ==========================================
  // INITIAL AUTH CHECK
  // ==========================================
  useEffect(() => {
    const init = async () => {
      await fetchUser();
      setIsInitializing(false);
    };

    init();
  }, [fetchUser]);

  // ==========================================
  // LOGIN HANDLER
  // ==========================================
  const login = async (credentials) => {
    const res = await authApi.login(credentials);

    if (res?.accessToken) {
      localStorage.setItem("accessToken", res.accessToken);
    }

    await fetchUser();
    return res;
  };

  // ==========================================
  // LOGOUT HANDLER
  // ==========================================
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore API failure
    }

    localStorage.removeItem("accessToken");
    setUser(null);
  };

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
  const value = {
    user,
    isAuthenticated: !!user,
    isInitializing,
    setUser,
    login,
    logout,
    refetchUser: fetchUser,
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <AuthContext.Provider value={value}>
      {!isInitializing && children}
    </AuthContext.Provider>
  );
};