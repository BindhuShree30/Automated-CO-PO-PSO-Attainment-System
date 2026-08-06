/**
 * ------------------------------------------------------------------
 * Assessment Question Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Represents a question in an Assessment and maps it to a CO.
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const AssessmentQuestion = sequelize.define(
  "AssessmentQuestion",
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

    courseOutcomeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "course_outcome_id",
    },

    questionNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "question_number",
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    maxMarks: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      field: "max_marks",
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "assessment_questions",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: [
          "assessment_id",
          "question_number",
        ],
        name: "unique_assessment_question_number",
      },
      {
        fields: ["assessment_id"],
        name: "idx_assessment_question_assessment",
      },
      {
        fields: ["course_outcome_id"],
        name: "idx_assessment_question_co",
      },
      {
        fields: ["status"],
        name: "idx_assessment_question_status",
      },
    ],
  }
);

export default AssessmentQuestion;