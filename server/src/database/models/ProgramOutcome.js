import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const ProgramOutcome = sequelize.define(
  "ProgramOutcome",
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

    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "program_outcomes",
    timestamps: true,
    underscored: true,
  }
);

export default ProgramOutcome;