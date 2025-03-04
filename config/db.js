// db.js
import dotenv from "dotenv";
dotenv.config();
import sql from "mssql";

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

// Global pool singleton
let pool = null;

/**
 * Initialize the database connection pool
 * @returns {Promise<sql.ConnectionPool>} The SQL connection pool
 */
async function initializePool() {
  try {
    if (!pool) {
      console.log("Attempting to connect to database...");
      pool = await sql.connect(dbConfig);
      console.log("Database connection established");
    }
    return pool;
  } catch (err) {
    console.error("Failed to connect to database:", err);
    throw err;
  }
}

/**
 * Get the database connection pool
 * @returns {Promise<sql.ConnectionPool>} The SQL connection pool
 */
async function getPool() {
  if (!pool) {
    return await initializePool();
  }
  return pool;
}

/**
 * Execute a SQL query
 * @param {string} query - The SQL query
 * @param {Object} params - Query parameters
 * @returns {Promise<any>} Query result
 */
async function executeQuery(query, params = {}) {
  try {
    const pool = await getPool();
    const request = pool.request();

    // Add parameters to the request
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    return await request.query(query);
  } catch (err) {
    console.error("Query execution failed:", err);
    throw err;
  }
}

/**
 * Close the database connection pool
 */
async function closePool() {
  if (pool) {
    try {
      await pool.close();
      pool = null;
      console.log("Database connection closed");
    } catch (err) {
      console.error("Error closing database connection:", err);
      throw err;
    }
  }
}

/**
 * Check if the database connection is alive
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
async function checkConnection() {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1");
    return true;
  } catch (err) {
    console.error("Database connection check failed:", err);
    return false;
  }
}

export { initializePool, getPool, executeQuery, closePool, checkConnection };
