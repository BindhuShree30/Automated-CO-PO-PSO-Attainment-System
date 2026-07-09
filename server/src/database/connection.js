/**
 * ------------------------------------------------------------------
 * Database Connection
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 * Creates and exports a single Sequelize instance.
 * This file is used throughout the application.
 * ------------------------------------------------------------------
 */

import { Sequelize } from "sequelize";
import env from "../config/env.config.js";

const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: "mysql",

    logging: env.nodeEnv === "development" ? console.log : false,

    define: {
      timestamps: true,
      underscored: true,
    },

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;