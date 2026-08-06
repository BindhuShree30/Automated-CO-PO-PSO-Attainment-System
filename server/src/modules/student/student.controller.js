/**
 * ------------------------------------------------------------------
 * Student Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import studentService from "./student.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * Create Student
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
 * Get All Students
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
 * Get Student By ID
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
 * Update Student
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
 * Delete Student
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

export default {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};