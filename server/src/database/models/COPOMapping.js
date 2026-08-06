/**
 * ------------------------------------------------------------------
 * CO-PO Mapping Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const COPOMapping = sequelize.define(
  "COPOMapping",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    courseOutcomeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "course_outcome_id",
    },

    programOutcomeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "program_outcome_id",
    },

    mappingLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "mapping_level",
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
    tableName: "co_po_mappings",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        name: "unique_co_po_mapping",
        fields: [
          "course_outcome_id",
          "program_outcome_id",
        ],
      },
      {
        name: "idx_co_po_course_outcome",
        fields: ["course_outcome_id"],
      },
      {
        name: "idx_co_po_program_outcome",
        fields: ["program_outcome_id"],
      },
      {
        name: "idx_co_po_status",
        fields: ["status"],
      },
    ],
  }
);

export default COPOMapping;