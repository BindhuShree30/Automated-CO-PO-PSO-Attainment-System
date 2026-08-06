import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

function DashboardLayout() {
  return (
    <div className="d-flex">
      <Sidebar />

      <div
        className="flex-grow-1"
        style={{
          marginLeft: "var(--sidebar-width)",
          minHeight: "100vh",
          background: "var(--background)",
        }}
      >
        <Navbar />

        <main
          className="container-fluid py-4"
          style={{
            marginTop: "var(--navbar-height)",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;