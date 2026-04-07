import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated || userRole !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
