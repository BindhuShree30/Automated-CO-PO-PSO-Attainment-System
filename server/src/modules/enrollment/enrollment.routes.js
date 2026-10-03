/**
 * ------------------------------------------------------------------
 * Enrollment Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Enrollment represents a student's membership in an academic batch.
 *
 * IMPORTANT:
 * - Enrollment is NOT course-specific.
 * - Enrollment is used to associate students with batches.
 * - Only ADMIN can create/update/delete/bulk-upload enrollments.
 * - FACULTY must NOT modify batch enrollment.
 * - FACULTY will use Course Registration for registering students
 *   into their assigned course.
 *
 * ------------------------------------------------------------------
 */

import { Router } from "express";
import multer from "multer";

import enrollmentController from "./enrollment.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
    createEnrollmentSchema,
    updateEnrollmentSchema,
    enrollmentIdSchema,
    batchIdParamSchema,
    studentIdParamSchema,
} from "./enrollment.schema.js";

const router = Router();

/**
 * ------------------------------------------------------------------
 * Multer Configuration
 * ------------------------------------------------------------------
 *
 * Enrollment bulk upload accepts:
 * - .xlsx
 * - .xls
 * - .csv
 *
 * Files are kept in memory because the service processes the
 * spreadsheet directly.
 *
 * Maximum file size: 10 MB
 * ------------------------------------------------------------------
 */

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

/**
 * ------------------------------------------------------------------
 * Create Single Enrollment
 * ------------------------------------------------------------------
 *
 * ADMIN only.
 *
 * Creates the relationship:
 *
 * Student → Batch
 *
 * Example:
 *
 * Student: 1XX23CS001
 * Batch:   2023-2027
 *
 * ------------------------------------------------------------------
 */

router.post(
    "/",
    authMiddleware,
    roleMiddleware(ROLES.ADMIN),
    validate(createEnrollmentSchema),
    enrollmentController.createEnrollment
);

/**
 * ------------------------------------------------------------------
 * Bulk Upload Enrollment
 * ------------------------------------------------------------------
 *
 * ADMIN only.
 *
 * This is for batch-level enrollment.
 *
 * Example Excel:
 *
 * USN
 * 1XX23CS001
 * 1XX23CS002
 * 1XX23CS003
 *
 * The selected batchId determines which batch these students
 * belong to.
 *
 * IMPORTANT:
 * FACULTY is intentionally NOT allowed here.
 *
 * Faculty registration of students for a particular course will
 * be handled through CourseRegistration bulk upload.
 *
 * ------------------------------------------------------------------
 */

router.post(
    "/bulk-upload",
    authMiddleware,
    roleMiddleware(ROLES.ADMIN),
    upload.single("file"),
    enrollmentController.bulkUploadEnrollment
);

/**
 * ------------------------------------------------------------------
 * Get All Enrollments
 * ------------------------------------------------------------------
 *
 * Authenticated users can view enrollments.
 *
 * HOD/Admin dashboards can use this to display batch-wise
 * student information.
 *
 * ------------------------------------------------------------------
 */

router.get(
    "/",
    authMiddleware,
    enrollmentController.getEnrollments
);

/**
 * ------------------------------------------------------------------
 * Get Enrollments By Batch
 * ------------------------------------------------------------------
 *
 * IMPORTANT:
 * This route must appear before "/:id".
 *
 * Example:
 *
 * GET /enrollments/batch/{batchId}
 *
 * Used for:
 *
 * Batch
 *   ↓
 * Students
 *
 * ------------------------------------------------------------------
 */

router.get(
    "/batch/:batchId",
    authMiddleware,
    validate(batchIdParamSchema),
    enrollmentController.getEnrollmentsByBatch
);

/**
 * ------------------------------------------------------------------
 * Get Enrollments By Student
 * ------------------------------------------------------------------
 *
 * Example:
 *
 * GET /enrollments/student/{studentId}
 *
 * Used to find the batch/batches associated with a student.
 *
 * ------------------------------------------------------------------
 */

router.get(
    "/student/:studentId",
    authMiddleware,
    validate(studentIdParamSchema),
    enrollmentController.getEnrollmentsByStudent
);

/**
 * ------------------------------------------------------------------
 * Get Enrollment By ID
 * ------------------------------------------------------------------
 */

router.get(
    "/:id",
    authMiddleware,
    validate(enrollmentIdSchema),
    enrollmentController.getEnrollmentById
);

/**
 * ------------------------------------------------------------------
 * Update Enrollment
 * ------------------------------------------------------------------
 *
 * ADMIN only.
 *
 * ------------------------------------------------------------------
 */

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(ROLES.ADMIN),
    validate(updateEnrollmentSchema),
    enrollmentController.updateEnrollment
);

/**
 * ------------------------------------------------------------------
 * Delete Enrollment
 * ------------------------------------------------------------------
 *
 * ADMIN only.
 *
 * ------------------------------------------------------------------
 */

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(ROLES.ADMIN),
    validate(enrollmentIdSchema),
    enrollmentController.deleteEnrollment
);

export default router;