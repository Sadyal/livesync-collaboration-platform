import { useState, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import { authApi } from "./api";

// ==========================================
// LOGIN
// ==========================================
export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { fetchUser } = useContext(AuthContext);

  const login = useCallback(
    async (credentials) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await authApi.login(credentials);

        if (!res?.success) {
          throw new Error(res?.message || "Login failed");
        }

        // 🔐 Sync user after login
        await fetchUser();

        return { success: true };
      } catch (err) {
        const message = err?.message || "Login failed";
        setError(message);
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUser]
  );

  return { login, isLoading, error };
};

// ==========================================
// REGISTER
// ==========================================
export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { fetchUser } = useContext(AuthContext);

  const register = useCallback(
    async (userData) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await authApi.register(userData);

        if (!res?.success) {
          throw new Error(res?.message || "Registration failed");
        }

        await fetchUser();

        return { success: true };
      } catch (err) {
        const message = err?.message || "Registration failed";
        setError(message);
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUser]
  );

  return { register, isLoading, error };
};

// ==========================================
// LOGOUT
// ==========================================
export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(AuthContext);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Logout failed:", err?.message);
    } finally {
      // Always clear client state
      setUser(null);
      setIsLoading(false);
    }
  }, [setUser]);

  return { logout, isLoading };
};