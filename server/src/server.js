import app from "./app.js";
import env from "./config/env.config.js";

const PORT = env.port;

app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 OBE Backend Server Started");
  console.log(`🌍 Environment : ${env.nodeEnv}`);
  console.log(`📡 Server URL  : http://localhost:${PORT}`);
  console.log("=================================");
});
