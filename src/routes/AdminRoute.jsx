import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute({ children }) {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}
