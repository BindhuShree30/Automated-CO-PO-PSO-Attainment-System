import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const SkillSource = sequelize.define(
  "SkillSource",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    industrySkillId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "industry_skill_id",
    },

    sourceType: {
      type: DataTypes.ENUM(
        "AI_DISCOVERED",
        "INDUSTRY_REPORT",
        "JOB_MARKET",
        "OFFICIAL_DOCUMENT",
        "ADMIN_ADDED",
        "IMPORTED"
      ),
      allowNull: false,
      field: "source_type",
    },

    sourceName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "source_name",
    },

    sourceReference: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      field: "source_reference",
    },

    evidence: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    confidenceScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: "confidence_score",
      validate: {
        min: 0,
        max: 100,
      },
    },
  },
  {
    tableName: "skill_sources",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        fields: ["industry_skill_id"],
        name: "idx_skill_source_skill",
      },
      {
        fields: ["source_type"],
        name: "idx_skill_source_type",
      },
      {
        fields: ["confidence_score"],
        name: "idx_skill_source_confidence",
      },
    ],
  }
);

export default SkillSource;