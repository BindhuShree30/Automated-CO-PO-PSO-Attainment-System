import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const CoPsoMapping = sequelize.define(
  "CoPsoMapping",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    courseOutcomeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "course_outcome_id",
    },

    programSpecificOutcomeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "program_specific_outcome_id",
    },

    mappingLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "mapping_level",
      validate: {
        isIn: [[1, 2, 3]],
      },
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "co_pso_mappings",
    timestamps: true,
    underscored: true,
  }
);

export default CoPsoMapping;