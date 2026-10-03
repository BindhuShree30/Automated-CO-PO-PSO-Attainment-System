/**
 * ---------------------------------------------------------
 * Student Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 */

import studentService from "./student.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";
import ApiError from "../../shared/errors/ApiError.js";

/**
 * ---------------------------------------------------------
 * Create Student
 * ---------------------------------------------------------
 */

const createStudent = asyncHandler(async (req, res) => {
    const student = await studentService.createStudent(
        req.validatedData.body
    );

    return successResponse(
        res,
        "Student created successfully.",
        student,
        201
    );
});

/**
 * ---------------------------------------------------------
 * Get All Students
 * ---------------------------------------------------------
 */

const getStudents = asyncHandler(async (req, res) => {
    const students = await studentService.getStudents();

    return successResponse(
        res,
        "Students fetched successfully.",
        students,
        200
    );
});

/**
 * ---------------------------------------------------------
 * Get Student By ID
 * ---------------------------------------------------------
 */

const getStudentById = asyncHandler(async (req, res) => {
    const student = await studentService.getStudentById(
        req.validatedData.params.id
    );

    return successResponse(
        res,
        "Student fetched successfully.",
        student,
        200
    );
});

/**
 * ---------------------------------------------------------
 * Update Student
 * ---------------------------------------------------------
 */

const updateStudent = asyncHandler(async (req, res) => {
    const student = await studentService.updateStudent(
        req.validatedData.params.id,
        req.validatedData.body
    );

    return successResponse(
        res,
        "Student updated successfully.",
        student,
        200
    );
});

/**
 * ---------------------------------------------------------
 * Delete Student
 * ---------------------------------------------------------
 */

const deleteStudent = asyncHandler(async (req, res) => {
    await studentService.deleteStudent(
        req.validatedData.params.id
    );

    return successResponse(
        res,
        "Student deleted successfully.",
        null,
        200
    );
});

/**
 * ---------------------------------------------------------
 * Preview Student Excel
 * ---------------------------------------------------------
 *
 * Validates the uploaded Excel file without
 * inserting any students into the database.
 */

const previewExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(
            400,
            "Excel file is required."
        );
    }

    const result = await studentService.previewExcel(
        req.file.buffer
    );

    return successResponse(
        res,
        "Excel file validated successfully.",
        result,
        200
    );
});

/**
 * ---------------------------------------------------------
 * Import Student Excel
 * ---------------------------------------------------------
 *
 * Imports students after successful validation.
 */

const importExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(
            400,
            "Excel file is required."
        );
    }

    const result = await studentService.importExcel(
        req.file.buffer
    );

    return successResponse(
        res,
        result.message,
        result,
        200
    );
});

/**
 * ---------------------------------------------------------
 * Export Controller
 * ---------------------------------------------------------
 */

export default {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    previewExcel,
    importExcel,
};