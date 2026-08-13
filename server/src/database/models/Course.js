/**
 * ------------------------------------------------------------------
 * Course Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Course belongs to a Department.
 *
 * Program is NOT used by the current Course Management module.
 * The existing program_id database column is retained only for
 * backward compatibility with old records.
 *
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Course = sequelize.define(
  "Course",
  {
    /**
     * Course ID
     */
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    /**
     * Course Name
     */
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    /**
     * Course Code
     */
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    /**
     * Credits
     */
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    /**
     * Semester
     */
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    /**
     * Department
     *
     * This is the active academic relationship.
     */
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "department_id",
    },

    /**
     * Legacy Program ID
     *
     * NOT REQUIRED.
     *
     * The Course API does not accept or use programId.
     * Existing database records may still contain a value.
     */
    programId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      field: "program_id",
    },

    /**
     * Status
     */
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "courses",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        fields: ["department_id"],
        name: "idx_course_department",
      },
      {
        fields: ["semester"],
        name: "idx_course_semester",
      },
    ],
  }
);

export default Course;