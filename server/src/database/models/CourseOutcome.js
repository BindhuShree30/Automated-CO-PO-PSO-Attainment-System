/**
 * ------------------------------------------------------------------
 * Course Outcome Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const CourseOutcome = sequelize.define(
  "CourseOutcome",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "course_id",
    },

    coNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "co_number",

      validate: {
        min: 1,
      },
    },

    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    bloomLevel: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "bloom_level",
    },

    targetAttainment: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 60.0,
      field: "target_attainment",
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "course_outcomes",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: [
          "course_id",
          "co_number",
        ],
        name: "unique_course_co_number",
      },

      {
        unique: true,
        fields: [
          "course_id",
          "code",
        ],
        name: "unique_course_co_code",
      },

      {
        fields: ["course_id"],
        name: "idx_course_outcome_course",
      },

      {
        fields: ["status"],
        name: "idx_course_outcome_status",
      },
    ],
  }
);

/**
 * ------------------------------------------------------------------
 * Associations
 * ------------------------------------------------------------------
 */

CourseOutcome.associate = (models) => {
  CourseOutcome.hasMany(models.AssessmentQuestion, {
    foreignKey: "courseOutcomeId",
    as: "assessmentQuestions",
  });
};

export default CourseOutcome;