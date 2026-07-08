import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import env from "./config/env.config.js";

const app = express();

app.use(helmet());

app.use(compression());

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
    data: {
      status: "OK",
    },
    error: null,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    data: null,
    error: "NOT_FOUND",
  });
});

export default app;
