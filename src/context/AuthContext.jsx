import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { loginUser, registerUser } from "../api/auth";
import {
  AUTH_STORAGE_KEY,
  readStorage,
  removeStorage,
  writeStorage,
} from "../lib/storage";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../utils/constants";
import { getErrorMessage } from "../utils/formatters";

const AuthContext = createContext(null);

function createAdminSession() {
  return {
    token: "admin-session",
    user: {
      id: "admin-static-user",
      fullName: "Platform Administrator",
      email: ADMIN_EMAIL,
      role: "ADMIN",
    },
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStorage(AUTH_STORAGE_KEY, null));
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (session) {
      writeStorage(AUTH_STORAGE_KEY, session);
    }
  }, [session]);

  const login = async (credentials) => {
    setAuthLoading(true);

    try {
      let nextSession;

      if (
        credentials.email.trim().toLowerCase() === ADMIN_EMAIL &&
        credentials.password === ADMIN_PASSWORD
      ) {
        nextSession = createAdminSession();
      } else {
        nextSession = await loginUser(credentials);
      }

      setSession(nextSession);
      toast.success(
        nextSession.user.role === "ADMIN"
          ? "Welcome back, admin."
          : "Signed in successfully."
      );

      return nextSession;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to sign in right now.");
      toast.error(message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (payload) => {
    setAuthLoading(true);

    try {
      const nextSession = await registerUser(payload);
      setSession(nextSession);
      toast.success("Account created successfully.");
      return nextSession;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create account.");
      toast.error(message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setSession(null);
    removeStorage(AUTH_STORAGE_KEY);
    toast.success("You have been signed out.");
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      token: session?.token || "",
      authLoading,
      isAuthenticated: Boolean(session?.user),
      userRole: session?.user?.role || "GUEST",
      login,
      register,
      logout,
    }),
    [authLoading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
