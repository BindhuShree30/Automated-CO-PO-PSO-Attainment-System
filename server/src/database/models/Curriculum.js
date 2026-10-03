/**
 * ------------------------------------------------------------------
 * Curriculum Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Represents a reusable academic curriculum / scheme for a program.
 *
 * Example:
 * BE-CSE-2022
 *
 * Subjects are NOT hard-coded here.
 * They are connected through curriculum_courses.
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Curriculum = sequelize.define(
  "Curriculum",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    programId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "program_id",
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    regulationYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "regulation_year",
    },

    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 8,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "curriculums",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ["code"],
        name: "uq_curriculum_code",
      },
      {
        fields: ["program_id"],
        name: "idx_curriculum_program",
      },
    ],
  }
);

export default Curriculum;