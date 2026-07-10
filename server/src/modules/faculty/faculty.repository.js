/**
 * ------------------------------------------------------------------
 * Faculty Repository
 * ------------------------------------------------------------------
 */

import Faculty from "../../database/models/Faculty.js";

const createFaculty = async (facultyData) => {
  return await Faculty.create(facultyData);
};

const findFacultyById = async (id) => {
  return await Faculty.findByPk(id);
};

const findFacultyByEmail = async (email) => {
  return await Faculty.findOne({
    where: { email },
  });
};

const findFacultyByEmployeeId = async (employeeId) => {
  return await Faculty.findOne({
    where: { employeeId },
  });
};

const findAllFaculties = async () => {
  return await Faculty.findAll();
};

const updateFaculty = async (faculty, data) => {
  return await faculty.update(data);
};

const deleteFaculty = async (faculty) => {
  return await faculty.destroy();
};

export default {
  createFaculty,
  findFacultyById,
  findFacultyByEmail,
  findFacultyByEmployeeId,
  findAllFaculties,
  updateFaculty,
  deleteFaculty,
};