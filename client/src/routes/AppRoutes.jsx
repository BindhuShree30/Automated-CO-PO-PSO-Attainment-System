import StudentList from "../pages/student/StudentList";
import AddStudent from "../pages/student/AddStudent";
import EditStudent from "../pages/student/EditStudent";

import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import Login from "../pages/auth/Login";

import AdminDashboard from "../pages/admin/Dashboard";
import DepartmentList from "../pages/department/DepartmentList";
import AddDepartment from "../pages/department/AddDepartment";
import EditDepartment from "../pages/department/EditDepartment";
import ProgramList from "../pages/program/ProgramList";
import AddProgram from "../pages/program/AddProgram";
import EditProgram from "../pages/program/EditProgram";
import CourseList from "../pages/course/CourseList";
import AddCourse from "../pages/course/AddCourse";
import EditCourse from "../pages/course/EditCourse";
import Faculty from "../pages/admin/Faculty";
import Reports from "../pages/admin/Reports";
import CourseOutcomeList from "../pages/courseOutcome/CourseOutcomeList";
import AddCourseOutcome from "../pages/courseOutcome/AddCourseOutcome";
import EditCourseOutcome from "../pages/courseOutcome/EditCourseOutcome";
import FacultyDashboard from "../pages/faculty/Dashboard";
import StudentDashboard from "../pages/student/Dashboard";

import Unauthorized from "../pages/common/Unauthorized";
import NotFound from "../pages/common/NotFound";
import ProgramOutcomeList from "../pages/programOutcome/ProgramOutcomeList";
import AddProgramOutcome from "../pages/programOutcome/AddProgramOutcome";
import EditProgramOutcome from "../pages/programOutcome/EditProgramOutcome";

// Uncomment this ONLY if the file exists:
// src/pages/coPoMapping/COPOMatrix.jsx
import COPOMatrix from "../pages/coPoMapping/COPOMatrix";

function AppRoutes() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* ================= ADMIN ================= */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<DashboardLayout />}>

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/departments"
            element={<DepartmentList />}
          />

          <Route
            path="/admin/departments/add"
            element={<AddDepartment />}
          />

          <Route
            path="/admin/departments/edit/:id"
            element={<EditDepartment />}
          />

          <Route
            path="/admin/programs"
            element={<ProgramList />}
          />

          <Route
            path="/admin/programs/add"
            element={<AddProgram />}
          />

          <Route
            path="/admin/programs/edit/:id"
            element={<EditProgram />}
          />

          <Route
            path="/admin/courses"
            element={<CourseList />}
          />

          <Route
            path="/admin/courses/add"
            element={<AddCourse />}
          />

          <Route
            path="/admin/courses/edit/:id"
            element={<EditCourse />}
          />

          <Route
            path="/admin/faculty"
            element={<Faculty />}
          />

          <Route
            path="/admin/students"
            element={<StudentList />}
          />

          <Route
            path="/admin/students/add"
            element={<AddStudent />}
          />

          <Route
            path="/admin/students/edit/:id"
            element={<EditStudent />}
          />

          <Route
            path="/admin/reports"
            element={<Reports />}
          />
          <Route
            path="/admin/course-outcomes"
            element={<CourseOutcomeList />}
          />

          <Route
            path="/admin/course-outcomes/add"
            element={<AddCourseOutcome />}
          />

          <Route
            path="/admin/course-outcomes/edit/:id"
            element={<EditCourseOutcome />}
          />
          <Route
            path="/admin/program-outcomes"
            element={<ProgramOutcomeList />}
          />

          <Route
            path="/admin/program-outcomes/add"
            element={<AddProgramOutcome />}
          />

          <Route
            path="/admin/program-outcomes/edit/:id"
            element={<EditProgramOutcome />}
          />

          <Route
            path="/admin/co-po-matrix"
            element={<COPOMatrix />}
          />

        </Route>
      </Route>

      {/* ================= FACULTY ================= */}
      <Route element={<ProtectedRoute allowedRoles={["FACULTY"]} />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/faculty/dashboard"
            element={<FacultyDashboard />}
          />
        </Route>
      </Route>

      {/* ================= STUDENT ================= */}
      <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/student/dashboard"
            element={<StudentDashboard />}
          />
        </Route>
      </Route>

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}

export default AppRoutes;