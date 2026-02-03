// server.js

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ================= Middleware =================
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// ================= MySQL Config (Workbench) =================
const db = mysql.createConnection({
  host: process.env.DB_HOST,     // localhost
  port: process.env.DB_PORT,     // 3306
  user: process.env.DB_USER,     // root
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ================= Connect to MySQL =================
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
    return;
  }
  console.log("✅ MySQL Connected (Workbench)");
});

// ================= POST API — Insert User =================
app.post("/users", (req, res) => {
  const { name, location, email, phone } = req.body;

  if (!name || !location || !email || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql =
    "INSERT INTO users (name, location, email, phone) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, location, email, phone], (err, result) => {
    if (err) {
      console.error("❌ Insert Error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.status(201).json({
      message: "User inserted successfully",
      id: result.insertId,
    });
  });
});

// ================= GET API — Fetch Users =================
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Fetch Error:", err.message);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
});

// ================= Root =================
app.get("/", (req, res) => {
  res.send("🚀 Backend running with MySQL Workbench");
});

// ================= Start Server =================
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
