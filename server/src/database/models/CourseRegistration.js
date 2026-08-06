/**
 * ------------------------------------------------------------------
 * Course Registration Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Represents the registration of a Student in a Course Offering.
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const CourseRegistration = sequelize.define(
  "CourseRegistration",
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

    courseOfferingId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "course_offering_id",
    },

    registrationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "registration_date",
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "course_registrations",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: [
          "student_id",
          "course_offering_id",
        ],
        name: "unique_student_course_offering_registration",
      },
      {
        fields: ["student_id"],
        name: "idx_course_registration_student",
      },
      {
        fields: ["course_offering_id"],
        name: "idx_course_registration_offering",
      },
      {
        fields: ["status"],
        name: "idx_course_registration_status",
      },
    ],
  }
);

export default CourseRegistration;