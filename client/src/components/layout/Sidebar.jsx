import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  House,
  PersonBadge,
  People,
  Book,
  JournalCheck,
  PersonCheck,
  BarChart,
  FileEarmarkBarGraph,
  Person,
  QuestionCircle,
  ClipboardCheck,
  Link45deg,
  Diagram3,
  Upload,
  Collection,
} from "react-bootstrap-icons";

function Sidebar() {
  const { user } = useAuth();

  let menuItems = [];

  // ===========================
  // HOD MENU
  // ===========================

  if (user?.role === "HOD") {
    menuItems = [
      {
        name: "Dashboard",
        icon: <House />,
        path: "/hod/dashboard",
      },

      {
        name: "Faculty",
        icon: <PersonBadge />,
        path: "/hod/faculty",
      },

      {
        name: "Students",
        icon: <People />,
        path: "/hod/students",
      },

      {
        name: "Courses",
        icon: <Book />,
        path: "/hod/courses",
      },

      // ===========================
      // BATCH MANAGEMENT
      // ===========================

      {
        name: "Batches",
        icon: <Collection />,
        path: "/hod/batches",
      },

      {
        name: "Program Outcomes",
        icon: <JournalCheck />,
        path: "/hod/program-outcomes",
      },

      {
        name: "Course Offerings",
        icon: <JournalCheck />,
        path: "/hod/course-offerings",
      },

      

      {
        name: "Reports",
        icon: <BarChart />,
        path: "/hod/reports",
      },

      {
        name: "Curriculum Gap",
        icon: <FileEarmarkBarGraph />,
        path: "/hod/curriculum-gap",
      },

      {
        name: "Profile",
        icon: <Person />,
        path: "/hod/profile",
      },
    ];
  }

  // ===========================
  // FACULTY MENU
  // ===========================

  if (user?.role === "FACULTY") {
    menuItems = [
      {
        name: "Dashboard",
        icon: <House />,
        path: "/faculty/dashboard",
      },

      {
        name: "My Courses",
        icon: <Book />,
        path: "/faculty/courses",
      },

      {
        name: "Course Outcomes",
        icon: <JournalCheck />,
        path: "/faculty/course-outcomes",
      },

      {
        name: "Question Mapping",
        icon: <QuestionCircle />,
        path: "/faculty/question-mapping",
      },

      {
        name: "Assessments",
        icon: <ClipboardCheck />,
        path: "/faculty/assessments",
      },

      {
        name: "Marks Entry",
        icon: <Upload />,
        path: "/faculty/marks",
      },

      {
        name: "CO–PO Mapping",
        icon: <Link45deg />,
        path: "/faculty/co-po-mapping",
      },

      {
        name: "CO–PSO Mapping",
        icon: <Diagram3 />,
        path: "/faculty/co-pso-mapping",
      },

      {
        name: "Attainment",
        icon: <BarChart />,
        path: "/faculty/attainment",
      },

      {
        name: "Reports",
        icon: <FileEarmarkBarGraph />,
        path: "/faculty/reports",
      },

      {
        name: "Curriculum Gap",
        icon: <FileEarmarkBarGraph />,
        path: "/faculty/curriculum-gap",
      },

      {
        name: "Profile",
        icon: <Person />,
        path: "/faculty/profile",
      },
    ];
  }

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        height: "100vh",
        background: "var(--sidebar-bg)",
        position: "fixed",
        left: 0,
        top: 0,
        color: "#fff",
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      {/* =====================================================
          LOGO
      ===================================================== */}

      <div className="text-center py-4 border-bottom border-secondary">
        <h4 className="mb-0 fw-bold">
          OBE Insight
        </h4>
      </div>

      {/* =====================================================
          MENU
      ===================================================== */}

      <ul className="nav flex-column mt-3">

        {menuItems.map((item) => (
          <li
            key={item.path}
            className="nav-item"
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-4 py-3 ${
                  isActive ? "active" : ""
                }`
              }
              style={({ isActive }) => ({
                color: "#fff",
                textDecoration: "none",
                background: isActive
                  ? "rgba(255,255,255,0.15)"
                  : "transparent",
                transition: "0.3s",
              })}
            >
              <span
                style={{
                  fontSize: "18px",
                }}
              >
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>
            </NavLink>
          </li>
        ))}

      </ul>
    </aside>
  );
}

export default Sidebar;