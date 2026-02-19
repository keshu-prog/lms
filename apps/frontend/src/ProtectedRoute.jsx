import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const isAuthenticated = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/404" replace />;
  }

  return children;
}
