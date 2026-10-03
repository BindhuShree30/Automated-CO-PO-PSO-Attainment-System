/**
 * ------------------------------------------------------------------
 * Curriculum Import Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Stores information about an uploaded curriculum file.
 *
 * Workflow:
 * UPLOADED
 *    ↓
 * PROCESSING
 *    ↓
 * EXTRACTED
 *    ↓
 * REVIEW
 *    ↓
 * CONFIRMED
 *
 * The actual extracted rows are stored in CurriculumImportRow.
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const CurriculumImport = sequelize.define(
  "CurriculumImport",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    curriculumId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "curriculum_id",
    },

    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "file_name",
    },

    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: "file_path",
    },

    fileType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "file_type",
    },

    extractionStatus: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "UPLOADED",
      field: "extraction_status",
    },

    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "uploaded_by",
    },

    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "error_message",
    },
  },
  {
    tableName: "curriculum_imports",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        fields: ["curriculum_id"],
        name: "idx_curriculum_import_curriculum",
      },
      {
        fields: ["uploaded_by"],
        name: "idx_curriculum_import_uploaded_by",
      },
      {
        fields: ["extraction_status"],
        name: "idx_curriculum_import_status",
      },
    ],
  }
);

export default CurriculumImport;