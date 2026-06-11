import { Navigate, Outlet } from "react-router-dom";
import { useAppContext } from "../context/context";

const PublicRoute = () => {
  const { isAuth, loading, user } = useAppContext();

  if (loading) return null;

  if (!isAuth) {
    return <Outlet />;
  }

  switch (user?.role) {
    case "customer":
      return <Navigate to="/" replace />;

    case "owner":
      return <Navigate to="/restaurant" replace />;

    case "rider":
      return <Navigate to="/rider" replace />;

    case "admin":
      return <Navigate to="/admin" replace />;

    default:
      return <Navigate to="/select-role" replace />;
  }
};

export default PublicRoute;