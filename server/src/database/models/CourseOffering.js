/**
 * ------------------------------------------------------------------
 * Course Offering Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Represents a course being offered to a batch/semester/section.
 *
 * Faculty assignment is handled separately through the
 * Faculty Assignment module.
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
      field: "course_id",
    },

    batchId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "batch_id",
    },

    semesterId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "semester_id",
    },

    section: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "section",
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "status",
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
        name: "unique_course_offering",
      },

      {
        fields: ["course_id"],
        name: "idx_course_offering_course",
      },

      {
        fields: ["batch_id"],
        name: "idx_course_offering_batch",
      },

      {
        fields: ["semester_id"],
        name: "idx_course_offering_semester",
      },

      {
        fields: ["status"],
        name: "idx_course_offering_status",
      },
    ],
  }
);

export default CourseOffering;