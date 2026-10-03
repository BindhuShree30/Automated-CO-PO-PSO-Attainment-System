/**
 * ------------------------------------------------------------------
 * Enrollment Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import enrollmentService from "./enrollment.service.js";

import asyncHandler from "../../shared/helpers/asyncHandler.js";
import {
    successResponse,
} from "../../shared/helpers/apiResponse.js";

import ApiError from "../../shared/errors/ApiError.js";

/**
 * Create Single Enrollment
 */
const createEnrollment = asyncHandler(
    async (req, res) => {
        const enrollment =
            await enrollmentService.createEnrollment(
                req.validatedData.body
            );

        return successResponse(
            res,
            "Student enrolled successfully.",
            enrollment,
            201
        );
    }
);

/**
 * Get All Enrollments
 */
const getEnrollments = asyncHandler(
    async (req, res) => {
        const enrollments =
            await enrollmentService.getEnrollments();

        return successResponse(
            res,
            "Enrollments fetched successfully.",
            enrollments,
            200
        );
    }
);

/**
 * Get Enrollment By ID
 */
const getEnrollmentById = asyncHandler(
    async (req, res) => {
        const enrollment =
            await enrollmentService.getEnrollmentById(
                req.validatedData.params.id
            );

        return successResponse(
            res,
            "Enrollment fetched successfully.",
            enrollment,
            200
        );
    }
);

/**
 * Get Enrollments By Batch
 */
const getEnrollmentsByBatch = asyncHandler(
    async (req, res) => {
        const enrollments =
            await enrollmentService.getEnrollmentsByBatchId(
                req.validatedData.params.batchId
            );

        return successResponse(
            res,
            "Batch enrollments fetched successfully.",
            enrollments,
            200
        );
    }
);

/**
 * Get Enrollments By Student
 */
const getEnrollmentsByStudent = asyncHandler(
    async (req, res) => {
        const enrollments =
            await enrollmentService.getEnrollmentsByStudentId(
                req.validatedData.params.studentId
            );

        return successResponse(
            res,
            "Student enrollments fetched successfully.",
            enrollments,
            200
        );
    }
);

/**
 * Update Enrollment
 */
const updateEnrollment = asyncHandler(
    async (req, res) => {
        const updated =
            await enrollmentService.updateEnrollment(
                req.validatedData.params.id,
                req.validatedData.body
            );

        return successResponse(
            res,
            "Enrollment updated successfully.",
            updated,
            200
        );
    }
);

/**
 * Delete Enrollment
 */
const deleteEnrollment = asyncHandler(
    async (req, res) => {
        await enrollmentService.deleteEnrollment(
            req.validatedData.params.id
        );

        return successResponse(
            res,
            "Enrollment deleted successfully.",
            null,
            200
        );
    }
);

/**
 * Bulk Upload Enrollment
 */
const bulkUploadEnrollment = asyncHandler(
    async (req, res) => {
        const batchId =
            req.body?.batchId;

        if (!batchId) {
            throw new ApiError(
                400,
                "Batch ID is required."
            );
        }

        const file = req.file;

        if (!file || !file.buffer) {
            throw new ApiError(
                400,
                "Please upload an Excel (.xlsx, .xls) or CSV file."
            );
        }

        const result =
            await enrollmentService.bulkEnrollFromSpreadsheet(
                batchId,
                file.buffer
            );

        return successResponse(
            res,
            `Enrolled ${result.enrolled} students successfully (${result.alreadyEnrolled} already enrolled).`,
            result,
            200
        );
    }
);

export default {
    createEnrollment,
    getEnrollments,
    getEnrollmentById,
    getEnrollmentsByBatch,
    getEnrollmentsByStudent,
    updateEnrollment,
    deleteEnrollment,
    bulkUploadEnrollment,
};