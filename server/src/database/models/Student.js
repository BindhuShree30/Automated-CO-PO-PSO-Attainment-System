/**
 * ------------------------------------------------------------------
 * Student Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Represents the permanent academic identity of a Student.
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Student = sequelize.define(
  "Student",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    usn: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "first_name",
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "last_name",
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },

    programId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "program_id",
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "students",
    timestamps: true,

    indexes: [
      {
        fields: ["program_id"],
        name: "idx_student_program",
      },
      {
        fields: ["status"],
        name: "idx_student_status",
      },
    ],
  }
);

export default Student;