// server.js

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise"); // ✅ use promise version
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ================= Middleware =================
app.use(cors()); // ✅ allow all origins (frontend friendly)
app.use(express.json());

// ================= MySQL Config (Aiven) =================
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ================= Test DB Connection =================
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ MySQL connected (Aiven)");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
})();

// ================= POST API — Insert User =================
app.post("/users", async (req, res) => {
  try {
    const { name, location, email, phone } = req.body;

    if (!name || !location || !email || !phone) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const sql =
      "INSERT INTO users (name, location, email, phone) VALUES (?, ?, ?, ?)";

    const [result] = await db.execute(sql, [
      name,
      location,
      email,
      phone,
    ]);

    res.status(201).json({
      message: "User inserted successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error("❌ Insert Error:", err.message);
    res.status(500).json({
      message: "Database error",
    });
  }
});

// ================= GET API — Fetch Users =================
app.get("/users", async (req, res) => {
  try {
    const sql = "SELECT * FROM users";
    const [rows] = await db.execute(sql);

    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err.message);
    res.status(500).json({
      message: "Database error",
    });
  }
});

// ================= Health Check =================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is healthy 🚀",
  });
});

// ================= Root =================
app.get("/", (req, res) => {
  res.send("🚀 Backend running with Aiven MySQL");
});

console.log("👉 DB NAME FROM ENV:", process.env.DB_NAME);


// ================= Start Server =================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
