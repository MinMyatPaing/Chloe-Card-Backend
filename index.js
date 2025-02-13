require("dotenv").config();

const express = require("express");
const sql = require("mssql");

const app = express();
app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

app.get("/api/configuration/:key", async (req, res) => {
  const { key } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
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
    res.status(500).json({ error: "Database query failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
