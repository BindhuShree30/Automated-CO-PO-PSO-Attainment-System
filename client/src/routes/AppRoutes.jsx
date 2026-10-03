import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

/* =========================================================
   AUTH
========================================================= */

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

/* =========================================================
   HOD
========================================================= */

import HodDashboard from "../pages/hod/Dashboard";
import HodFaculty from "../pages/hod/Faculty";
import HodStudents from "../pages/hod/Students";
import HodCourses from "../pages/hod/Courses";
import CurriculumImport from "../pages/hod/CurriculumImport";
import CurriculumImportReview from "../pages/hod/CurriculumImportReview";

/* =========================================================
   BATCH
========================================================= */

import Batch from "../pages/batch/Batch";
import BatchForm from "../pages/batch/BatchForm";

/* =========================================================
   PROGRAM OUTCOME
========================================================= */

import ProgramOutcomeList from "../pages/programOutcome/ProgramOutcomeList";
import AddProgramOutcome from "../pages/programOutcome/AddProgramOutcome";
import EditProgramOutcome from "../pages/programOutcome/EditProgramOutcome";

/* =========================================================
   PROGRAM SPECIFIC OUTCOME
========================================================= */

import ProgramSpecificOutcomeList from "../pages/programSpecificOutcome/ProgramSpecificOutcomeList";
import AddProgramSpecificOutcome from "../pages/programSpecificOutcome/AddProgramSpecificOutcome";
import EditProgramSpecificOutcome from "../pages/programSpecificOutcome/EditProgramSpecificOutcome";

/* =========================================================
   FACULTY
========================================================= */

import FacultyDashboard from "../pages/faculty/DashBoard";
import FacultyCourses from "../pages/faculty/Courses";
import CoPsoMapping from "../pages/faculty/CoPsoMapping";
import FacultyStudents from "../pages/faculty/Students";
import Assessments from "../pages/faculty/Assessments";
import QuestionMapping from "../pages/faculty/QuestionMapping";
import MarksEntry from "../pages/faculty/MarksEntry";
import CourseRegistrationList from "../pages/courseRegistration/CourseRegistrationList";
import CourseRegistrationStudents from "../pages/courseRegistration/CourseRegistrationStudents";
import MarksLedger from "../pages/faculty/MarksLedger";
import COAttainment from "../pages/faculty/COAttainment";
import CurriculumGaps from "../pages/faculty/CurriculumGaps";

/* =========================================================
   COURSE OUTCOME
========================================================= */

import CourseOutcomeList from "../pages/courseOutcome/CourseOutcomeList";
import AddCourseOutcome from "../pages/courseOutcome/AddCourseOutcome";
import EditCourseOutcome from "../pages/courseOutcome/EditCourseOutcome";

/* =========================================================
   CO-PO MAPPING
========================================================= */

import COPOMatrix from "../pages/coPoMapping/COPOMatrix";

/* =========================================================
   COURSE OFFERING
========================================================= */

import CourseOfferingList from "../pages/courseOffering/CourseOfferingList";
import AddCourseOffering from "../pages/courseOffering/AddCourseOffering";
import EditCourseOffering from "../pages/courseOffering/EditCourseOffering";

/* =========================================================
   FACULTY ASSIGNMENT
========================================================= */

import FacultyAssignment from "../pages/facultyAssignment/FacultyAssignment";

/* =========================================================
   COMMON
========================================================= */

import Unauthorized from "../pages/common/Unauthorized";
import NotFound from "../pages/common/NotFound";

