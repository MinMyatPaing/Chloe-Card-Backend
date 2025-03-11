import dotenv from "dotenv";

dotenv.config();

import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";

import { checkConnection, initializePool, closePool } from "./config/db.js";
import openAiRoutes from "./routes/openAi.js";
import authRoutes from "./routes/auth.js";

const app = express();

// Middleware parsers
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Public Home route
app.get("/", (req, res) => {
  res.json({
    message: "Chloe Card Backend API",
    status: "running",
    endpoints: [
      "/health - Health check endpoint",
      "/api/auth/register - Register a new user",
      "/api/auth/login - Login",
    ],
    version: "1.0.0",
  });
});

// Health check endpoint
app.get("/health", async (req, res) => {
  const isConnected = await checkConnection();

  res.json({
    status: "UP",
    database: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// App Routes
app.use("/api/openai", openAiRoutes);
app.use("/api/auth", authRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler - returns JSON
app.use(function (err, req, res, next) {
  console.error(err);

  res.status(err.status || 500);
  res.json({
    error: "An error occurred",
    message:
      req.app.get("env") === "development"
        ? err.message
        : "Internal server error",
  });
});

// Start the server
const PORT = process.env.PORT || 8181;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Initialize database connection
  initializePool().catch((err) =>
    console.error("Pool initialization failed:", err)
  );
});

// Handle server shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await closePool();
  process.exit(0);
});
