import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function UserRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (userRole !== "USER") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
