import { NavLink } from "react-router-dom";
import {
  House,
  Building,
  Book,
  People,
  PersonBadge,
  JournalCheck,
  Diagram3,
  Link45deg,
  Calendar3,
  ClipboardCheck,
  PencilSquare,
  Calculator,
  BarChart,
  ClipboardData,
  Cpu,
} from "react-bootstrap-icons";

const menuItems = [
  {
    name: "Dashboard",
    icon: <House />,
    path: "/admin/dashboard",
  },
  {
    name: "Departments",
    icon: <Building />,
    path: "/admin/departments",
  },
 // {
 //   name: "Programs",
 //   icon: <Book />,
 //   path: "/admin/programs",
 // },
  
  {
    name: "Courses",
    icon: <JournalCheck />,
    path: "/admin/courses",
  },
  {
    name: "Course Outcomes",
    icon: <JournalCheck />,
    path: "/admin/course-outcomes",
  },
  {
    name: "Program Outcomes",
    icon: <Diagram3 />,
    path: "/admin/program-outcomes",
  },
  {
    name: "Program Specific Outcomes",
    icon: <Diagram3 />,
    path: "/admin/program-specific-outcomes",
  },
  
  {
    name: "CO–PO Matrix",
    icon: <Link45deg />,
    path: "/admin/co-po-matrix",
  },
  {
    name: "Course Offering",
    icon: <Calendar3 />,
    path: "/admin/course-offerings",
  },
  {
    name: "Faculty",
    icon: <PersonBadge />,
    path: "/admin/faculty",
  },
  {
    name: "Students",
    icon: <People />,
    path: "/admin/students",
  },
  {
    name: "Assessments",
    icon: <ClipboardCheck />,
    path: "/admin/assessments",
  },
  {
    name: "Question Mapping",
    icon: <PencilSquare />,
    path: "/admin/assessment-questions",
  },
  {
    name: "CO Attainment",
    icon: <Calculator />,
    path: "/admin/co-attainment",
  },
  {
    name: "PO Attainment",
    icon: <Calculator />,
    path: "/admin/po-attainment",
  },
  {
    name: "Reports",
    icon: <BarChart />,
    path: "/admin/reports",
  },
  {
    name: "Curriculum Gap",
    icon: <ClipboardData />,
    path: "/admin/curriculum-gap",
  },
  {
    name: "AI Insights",
    icon: <Cpu />,
    path: "/admin/ai",
  },
];

function Sidebar() {
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
      }}
    >
      <div className="text-center py-4 border-bottom border-secondary">
        <h4 className="mb-0 fw-bold">OBE Insight</h4>
      </div>

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