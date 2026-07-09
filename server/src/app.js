import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import env from "./config/env.config.js";
import routes from "./routes/index.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

// Security
app.use(helmet());
app.use(compression());

// Logging
app.use(morgan("dev"));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

// All API Routes
app.use("/api/v1", routes);
// Global Error Middleware
app.use(errorMiddleware);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: null,
    error: "NOT_FOUND",
  });
});

export default app;