require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const sql = require("mssql");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectionTimeout: 30000, // 30 seconds
  },
};

// console.log("Environment check:");
// console.log("DB_SERVER exists:", !!process.env.DB_SERVER);
// console.log("DB_NAME exists:", !!process.env.DB_NAME);
// console.log("DB_USER exists:", !!process.env.DB_USER);
// console.log("DB_PASSWORD exists:", !!process.env.DB_PASSWORD?.length > 0);
// console.log("Environment PORT value:", process.env.PORT);

// Global pool
let pool = null;

// Initialize pool
async function initializePool() {
  try {
    console.log("Attempting to connect to database...");
    pool = await sql.connect(dbConfig);
    console.log("Database connection established");
    return pool;
  } catch (err) {
    console.error("Failed to connect to database:", err);
    return null;
  }
}

app.get("/", (req, res) => {
  res.json({ 
    message: "Chloe Card Backend API", 
    status: "running",
    endpoints: [
      "/health - Health check endpoint",
      "/api/configuration/:key - Get configuration by key"
    ],
    version: "1.0.0"
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "UP", 
    database: pool ? "connected" : "disconnected",
    timestamp: new Date().toISOString() 
  });
});

app.get("/api/configuration/:key", async (req, res) => {
  const { key } = req.params;

  try {
    // Initialize pool if not already done
    if (!pool) {
      pool = await initializePool();
      if (!pool) {
        return res.status(503).json({ error: "Database connection unavailable" });
      }
    }
    
    const result = await pool
      .request()
      .input("KeyName", sql.NVarChar(50), key)
      .query("SELECT KeyValue FROM Configuration WHERE KeyName = @KeyName");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Key not found" });
    }

    res.json({ key, value: result.recordset[0].KeyValue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed", message: err.message });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler - FIXED to return JSON instead of rendering a view
app.use(function (err, req, res, next) {
  console.error(err);
  
  res.status(err.status || 500);
  res.json({
    error: "An error occurred",
    message: req.app.get("env") === "development" ? err.message : "Internal server error"
  });
});

// Start the server - Force use of port 8181 for testing
const PORT = 8181; // temporarily hardcode to debug
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Initialize database connection
  initializePool().catch(err => console.error("Pool initialization failed:", err));
});

module.exports = app;