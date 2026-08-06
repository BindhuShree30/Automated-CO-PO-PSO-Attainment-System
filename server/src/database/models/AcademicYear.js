/**
 * ------------------------------------------------------------------
 * Academic Year Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const AcademicYear = sequelize.define(
  "AcademicYear",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Academic Year name is required.",
        },
      },
    },

    startYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2000,
        max: 2100,
      },
    },

    endYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2001,
        max: 2101,
      },
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
    tableName: "academic_years",

    timestamps: true,

    underscored: true,
  }
);

export default AcademicYear;