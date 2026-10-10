require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const studentRoutes = require("./routes/students");
const metaRoutes = require("./routes/meta");

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000" }));
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Database unreachable" });
  }
});

app.use("/api", metaRoutes);
app.use("/api/students", studentRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
