import studentQuestionMarkService from "./studentQuestionMark.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * Create one Student Question Mark
 */
const createStudentQuestionMark = asyncHandler(async (req, res) => {
  const studentQuestionMark =
    await studentQuestionMarkService.createStudentQuestionMark(
      req.validatedData.body
    );

  return successResponse(
    res,
    "Student Question Mark created successfully.",
    studentQuestionMark,
    201
  );
});

/**
 * Get all Student Question Marks
 */
const getStudentQuestionMarks = asyncHandler(async (req, res) => {
  const studentQuestionMarks =
    await studentQuestionMarkService.getStudentQuestionMarks();

  return successResponse(
    res,
    "Student Question Marks fetched successfully.",
    studentQuestionMarks
  );
});

/**
 * Get Student Question Mark by ID
 */
const getStudentQuestionMarkById = asyncHandler(async (req, res) => {
  const studentQuestionMark =
    await studentQuestionMarkService.getStudentQuestionMarkById(req.params.id);

  return successResponse(
    res,
    "Student Question Mark fetched successfully.",
    studentQuestionMark
  );
});

/**
 * Get all marks by Student ID
 */
const getMarksByStudentId = asyncHandler(async (req, res) => {
  const studentQuestionMarks =
    await studentQuestionMarkService.getMarksByStudentId(req.params.studentId);

  return successResponse(
    res,
    "Student Question Marks fetched successfully.",
    studentQuestionMarks
  );
});

/**
 * Get all marks by Assessment Question ID
 */
const getMarksByAssessmentQuestionId = asyncHandler(async (req, res) => {
  const studentQuestionMarks =
    await studentQuestionMarkService.getMarksByAssessmentQuestionId(
      req.params.assessmentQuestionId
    );

  return successResponse(
    res,
    "Assessment Question Marks fetched successfully.",
    studentQuestionMarks
  );
});

/**
 * ================================================================
 * MASTER LEDGER CONTROLLER (Fixes the 404 Error)
 * Get all question marks for an entire Assessment (All Students)
 *
 * GET /api/v1/student-question-marks/assessment/:assessmentId
 * ================================================================
 */
const getMarksByAssessment = asyncHandler(async (req, res) => {
  const marks = await studentQuestionMarkService.getMarksByAssessment(
    req.params.assessmentId
  );

  return successResponse(
    res,
    "Assessment question marks fetched successfully.",
    marks
  );
});

/**
 * Get marks for one Student in one Assessment (Question-Wise)
 *
 * GET
 * /assessment/:assessmentId/student/:studentId
 */
const getMarksByAssessmentAndStudent = asyncHandler(async (req, res) => {
  const marks = await studentQuestionMarkService.getMarksByAssessmentAndStudent(
    req.params.assessmentId,
    req.params.studentId
  );

  return successResponse(
    res,
    "Student assessment marks fetched successfully.",
    marks
  );
});

/**
 * Save marks for one Student in one Assessment (Question-Wise)
 *
 * POST
 * /assessment/:assessmentId/student/:studentId/bulk
 */
const saveBulkStudentMarks = asyncHandler(async (req, res) => {
  const payload = req.validatedData?.body || req.body;
  const result = await studentQuestionMarkService.saveBulkStudentMarks(
    req.params.assessmentId,
    req.params.studentId,
    payload
  );

  return successResponse(
    res,
    "Student assessment marks saved successfully.",
    result
  );
});

/**
 * Update Student Question Mark
 */
const updateStudentQuestionMark = asyncHandler(async (req, res) => {
  const studentQuestionMark =
    await studentQuestionMarkService.updateStudentQuestionMark(
      req.params.id,
      req.validatedData.body
    );

  return successResponse(
    res,
    "Student Question Mark updated successfully.",
    studentQuestionMark
  );
});

/**
 * Delete Student Question Mark
 */
const deleteStudentQuestionMark = asyncHandler(async (req, res) => {
  await studentQuestionMarkService.deleteStudentQuestionMark(req.params.id);

  return successResponse(
    res,
    "Student Question Mark deleted successfully.",
    null
  );
});

// ================================================================
// DIRECT / OVERALL MARKS CONTROLLERS (Quiz, Assignment, Lab, SEE)
// ================================================================

/**
 * Get all direct marks for an Assessment
 *
 * GET
 * /assessment/:assessmentId/direct
 */
const getDirectMarksByAssessment = asyncHandler(async (req, res) => {
  const marks = await studentQuestionMarkService.getDirectMarksByAssessment(
    req.params.assessmentId
  );

  return successResponse(
    res,
    "Direct assessment marks fetched successfully.",
    marks
  );
});

/**
 * Save / bulk-update direct marks for an Assessment
 *
 * POST
 * /assessment/:assessmentId/direct/bulk
 */
const saveBulkDirectMarks = asyncHandler(async (req, res) => {
  const payload = req.validatedData?.body?.marks || req.body?.marks || req.body;
  const result = await studentQuestionMarkService.saveBulkDirectMarks(
    req.params.assessmentId,
    payload
  );

  return successResponse(
    res,
    "Direct assessment marks saved successfully.",
    result
  );
});

export default {
  createStudentQuestionMark,
  getStudentQuestionMarks,
  getStudentQuestionMarkById,
  getMarksByStudentId,
  getMarksByAssessmentQuestionId,
  getMarksByAssessment, // <-- Exported here
  getMarksByAssessmentAndStudent,
  saveBulkStudentMarks,
  updateStudentQuestionMark,
  deleteStudentQuestionMark,

  // Direct marks exports
  getDirectMarksByAssessment,
  saveBulkDirectMarks,
};