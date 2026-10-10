// Runs database/schema.sql and database/seed.sql using your .env credentials.
// Usage: npm run db:setup
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });
  const dir = path.join(__dirname, "../../../database");
  try {
    await conn.query(fs.readFileSync(path.join(dir, "schema.sql"), "utf8"));
    console.log("✔ Schema created");
    await conn.query(fs.readFileSync(path.join(dir, "seed.sql"), "utf8"));
    const [[{ n }]] = await conn.query(
      "SELECT COUNT(*) AS n FROM university_registry.students"
    );
    console.log(`✔ Seeded ${n} students`);
  } catch (err) {
    console.error("✘ Setup failed:", err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
