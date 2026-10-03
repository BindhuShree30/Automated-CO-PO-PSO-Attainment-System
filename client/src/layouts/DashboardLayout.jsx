import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

function DashboardLayout() {
  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* ============================================================
          SIDEBAR
      ============================================================ */}

      <Sidebar />

      {/* ============================================================
          MAIN APPLICATION AREA
      ============================================================ */}

      <div
        style={{
          marginLeft: "var(--sidebar-width)",
          width: "calc(100% - var(--sidebar-width))",
          minWidth: 0,
          minHeight: "100vh",
          background: "var(--background)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >

        {/* ==========================================================
            NAVBAR
        ========================================================== */}

        <Navbar />

        {/* ==========================================================
            PAGE CONTENT
        ========================================================== */}

        <main
          style={{
            marginTop: "var(--navbar-height)",
            height: "calc(100vh - var(--navbar-height))",
            minWidth: 0,
            width: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "28px 32px",
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;