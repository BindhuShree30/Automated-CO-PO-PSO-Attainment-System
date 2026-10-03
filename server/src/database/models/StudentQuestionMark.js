/**
 * ------------------------------------------------------------------
 * Student Question Mark Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Stores marks obtained by a Student for an Assessment Question.
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";

import sequelize from "../connection.js";

const StudentQuestionMark = sequelize.define(
  "StudentQuestionMark",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "student_id",
    },

    assessmentQuestionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "assessment_question_id",
    },

    marksObtained: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      field: "marks_obtained",
      validate: {
        min: 0,
      },
    },

    isAbsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_absent",
    },

    isAttempted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_attempted",
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },

  {
    tableName: "student_question_marks",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: [
          "student_id",
          "assessment_question_id",
        ],
        name: "unique_student_assessment_question_mark",
      },

      {
        fields: ["student_id"],
        name: "idx_student_question_mark_student",
      },

      {
        fields: ["assessment_question_id"],
        name: "idx_student_question_mark_question",
      },

      {
        fields: ["status"],
        name: "idx_student_question_mark_status",
      },
    ],
  }
);

export default StudentQuestionMark;