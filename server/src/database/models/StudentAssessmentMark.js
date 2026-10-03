/**
 * ------------------------------------------------------------------
 * Student Assessment Mark Model (Direct / Overall Marks)
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Stores overall scores for Quiz, Assignment, Lab, SEE, Project
 * where question-level breakdowns do not exist.
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js"; // Adjust path to connection.js if needed

const StudentAssessmentMark = sequelize.define(
  "StudentAssessmentMark",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    assessmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "assessment_id",
    },

    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "student_id",
    },

    marksObtained: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      field: "marks_obtained",
    },

    isAbsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_absent",
    },
  },
  {
    tableName: "student_assessment_marks",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["assessment_id", "student_id"],
        name: "uniq_assessment_student",
      },
      {
        fields: ["assessment_id"],
        name: "idx_sam_assessment",
      },
      {
        fields: ["student_id"],
        name: "idx_sam_student",
      },
    ],
  }
);

export default StudentAssessmentMark;