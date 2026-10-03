/**
 * ------------------------------------------------------------------
 * Faculty Assignment Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Connects a Faculty with a Course Offering.
 *
 * Course Offering remains independent.
 * Faculty assignment is maintained separately.
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const FacultyAssignment = sequelize.define(
  "FacultyAssignment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    facultyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    courseOfferingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "faculty_assignments",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: [
          "faculty_id",
          "course_offering_id",
        ],
      },
      {
        fields: ["faculty_id"],
      },
      {
        fields: ["course_offering_id"],
      },
    ],
  }
);

export default FacultyAssignment;