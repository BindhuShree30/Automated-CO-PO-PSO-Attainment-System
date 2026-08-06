/**
 * ------------------------------------------------------------------
 * Batch Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Batch = sequelize.define(
  "Batch",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    startYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    endYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    programId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "batches",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ["program_id", "start_year", "end_year"],
      },
    ],
  }
);

export default Batch;