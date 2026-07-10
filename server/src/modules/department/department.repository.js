/**
 * ------------------------------------------------------------------
 * Department Repository
 * ------------------------------------------------------------------
 */

import Department from "../../database/models/Department.js";

const createDepartment = async (data) => {
  return await Department.create(data);
};

const findDepartmentById = async (id) => {
  return await Department.findByPk(id);
};

const findDepartmentByCode = async (code) => {
  return await Department.findOne({
    where: { code },
  });
};

const getAllDepartments = async () => {
  return await Department.findAll({
    order: [["createdAt", "DESC"]],
  });
};

const updateDepartment = async (id, data) => {
  const department = await findDepartmentById(id);

  if (!department) return null;

  return await department.update(data);
};

const deleteDepartment = async (id) => {
  const department = await findDepartmentById(id);

  if (!department) return null;

  await department.destroy();

  return true;
};

export default {
  createDepartment,
  findDepartmentById,
  findDepartmentByCode,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
};