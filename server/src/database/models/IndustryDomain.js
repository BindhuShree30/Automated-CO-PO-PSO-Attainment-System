import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const IndustryDomain = sequelize.define(
  "IndustryDomain",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Industry domain name is required.",
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "industry_domains",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ["name"],
        name: "unique_industry_domain_name",
      },
      {
        fields: ["status"],
        name: "idx_industry_domain_status",
      },
    ],
  }
);

export default IndustryDomain;