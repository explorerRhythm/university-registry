const router = require("express").Router();
const pool = require("../db");

// Faculties with their courses (drives the dropdowns) and headline numbers.
router.get("/meta", async (_req, res, next) => {
  try {
    const [faculties] = await pool.query("SELECT id, name FROM faculties ORDER BY name");
    const [courses] = await pool.query(
      "SELECT id, name, code, faculty_id AS facultyId FROM courses ORDER BY name"
    );
    const [years] = await pool.query(
      "SELECT DISTINCT admission_year AS year FROM students ORDER BY year DESC"
    );
    res.json({
      faculties: faculties.map((f) => ({
        ...f,
        courses: courses.filter((c) => c.facultyId === f.id),
      })),
      years: years.map((y) => y.year),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/stats", async (_req, res, next) => {
  try {
    const [[totals]] = await pool.query(
      `SELECT (SELECT COUNT(*) FROM students) AS students,
              (SELECT COUNT(*) FROM faculties) AS faculties,
              (SELECT COUNT(*) FROM courses) AS courses,
              (SELECT MIN(admission_year) FROM students) AS since`
    );
    res.json(totals);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
