/**
 * ------------------------------------------------------------------
 * Faculty Service
 * ------------------------------------------------------------------
 * Handles business logic for faculties.
 * ------------------------------------------------------------------
 */

import facultyRepository from "./faculty.repository.js";
import departmentRepository from "../department/department.repository.js";
import ApiError from "../../shared/errors/ApiError.js";

/**
 * Create Faculty
 */
const createFaculty = async (facultyData) => {
  const {
    email,
    employeeId,
    departmentId,
  } = facultyData;

  // Check Department
  const department =
    await departmentRepository.findDepartmentById(departmentId);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  // Check duplicate email
  const existingEmail =
    await facultyRepository.findFacultyByEmail(email);

  if (existingEmail) {
    throw new ApiError(409, "Email already exists");
  }

  // Check duplicate employee ID
  const existingEmployee =
    await facultyRepository.findFacultyByEmployeeId(employeeId);

  if (existingEmployee) {
    throw new ApiError(409, "Employee ID already exists");
  }

  return await facultyRepository.createFaculty(facultyData);
};

/**
 * Get All Faculties
 */
const getFaculties = async () => {
  return await facultyRepository.findAllFaculties();
};

/**
 * Get Faculty By ID
 */
const getFacultyById = async (id) => {
  const faculty =
    await facultyRepository.findFacultyById(id);

  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  return faculty;
};

/**
 * Update Faculty
 */
const updateFaculty = async (id, data) => {
  const faculty =
    await facultyRepository.findFacultyById(id);

  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  // Check email uniqueness
  if (data.email) {
    const existingEmail =
      await facultyRepository.findFacultyByEmail(data.email);

    if (
      existingEmail &&
      existingEmail.id !== faculty.id
    ) {
      throw new ApiError(409, "Email already exists");
    }
  }

  // Check employee ID uniqueness
  if (data.employeeId) {
    const existingEmployee =
      await facultyRepository.findFacultyByEmployeeId(
        data.employeeId
      );

    if (
      existingEmployee &&
      existingEmployee.id !== faculty.id
    ) {
      throw new ApiError(
        409,
        "Employee ID already exists"
      );
    }
  }

  return await facultyRepository.updateFaculty(
    faculty,
    data
  );
};

/**
 * Delete Faculty
 */
const deleteFaculty = async (id) => {
  const faculty =
    await facultyRepository.findFacultyById(id);

  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  await facultyRepository.deleteFaculty(faculty);
};

export default {
  createFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
};