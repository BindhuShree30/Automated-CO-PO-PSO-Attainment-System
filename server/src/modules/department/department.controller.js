/**
 * ------------------------------------------------------------------
 * Department Controller
 * ------------------------------------------------------------------
 */

import departmentService from "./department.service.js";
import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";

/**
 * Create Department
 */
const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartment(req.validatedData);

  return successResponse(
    res,
    "Department created successfully.",
    department,
    201
  );
});

/**
 * Get All Departments
 */
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.getDepartments();

  return successResponse(
    res,
    "Departments fetched successfully.",
    departments
  );
});

/**
 * Get Department By ID
 */
const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentById(req.params.id);

  return successResponse(
    res,
    "Department fetched successfully.",
    department
  );
});

/**
 * Update Department
 */
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartment(
    req.params.id,
    req.validatedData
  );

  return successResponse(
    res,
    "Department updated successfully.",
    department
  );
});

/**
 * Delete Department
 */
const deleteDepartment = asyncHandler(async (req, res) => {
  await departmentService.deleteDepartment(req.params.id);

  return successResponse(
    res,
    "Department deleted successfully.",
    null
  );
});

export default {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};