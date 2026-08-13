import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <h4 className="text-center mt-5">
        Loading...
      </h4>
    );
  }

  if (!user) {
    return <Outlet />;
  }

  switch (user.role) {
    case "HOD":
      return (
        <Navigate
          to="/hod/dashboard"
          replace
        />
      );

    case "FACULTY":
      return (
        <Navigate
          to="/faculty/dashboard"
          replace
        />
      );

    default:
      return (
        <Navigate
          to="/login"
          replace
        />
      );
  }
}

export default PublicRoute;