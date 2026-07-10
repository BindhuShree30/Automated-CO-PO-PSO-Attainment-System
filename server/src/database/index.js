/**
 * ------------------------------------------------------------------
 * Database Index
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import sequelize from "./connection.js";

// Import ALL models
import User from "./models/User.js";
import Department from "./models/Department.js";
import Program from "./models/Program.js";
import Course from "./models/Course.js"; // <-- Add this

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
    console.error(error);
    process.exit(1);
  }
};

export {
  sequelize,
  User,
  Department,
  Program,
  Course, // <-- Add this
  connectDatabase,
};