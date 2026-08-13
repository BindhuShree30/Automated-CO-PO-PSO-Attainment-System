/**
 * ------------------------------------------------------------------
 * Faculty Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Stores academic faculty information.
 *
 * Authentication information is stored in the User model.
 * Academic faculty information is stored here.
 *
 * status:
 * false = registered but not approved
 * true  = approved and active
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

    /**
     * false = waiting for HOD approval
     * true  = approved / active
     */
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "faculties",
    timestamps: true,
    underscored: true,
  }
);

export default Faculty;