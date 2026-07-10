/**
 * ------------------------------------------------------------------
 * Department Service
 * ------------------------------------------------------------------
 */

import departmentRepository from "./department.repository.js";
import ApiError from "../../shared/errors/ApiError.js";

const createDepartment = async (data) => {
  const existing = await departmentRepository.findDepartmentByCode(data.code);

  if (existing) {
    throw new ApiError(409, "Department code already exists");
  }

  return await departmentRepository.createDepartment(data);
};

const getDepartments = async () => {
  return await departmentRepository.getAllDepartments();
};

const getDepartmentById = async (id) => {
  const department = await departmentRepository.findDepartmentById(id);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  return department;
};

const updateDepartment = async (id, data) => {
  const department = await departmentRepository.updateDepartment(id, data);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  return department;
};

const deleteDepartment = async (id) => {
  const deleted = await departmentRepository.deleteDepartment(id);

  if (!deleted) {
    throw new ApiError(404, "Department not found");
  }

  return null;
};

export default {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};