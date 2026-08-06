import { Bell, PersonCircle, BoxArrowRight } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm px-4"
      style={{
        height: "var(--navbar-height)",
        background: "var(--navbar-bg)",
        position: "fixed",
        left: "var(--sidebar-width)",
        right: 0,
        top: 0,
        zIndex: 999,
      }}
    >
      <div className="container-fluid">

        <h5 className="mb-0 fw-bold">
          OBE Insight
        </h5>

        <div className="d-flex align-items-center gap-4">

          <Bell size={22} />

          <div className="d-flex align-items-center gap-2">

            <PersonCircle size={32} />

            <div>
              <div className="fw-semibold">
                {user?.firstName || "Admin"}
              </div>

              <small className="text-muted">
                {user?.role || "Administrator"}
              </small>
            </div>

          </div>

          <button
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
            onClick={handleLogout}
          >
            <BoxArrowRight />
            Logout
          </button>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;