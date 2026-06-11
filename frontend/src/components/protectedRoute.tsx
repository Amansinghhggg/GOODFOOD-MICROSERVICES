import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../context/context";

interface ProtectedRouteProps {
  roles?: string[];
}

const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { isAuth, user, loading } = useAppContext();
  const location = useLocation();

  if (loading) return null;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // User authenticated but role not selected
  if (!user?.role && location.pathname !== "/select-role") {
    return <Navigate to="/select-role" replace />;
  }

  // Already selected role
  if (user?.role && location.pathname === "/select-role") {
    return <Navigate to="/" replace />;
  }

  // Role restriction
  if (roles && user?.role && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;