import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "../components/ui";

// Guards a route by login state and (optionally) by role
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, homeFor } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking your session..." />;

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  // Logged in, but wrong role — send them to their own dashboard
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
