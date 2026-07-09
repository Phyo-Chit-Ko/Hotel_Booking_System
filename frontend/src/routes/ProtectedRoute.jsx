import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    // not logged in at all
    return <Navigate to="/account" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // logged in, but wrong role — send them back to the public site
    return <Navigate to="/" replace />;
  }

  return children;
}