/**
 * ------------------------------------------------------------------
 * Faculty Model
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Faculty = sequelize.define(
  "Faculty",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
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

    employeeId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    designation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    departmentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "faculties",
    timestamps: true,
  }
);

export default Faculty;