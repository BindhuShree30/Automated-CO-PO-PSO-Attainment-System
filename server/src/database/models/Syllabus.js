/**
 * ------------------------------------------------------------------
 * Syllabus Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Stores uploaded syllabus documents for a Course Offering.
 *
 * Curriculum Gap Flow:
 *
 * Course Offering
 *       ↓
 * Syllabus
 *       ↓
 * Extracted Curriculum Content
 *       ↓
 * Industry Skill Comparison
 *       ↓
 * Curriculum Gap Analysis
 *
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";

import sequelize from "../connection.js";

const Syllabus = sequelize.define(
  "Syllabus",
  {
    /**
     * --------------------------------------------------------------
     * Syllabus ID
     * --------------------------------------------------------------
     */
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    /**
     * --------------------------------------------------------------
     * Course Offering
     * --------------------------------------------------------------
     */
    courseOfferingId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "course_offering_id",
    },

    /**
     * --------------------------------------------------------------
     * Uploaded File Name
     * --------------------------------------------------------------
     */
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "file_name",
    },

    /**
     * --------------------------------------------------------------
     * Stored File Path
     * --------------------------------------------------------------
     */
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: "file_path",
    },

    /**
     * --------------------------------------------------------------
     * Extracted Text
     *
     * Text extracted from the uploaded syllabus PDF.
     *
     * Nullable because extraction happens after upload.
     * --------------------------------------------------------------
     */
    extractedText: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      field: "extracted_text",
    },

    /**
     * --------------------------------------------------------------
     * Analysis Status
     * --------------------------------------------------------------
     */
    analysisStatus: {
      type: DataTypes.ENUM(
        "UPLOADED",
        "EXTRACTING",
        "EXTRACTED",
        "ANALYZING",
        "COMPLETED",
        "FAILED"
      ),
      allowNull: false,
      defaultValue: "UPLOADED",
      field: "analysis_status",
    },

    /**
     * --------------------------------------------------------------
     * Uploaded By
     *
     * Stores the authenticated User ID.
     * --------------------------------------------------------------
     */
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "uploaded_by",
    },

    /**
     * --------------------------------------------------------------
     * Upload Timestamp
     * --------------------------------------------------------------
     */
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "uploaded_at",
    },
  },

  {
    tableName: "syllabi",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        fields: ["course_offering_id"],
        name: "idx_syllabus_course_offering",
      },
      {
        fields: ["uploaded_by"],
        name: "idx_syllabus_uploaded_by",
      },
      {
        fields: ["analysis_status"],
        name: "idx_syllabus_analysis_status",
      },
    ],
  }
);

export default Syllabus;