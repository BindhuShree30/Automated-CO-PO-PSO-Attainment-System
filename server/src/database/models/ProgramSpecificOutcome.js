import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const ProgramSpecificOutcome = sequelize.define(
  "ProgramSpecificOutcome",
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
    tableName: "program_specific_outcomes",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["program_id", "code"],
      },
    ],
  }
);

export default ProgramSpecificOutcome;