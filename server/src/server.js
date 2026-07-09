/**
 * ------------------------------------------------------------------
 * Server Entry Point
 * ------------------------------------------------------------------
 */

import app from "./app.js";
import env from "./config/env.config.js";
import { connectDatabase } from "./database/index.js";

const PORT = env.port;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log("=================================");
    console.log("🚀 OBE Backend Server Started");
    console.log(`🌍 Environment : ${env.nodeEnv}`);
    console.log(`📡 Server URL  : http://localhost:${PORT}`);
    console.log("=================================");
  });
};

startServer();