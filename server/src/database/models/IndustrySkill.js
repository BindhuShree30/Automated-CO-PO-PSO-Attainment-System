import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const IndustrySkill = sequelize.define(
  "IndustrySkill",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    domainId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "domain_id",
    },

    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    importance: {
      type: DataTypes.ENUM(
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL"
      ),
      allowNull: false,
      defaultValue: "MEDIUM",
    },

    isEmerging: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_emerging",
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    sourceType: {
      type: DataTypes.ENUM(
        "AI_DISCOVERED",
        "ADMIN_ADDED",
        "IMPORTED"
      ),
      allowNull: false,
      defaultValue: "AI_DISCOVERED",
      field: "source_type",
    },
  },
  {
    tableName: "industry_skills",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        fields: ["domain_id"],
        name: "idx_industry_skill_domain",
      },
      {
        fields: ["category"],
        name: "idx_industry_skill_category",
      },
      {
        fields: ["importance"],
        name: "idx_industry_skill_importance",
      },
      {
        fields: ["is_emerging"],
        name: "idx_industry_skill_emerging",
      },
      {
        fields: ["status"],
        name: "idx_industry_skill_status",
      },
    ],
  }
);

export default IndustrySkill;