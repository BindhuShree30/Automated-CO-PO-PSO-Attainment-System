/**
 * ---------------------------------------------------------
 * User Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ---------------------------------------------------------
 *
 * Stores authenticated application users.
 *
 * Current Roles:
 * - HOD
 * - FACULTY
 *
 * Students are academic records and do not have
 * application login accounts.
 *
 * Faculty registration starts with PENDING status.
 * HOD approval changes the status to APPROVED.
 * HOD rejection changes the status to REJECTED.
 * ---------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";
import ROLES from "../../shared/constants/roles.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "First name is required",
        },
      },
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Last name is required",
        },
      },
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Invalid email address",
        },
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    role: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      allowNull: false,
      defaultValue: ROLES.FACULTY,
    },
    

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "APPROVED",
        "REJECTED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

export default User;