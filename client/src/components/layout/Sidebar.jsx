import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  House,
  PersonBadge,
  People,
  Book,
  JournalCheck,
  BarChart,
  FileEarmarkBarGraph,
  FileEarmarkExcel,
  Person,
  QuestionCircle,
  ClipboardCheck,
  Link45deg,
  Diagram3,
  Collection,
  PersonPlus,
  PencilSquare,
  Award,
  Cpu,
} from "react-bootstrap-icons";

function Sidebar() {
  const { user } = useAuth();

  let menuItems = [];

  // =========================================================
  // HOD MENU
  // =========================================================

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

      // =======================================================
      // BATCH MANAGEMENT
      // =======================================================

      {
        name: "Batches",
        icon: <Collection />,
        path: "/hod/batches",
      },

      // =======================================================
      // CURRICULUM IMPORT
      // =======================================================

      {
        name: "Curriculum Import",
        icon: <FileEarmarkExcel />,
        path: "/hod/curriculum-import/2df81bee-bc19-11f1-8dc0-22968cf93f4b",
      },

      // =======================================================
      // PROGRAM OUTCOMES
      // =======================================================

      {
        name: "Program Outcomes",
        icon: <JournalCheck />,
        path: "/hod/program-outcomes",
      },

      // =======================================================
      // PROGRAM SPECIFIC OUTCOMES
      // =======================================================

      {
        name: "Program Specific Outcomes",
        icon: <Diagram3 />,
        path: "/hod/program-specific-outcomes",
      },

      // =======================================================
      // COURSE OFFERINGS
      // =======================================================

      {
        name: "Course Offerings",
        icon: <JournalCheck />,
        path: "/hod/course-offerings",
      },

      // =======================================================
      // REPORTS
      // =======================================================

      {
        name: "Reports",
        icon: <BarChart />,
        path: "/hod/reports",
      },

      // =======================================================
      // CURRICULUM GAP
      // =======================================================

      {
        name: "Curriculum Gap",
        icon: <Cpu />,
        path: "/faculty/curriculum-gaps",
      },

      // =======================================================
      // PROFILE
      // =======================================================

      {
        name: "Profile",
        icon: <Person />,
        path: "/hod/profile",
      },
    ];
  }

  // =========================================================
  // FACULTY MENU
  // =========================================================

  if (user?.role === "FACULTY") {
    menuItems = [
      {
        name: "Dashboard",
        icon: <House />,
        path: "/faculty/dashboard",
      },

      // =======================================================
      // MY COURSES
      // =======================================================

      {
        name: "My Courses",
        icon: <Book />,
        path: "/faculty/courses",
      },

      // =======================================================
      // COURSE REGISTRATION
      // =======================================================

      {
        name: "Course Registration",
        icon: <PersonPlus />,
        path: "/faculty/course-registration",
      },

      // =======================================================
      // STUDENTS
      // =======================================================

      {
        name: "Students",
        icon: <People />,
        path: "/faculty/students",
      },

      // =======================================================
      // COURSE OUTCOMES
      // =======================================================

      {
        name: "Course Outcomes",
        icon: <JournalCheck />,
        path: "/faculty/course-outcomes",
      },

      // =======================================================
      // QUESTION MAPPING
      // =======================================================

      {
        name: "Question Mapping",
        icon: <QuestionCircle />,
        path: "/faculty/question-mapping",
      },

      // =======================================================
      // ASSESSMENTS
      // =======================================================

      {
        name: "Assessments",
        icon: <ClipboardCheck />,
        path: "/faculty/assessments",
      },

      // =======================================================
      // MARKS ENTRY
      // =======================================================

      {
        name: "Marks Entry",
        icon: <PencilSquare />,
        path: "/faculty/marks-entry",
      },

      // =======================================================
      // CO ATTAINMENT
      // =======================================================

      {
        name: "CO Attainment",
        icon: <Award />,
        path: "/faculty/attainment",
      },

      // =======================================================
      // CO–PO MAPPING
      // =======================================================

      {
        name: "CO–PO Mapping",
        icon: <Link45deg />,
        path: "/faculty/co-po-mapping",
      },

      // =======================================================
      // CO–PSO MAPPING
      // =======================================================

      {
        name: "CO–PSO Mapping",
        icon: <Diagram3 />,
        path: "/faculty/co-pso-mapping",
      },

      // =======================================================
      // CURRICULUM GAP ANALYSIS (NBA CRITERION 2)
      // =======================================================

      {
        name: "Curriculum Gap",
        icon: <Cpu />,
        path: "/faculty/curriculum-gaps",
      },

      // =======================================================
      // REPORTS
      // =======================================================

      {
        name: "Reports",
        icon: <FileEarmarkBarGraph />,
        path: "/faculty/reports",
      },

      // =======================================================
      // PROFILE
      // =======================================================

      {
        name: "Profile",
        icon: <Person />,
        path: "/faculty/profile",
      },
    ];
  }

  // =========================================================
  // SIDEBAR RENDER
  // =========================================================

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
      {/* LOGO */}
      <div className="text-center py-4 border-bottom border-secondary">
        <h4 className="mb-0 fw-bold">OBE Insight</h4>
      </div>

      {/* MENU LIST */}
      <ul className="nav flex-column mt-3">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item">
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
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;