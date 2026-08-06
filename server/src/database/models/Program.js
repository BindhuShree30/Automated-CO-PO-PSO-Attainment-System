/**
 * ------------------------------------------------------------------
 * Program Model
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";
import Department from "./Department.js";

const Program = sequelize.define(
  "Program",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4,
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "department_id",
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "programs",
    timestamps: true,
  }
);

// Relationships
// Relationships
Department.hasMany(Program, {
  foreignKey: "departmentId",
  as: "programs",
});

Program.belongsTo(Department, {
  foreignKey: "departmentId",
  as: "department",
});

export default Program;