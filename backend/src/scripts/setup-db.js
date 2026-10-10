require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const hosted = process.env.DB_SSL === "true";
const dbName = process.env.DB_NAME || "university_registry";
// Hosted databases already exist, so skip CREATE DATABASE / USE.
const clean = (sql) =>
  hosted ? sql.replace(/CREATE DATABASE[^;]*;/i, "").replace(/USE\s+\w+;/gi, "") : sql;

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: hosted ? dbName : undefined,
    ssl: hosted ? { rejectUnauthorized: false } : undefined,
    multipleStatements: true,
  });
  const dir = path.join(__dirname, "../../../database");
  try {
    await conn.query(clean(fs.readFileSync(path.join(dir, "schema.sql"), "utf8")));
    console.log("✔ Schema created");
    await conn.query(clean(fs.readFileSync(path.join(dir, "seed.sql"), "utf8")));
    const [[{ n }]] = await conn.query(`SELECT COUNT(*) AS n FROM \`${dbName}\`.students`);
    console.log(`✔ Seeded ${n} students`);
  } catch (err) {
    console.error("✘ Setup failed:", err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();