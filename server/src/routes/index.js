/**
 * ------------------------------------------------------------------
 * Main Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import departmentRoutes from "../modules/department/department.routes.js";
import programRoutes from "../modules/program/program.routes.js";
import courseRoutes from "../modules/course/course.routes.js";
import facultyRoutes from "../modules/faculty/faculty.routes.js";
import studentRoutes from "../modules/student/student.routes.js";
import coRoutes from "../modules/co/co.routes.js";
import academicYearRoutes from "../modules/academicYear/academicYear.routes.js";
import batchRoutes from "../modules/batch/batch.routes.js";
import semesterRoutes from "../modules/semester/semester.routes.js";
import courseOfferingRoutes from "../modules/courseOffering/courseOffering.routes.js";
import enrollmentRoutes from "../modules/enrollment/enrollment.routes.js";
import courseRegistrationRoutes from "../modules/courseRegistration/courseRegistration.routes.js";
import assessmentRoutes from "../modules/assessment/assessment.routes.js";
import assessmentQuestionRoutes from "../modules/assessmentQuestion/assessmentQuestion.routes.js";
import studentQuestionMarkRoutes from "../modules/studentQuestionMark/studentQuestionMark.routes.js";
import coAttainmentRoutes from "../modules/coAttainment/coAttainment.routes.js";
import programOutcomeRoutes from "../modules/programOutcome/programOutcome.routes.js";
import coPOMappingRoutes from "../modules/coPOMapping/coPOMapping.routes.js";
import poAttainmentRoutes from "../modules/poAttainment/poAttainment.routes.js";
import programSpecificOutcomeRoutes from "../modules/programSpecificOutcome/programSpecificOutcome.routes.js";
import coPsoMappingRoutes from "../modules/coPsoMapping/coPsoMapping.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
const router = Router();

/**
 * ------------------------------------------------------------------
 * Health Check
 * ------------------------------------------------------------------
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
    data: null,
    error: null,
  });
});

/**
 * ------------------------------------------------------------------
 * Authentication Routes
 * ------------------------------------------------------------------
 */
router.use("/auth", authRoutes);

/**
 * ------------------------------------------------------------------
 * Department Routes
 * ------------------------------------------------------------------
 */
router.use("/departments", departmentRoutes);

/**
 * ------------------------------------------------------------------
 * Program Routes
 * ------------------------------------------------------------------
 */
router.use("/programs", programRoutes);

/**
 * ------------------------------------------------------------------
 * Course Routes
 * ------------------------------------------------------------------
 */
router.use("/courses", courseRoutes);
router.use("/dashboard", dashboardRoutes);

/**
 * ------------------------------------------------------------------
 * Faculty Routes
 * ------------------------------------------------------------------
 */
router.use("/faculties", facultyRoutes);

/**
 * ------------------------------------------------------------------
 * Student Routes
 * ------------------------------------------------------------------
 */
router.use("/students", studentRoutes);

/**
 * ------------------------------------------------------------------
 * Course Outcome Routes
 * ------------------------------------------------------------------
 */
router.use("/co", coRoutes);

/**
 * ------------------------------------------------------------------
 * Academic Year Routes
 * ------------------------------------------------------------------
 */
router.use("/academic-years", academicYearRoutes);

/**
 * ------------------------------------------------------------------
 * Batch Routes
 * ------------------------------------------------------------------
 */
router.use("/batches", batchRoutes);

/**
 * ------------------------------------------------------------------
 * Semester Routes
 * ------------------------------------------------------------------
 */
router.use("/semesters", semesterRoutes);

/**
 * ------------------------------------------------------------------
 * Course Offering Routes
 * ------------------------------------------------------------------
 */
router.use("/course-offerings", courseOfferingRoutes);

/**
 * ------------------------------------------------------------------
 * Enrollment Routes
 * ------------------------------------------------------------------
 */
router.use("/enrollments", enrollmentRoutes);

/**
 * ------------------------------------------------------------------
 * Course Registration Routes
 * ------------------------------------------------------------------
 */
router.use("/course-registrations", courseRegistrationRoutes);

/**
 * ------------------------------------------------------------------
 * Assessment Routes
 * ------------------------------------------------------------------
 */
router.use("/assessments", assessmentRoutes);

/**
 * ------------------------------------------------------------------
 * Assessment Question Routes
 * ------------------------------------------------------------------
 */
router.use("/assessment-questions", assessmentQuestionRoutes);

/**
 * ------------------------------------------------------------------
 * Student Question Mark Routes
 * ------------------------------------------------------------------
 */
router.use("/student-question-marks", studentQuestionMarkRoutes);

/**
 * ------------------------------------------------------------------
 * CO Attainment Routes
 * ------------------------------------------------------------------
 */
router.use("/co-attainments", coAttainmentRoutes);

/**
 * ------------------------------------------------------------------
 * Program Outcome Routes
 * ------------------------------------------------------------------
 */
router.use("/program-outcomes", programOutcomeRoutes);

/**
 * ------------------------------------------------------------------
 * CO-PO Mapping Routes
 * ------------------------------------------------------------------
 */
router.use("/co-po-mappings", coPOMappingRoutes);

/**
 * ------------------------------------------------------------------
 * PO Attainment Routes
 * ------------------------------------------------------------------
 */
router.use("/po-attainments", poAttainmentRoutes);
/**
 * ------------------------------------------------------------------
 * Program Specific Outcome Routes
 * ------------------------------------------------------------------
 */
router.use(
  "/program-specific-outcomes",
  programSpecificOutcomeRoutes
);
/**
 * ------------------------------------------------------------------
 * CO-PSO Mapping Routes
 * ------------------------------------------------------------------
 */
router.use("/co-pso-mappings", coPsoMappingRoutes

);

export default router;