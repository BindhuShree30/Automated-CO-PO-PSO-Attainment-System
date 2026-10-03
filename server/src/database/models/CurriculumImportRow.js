/**
 * ------------------------------------------------------------------
 * Curriculum Import Row Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Stores individual rows extracted from an uploaded curriculum file.
 *
 * These are REVIEW rows.
 *
 * They are not immediately written to the actual Course master.
 *
 * Workflow:
 *
 * Uploaded File
 *      ↓
 * Extracted Rows
 *      ↓
 * HOD Review / Edit
 *      ↓
 * Validation
 *      ↓
 * Confirm
 *      ↓
 * Course + Curriculum Course
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const CurriculumImportRow = sequelize.define(
  "CurriculumImportRow",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    importId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "import_id",
    },

    sourceRowNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "source_row_number",
    },

    semesterNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "semester_number",
    },

    courseCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "course_code",
    },

    courseName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "course_name",
    },

    credits: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },

    courseType: {
      type: DataTypes.STRING(30),
      allowNull: true,
      field: "course_type",
    },

    electiveGroup: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "elective_group",
    },

    isCompulsory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_compulsory",
    },

    sequenceNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: "sequence_no",
    },

    matchedCourseId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "matched_course_id",
    },

    rowStatus: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "PENDING",
      field: "row_status",
    },

    validationMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "validation_message",
    },
  },
  {
    tableName: "curriculum_import_rows",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        fields: ["import_id"],
        name: "idx_import_rows_import",
      },
      {
        fields: ["matched_course_id"],
        name: "idx_import_rows_course",
      },
      {
        fields: ["semester_number"],
        name: "idx_import_rows_semester",
      },
      {
        fields: ["row_status"],
        name: "idx_import_rows_status",
      },
    ],
  }
);

export default CurriculumImportRow;