/**
 * ---------------------------------------------------------
 * HOD Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 *
 * Handles database operations required by the HOD module.
 *
 * Current scope:
 * - Single department
 * - Faculty approval management
 * ---------------------------------------------------------
 */



import User from "../../database/models/User.js";

/**
 * ---------------------------------------------------------
 * Find Pending Faculty
 * ---------------------------------------------------------
 */
const findPendingFaculty = async () => {
  return await User.findAll({
    where: {
      role: "FACULTY",
      status: "PENDING",
    },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "role",
      "status",
      "createdAt",
    ],
    order: [["createdAt", "ASC"]],
  });
};

/**
 * ---------------------------------------------------------
 * Find All Faculty
 * ---------------------------------------------------------
 */
const findAllFaculty = async () => {
  return await User.findAll({
    where: {
      role: "FACULTY",
    },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "email",
      "role",
      "status",
      "createdAt",
      "updatedAt",
    ],
    order: [["createdAt", "DESC"]],
  });
};

/**
 * ---------------------------------------------------------
 * Find Faculty By ID
 * ---------------------------------------------------------
 */
const findFacultyById = async (id) => {
  return await User.findOne({
    where: {
      id,
      role: "FACULTY",
    },
  });
};

export default {
  findPendingFaculty,
  findAllFaculty,
  findFacultyById,
};