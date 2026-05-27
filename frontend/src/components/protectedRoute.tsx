import { useLocation , Navigate, Outlet} from "react-router-dom";
import { useAppContext } from "../context/context";
const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuth, user,loading } = useAppContext();
  if(loading) return null

  if(!isAuth) return <Navigate to="/login" replace />;

  if(!user?.role && location.pathname !== "/select-role") return <Navigate to="/select-role" replace />;
  if(user?.role && location.pathname ==="/select-role") return <Navigate to="/" replace />;
 
return <Outlet />;
};

export default ProtectedRoute;

