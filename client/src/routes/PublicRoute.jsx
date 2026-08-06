import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicRoute() {
  const { user } = useAuth();

  if (user) {
    switch (user.role) {
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;

      case "FACULTY":
        return <Navigate to="/faculty/dashboard" replace />;

      case "STUDENT":
        return <Navigate to="/student/dashboard" replace />;

      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}

export default PublicRoute;