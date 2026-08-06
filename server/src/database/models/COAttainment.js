/**
 * ------------------------------------------------------------------
 * CO Attainment Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Stores calculated Course Outcome attainment results
 * for a specific Course Offering.
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const COAttainment = sequelize.define(
  "COAttainment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    courseOfferingId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "course_offering_id",
    },

    courseOutcomeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "course_outcome_id",
    },

    totalMarksObtained: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "total_marks_obtained",
    },

    totalMaxMarks: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "total_max_marks",
    },

    attainmentPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      field: "attainment_percentage",
    },

    attainmentLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "attainment_level",
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "co_attainments",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: [
          "course_offering_id",
          "course_outcome_id",
        ],
        name: "unique_course_offering_co_attainment",
      },
      {
        fields: ["course_offering_id"],
        name: "idx_co_attainment_course_offering",
      },
      {
        fields: ["course_outcome_id"],
        name: "idx_co_attainment_course_outcome",
      },
      {
        fields: ["attainment_level"],
        name: "idx_co_attainment_level",
      },
      {
        fields: ["status"],
        name: "idx_co_attainment_status",
      },
    ],
  }
);

export default COAttainment;