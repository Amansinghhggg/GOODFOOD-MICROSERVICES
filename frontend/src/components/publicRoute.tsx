import {useAppContext} from "../context/context";
import {Navigate, Outlet} from "react-router-dom";


export default function PublicRoute() {
    const { isAuth, loading, user } = useAppContext();

    if (loading) return null;

    if (isAuth) {
        return <Navigate to={user?.role ? "/" : "/select-role"} replace />;
    }

    return <Outlet />;
}
