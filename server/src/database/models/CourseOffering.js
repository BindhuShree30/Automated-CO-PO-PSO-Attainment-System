/**
 * ------------------------------------------------------------------
 * Course Offering Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const CourseOffering = sequelize.define(
  "CourseOffering",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    batchId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    semesterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    facultyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    section: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "course_offerings",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: [
          "course_id",
          "batch_id",
          "semester_id",
          "section",
        ],
      },
      {
        fields: ["faculty_id"],
      },
      {
        fields: ["semester_id"],
      },
    ],
  }
);

export default CourseOffering;