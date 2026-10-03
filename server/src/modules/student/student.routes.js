/**
 * ---------------------------------------------------------
 * Student Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 */

import { Router } from "express";

import studentController from "./student.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import upload from "../../middleware/upload.middleware.js";

import ROLES from "../../shared/constants/roles.js";

import {
    createStudentSchema,
    updateStudentSchema,
    studentIdSchema,
} from "./student.schema.js";

const router = Router();

/**
 * ---------------------------------------------------------
 * Create Student
 * ---------------------------------------------------------
 *
 * HOD can create students.
 */

router.post(
    "/",
    authMiddleware,
    roleMiddleware(ROLES.HOD),
    validate(createStudentSchema),
    studentController.createStudent
);

/**
 * ---------------------------------------------------------
 * Preview Student Excel
 * ---------------------------------------------------------
 *
 * HOD can upload an Excel file for validation.
 * No records are inserted during preview.
 */

router.post(
    "/upload/preview",
    authMiddleware,
    roleMiddleware(ROLES.HOD),
    upload.single("file"),
    studentController.previewExcel
);

/**
 * ---------------------------------------------------------
 * Import Student Excel
 * ---------------------------------------------------------
 *
 * HOD can import validated student records.
 */

router.post(
    "/upload/import",
    authMiddleware,
    roleMiddleware(ROLES.HOD),
    upload.single("file"),
    studentController.importExcel
);

/**
 * ---------------------------------------------------------
 * Get All Students
 * ---------------------------------------------------------
 *
 * HOD and Faculty can view students.
 */

router.get(
    "/",
    authMiddleware,
    roleMiddleware(
        ROLES.HOD,
        ROLES.FACULTY
    ),
    studentController.getStudents
);

/**
 * ---------------------------------------------------------
 * Get Student By ID
 * ---------------------------------------------------------
 */

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(
        ROLES.HOD,
        ROLES.FACULTY
    ),
    validate(studentIdSchema),
    studentController.getStudentById
);

/**
 * ---------------------------------------------------------
 * Update Student
 * ---------------------------------------------------------
 *
 * Only HOD can modify student master data.
 */

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(ROLES.HOD),
    validate(updateStudentSchema),
    studentController.updateStudent
);

/**
 * ---------------------------------------------------------
 * Delete Student
 * ---------------------------------------------------------
 *
 * Only HOD can delete students.
 */

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(ROLES.HOD),
    validate(studentIdSchema),
    studentController.deleteStudent
);

export default router;