function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route element={<PublicRoute />}>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
      </Route>

      {/* =====================================================
          HOD ROUTES
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["HOD"]} />
        }
      >
        <Route element={<DashboardLayout />}>
          {/* =================================================
              HOD DASHBOARD
          ================================================= */}

          <Route
            path="/hod/dashboard"
            element={<HodDashboard />}
          />

          {/* =================================================
              HOD FACULTY
          ================================================= */}

          <Route
            path="/hod/faculty"
            element={<HodFaculty />}
          />

          {/* =================================================
              HOD STUDENTS
          ================================================= */}

          <Route
            path="/hod/students"
            element={<HodStudents />}
          />

          {/* =================================================
              HOD COURSES
          ================================================= */}

          <Route
            path="/hod/courses"
            element={<HodCourses />}
          />

          {/* =================================================
              HOD BATCH MANAGEMENT
          ================================================= */}

          <Route
            path="/hod/batches"
            element={<Batch />}
          />

          <Route
            path="/hod/batches/add"
            element={<BatchForm />}
          />

          <Route
            path="/hod/batches/edit/:id"
            element={<BatchForm />}
          />

          {/* =================================================
              HOD CURRICULUM IMPORT
          ================================================= */}

          <Route
            path="/hod/curriculum-import/:curriculumId"
            element={<CurriculumImport />}
          />

          <Route
            path="/hod/curriculum-import-review/:importId"
            element={<CurriculumImportReview />}
          />

          {/* =================================================
              HOD PROGRAM OUTCOMES
          ================================================= */}

          <Route
            path="/hod/program-outcomes"
            element={<ProgramOutcomeList />}
          />

          <Route
            path="/hod/program-outcomes/add"
            element={<AddProgramOutcome />}
          />

          <Route
            path="/hod/program-outcomes/edit/:id"
            element={<EditProgramOutcome />}
          />

          {/* =================================================
              HOD PROGRAM SPECIFIC OUTCOMES
          ================================================= */}

          <Route
            path="/hod/program-specific-outcomes"
            element={<ProgramSpecificOutcomeList />}
          />

          <Route
            path="/hod/program-specific-outcomes/add"
            element={<AddProgramSpecificOutcome />}
          />

          <Route
            path="/hod/program-specific-outcomes/edit/:id"
            element={<EditProgramSpecificOutcome />}
          />

          {/* =================================================
              HOD COURSE OFFERINGS
          ================================================= */}

          <Route
            path="/hod/course-offerings"
            element={<CourseOfferingList />}
          />

          <Route
            path="/hod/course-offerings/add"
            element={<AddCourseOffering />}
          />

          <Route
            path="/hod/course-offerings/edit/:id"
            element={<EditCourseOffering />}
          />

          {/* =================================================
              HOD FACULTY ASSIGNMENT
          ================================================= */}

          <Route
            path="/hod/faculty-assignment"
            element={<FacultyAssignment />}
          />
        </Route>
      </Route>

      {/* =====================================================
          FACULTY ROUTES
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["FACULTY"]} />
        }
      >
        <Route element={<DashboardLayout />}>
          {/* =================================================
              FACULTY DASHBOARD
          ================================================= */}

          <Route
            path="/faculty/dashboard"
            element={<FacultyDashboard />}
          />

          {/* =================================================
              FACULTY ASSESSMENTS
          ================================================= */}

          <Route
            path="/faculty/assessments"
            element={<Assessments />}
          />

          {/* =================================================
              QUESTION MAPPING
          ================================================= */}

          <Route
            path="/faculty/question-mapping"
            element={<QuestionMapping />}
          />

          <Route
            path="/faculty/question-mapping/:assessmentId"
            element={<QuestionMapping />}
          />

          {/* =================================================
              MARKS ENTRY & LEDGER
          ================================================= */}

          <Route
            path="/faculty/marks-entry"
            element={<MarksEntry />}
          />

          <Route
            path="/faculty/marks-entry/:assessmentId"
            element={<MarksEntry />}
          />
          <Route
            path="/faculty/marks-ledger"
            element={<MarksLedger />}
          />

          {/* =================================================
              CO ATTAINMENT
          ================================================= */}

          <Route
            path="/faculty/attainment"
            element={<COAttainment />}
          />

          {/* =================================================
              CURRICULUM GAP ANALYSIS (NBA CRITERION 2)
          ================================================= */}

          <Route
            path="/faculty/curriculum-gaps"
            element={<CurriculumGaps />}
          />

          {/* =================================================
              FACULTY MY COURSES
          ================================================= */}

          <Route
            path="/faculty/courses"
            element={<FacultyCourses />}
          />

          <Route
            path="/faculty/my-courses"
            element={<FacultyCourses />}
          />

          {/* =================================================
              FACULTY STUDENTS
          ================================================= */}

          <Route
            path="/faculty/students"
            element={<FacultyStudents />}
          />

          {/* =================================================
              COURSE REGISTRATION
          ================================================= */}

          <Route
            path="/faculty/course-registration"
            element={<CourseRegistrationList />}
          />

          <Route
            path="/faculty/course-registration/:courseOfferingId"
            element={<CourseRegistrationStudents />}
          />

          {/* =================================================
              COURSE OUTCOMES
          ================================================= */}

          <Route
            path="/faculty/course-outcomes"
            element={<CourseOutcomeList />}
          />

          <Route
            path="/faculty/course-outcomes/add"
            element={<AddCourseOutcome />}
          />

          <Route
            path="/faculty/course-outcomes/edit/:id"
            element={<EditCourseOutcome />}
          />

          {/* =================================================
              CO-PO MAPPING
          ================================================= */}

          <Route
            path="/faculty/co-po-mapping"
            element={<COPOMatrix />}
          />

          {/* =================================================
              CO-PSO MAPPING
          ================================================= */}

          <Route
            path="/faculty/co-pso-mapping"
            element={<CoPsoMapping />}
          />
        </Route>
      </Route>

      {/* =====================================================
          UNAUTHORIZED
      ===================================================== */}

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      {/* =====================================================
          ROOT
      ===================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      {/* =====================================================
          404
      ===================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default AppRoutes;