import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const POAttainment = sequelize.define(
  "POAttainment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    courseOfferingId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "course_offering_id",
    },

    programOutcomeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "program_outcome_id",
    },

    attainmentValue: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: "attainment_value",
    },

    attainmentLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "attainment_level",
      validate: {
        min: 1,
        max: 3,
      },
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "po_attainments",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ["course_offering_id", "program_outcome_id"],
        name: "unique_po_attainment",
      },
      {
        fields: ["course_offering_id"],
      },
      {
        fields: ["program_outcome_id"],
      },
    ],
  }
);

export default POAttainment;