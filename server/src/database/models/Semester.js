/**
 * ------------------------------------------------------------------
 * Semester Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Semester = sequelize.define(
  "Semester",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    semesterNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    batchId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    academicYearId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    term: {
      type: DataTypes.ENUM("ODD", "EVEN"),
      allowNull: false,
    },

    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    isCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "semesters",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ["batch_id", "semester_number"],
      },
      {
        fields: ["academic_year_id"],
      },
    ],
  }
);

export default Semester;