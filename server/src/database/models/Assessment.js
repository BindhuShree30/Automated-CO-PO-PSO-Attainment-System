/**
 * ------------------------------------------------------------------
 * Assessment Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Represents an assessment conducted for a Course Offering.
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Assessment = sequelize.define(
  "Assessment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM(
        "CIE",
        "SEE",
        "ASSIGNMENT",
        "QUIZ",
        "LAB",
        "PROJECT"
      ),
      allowNull: false,
    },

    entryMode: {
      type: DataTypes.ENUM("QUESTION_WISE", "DIRECT_MARKS"),
      allowNull: false,
      defaultValue: "DIRECT_MARKS",
      field: "entry_mode",
    },

    calculationMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "DIRECT",
      field: "calculation_method",
    },

    courseOfferingId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "course_offering_id",
    },

    maxMarks: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      field: "max_marks",
    },

    weightage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },

    assessmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "assessment_date",
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "assessments",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: [
          "course_offering_id",
          "name",
        ],
        name: "unique_course_offering_assessment_name",
      },
      {
        fields: ["course_offering_id"],
        name: "idx_assessment_course_offering",
      },
      {
        fields: ["type"],
        name: "idx_assessment_type",
      },
      {
        fields: ["status"],
        name: "idx_assessment_status",
      },
      {
        fields: ["entry_mode"],
        name: "idx_assessment_entry_mode",
      },
    ],
  }
);

export default Assessment;