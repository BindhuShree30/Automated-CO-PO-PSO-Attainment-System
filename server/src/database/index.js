/**
 * ------------------------------------------------------------------
 * Database Index
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import sequelize from "./connection.js";
import User from "./models/User.js";

const connectDatabase = async () => {
  try {
    // Test database connection
   await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // Create/update tables (TEMPORARY FOR DEVELOPMENT)
   await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized successfully.");

  } catch (error) {
    console.error("❌ Failed to connect to database.");
    console.error(error.message);
    process.exit(1);
  }
};

export { sequelize, User, connectDatabase };