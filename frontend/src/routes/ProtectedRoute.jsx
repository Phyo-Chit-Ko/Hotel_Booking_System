import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // not logged in at all
    return <Navigate to="/account" replace />;
  }

  // Newly created staff accounts must set their own password before doing
  // anything else, regardless of which route they try to hit.
  if (user.must_change_password && location.pathname !== "/force-change-password") {
    return <Navigate to="/force-change-password" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles
      .map((r) => r.toLowerCase())
      .includes((user.role || "").toLowerCase())
  ) {
    // logged in, but wrong role — send them back to the public site
    return <Navigate to="/" replace />;
  }

  return children;
}