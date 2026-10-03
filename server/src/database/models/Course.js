/**
 * ------------------------------------------------------------------
 * Course Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Course belongs to:
 *
 * Department
 * Program
 *
 * Program is used for:
 *
 * - Program Outcomes
 * - CO–PO Mapping
 * - CO–PSO Mapping
 * - Attainment Analysis
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
     */
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "department_id",
    },

    /**
     * Program
     *
     * Active academic relationship.
     *
     * Required for:
     *
     * - Program Outcomes
     * - CO–PO Mapping
     * - CO–PSO Mapping
     * - Attainment Analysis
     */
    programId: {
      type: DataTypes.UUID,
      allowNull: false,
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
        fields: ["program_id"],
        name: "idx_course_program",
      },
      {
        fields: ["semester"],
        name: "idx_course_semester",
      },
    ],
  }
);

export default Course;