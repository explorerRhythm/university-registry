const router = require("express").Router();
const pool = require("../db");

const BASE_SELECT = `
  SELECT s.id, s.student_id AS studentId, s.name,
         s.faculty_id AS facultyId, f.name AS faculty,
         s.course_id AS courseId,  c.name AS course, c.code AS courseCode,
         s.admission_year AS admissionYear, s.created_at AS createdAt
  FROM students s
  JOIN faculties f ON f.id = s.faculty_id
  JOIN courses   c ON c.id = s.course_id`;

const SORTS = {
  name: "s.name",
  studentId: "s.student_id",
  faculty: "f.name",
  course: "c.name",
  year: "s.admission_year",
  added: "s.created_at",
};

// ---------- validation ----------
async function validate(body, ignoreId = null) {
  const errors = {};
  const studentId = String(body.studentId || "").trim();
  const name = String(body.name || "").trim();
  const facultyId = Number(body.facultyId);
  const courseId = Number(body.courseId);
  const admissionYear = Number(body.admissionYear);

  if (!name) errors.name = "Enter the student's full name";
  else if (name.length > 120) errors.name = "Name is too long (120 characters max)";
  if (!studentId) errors.studentId = "Enter a student ID";
  else if (!/^[A-Za-z0-9-]{3,30}$/.test(studentId))
    errors.studentId = "Use 3–30 letters, numbers or hyphens";
  if (!facultyId) errors.facultyId = "Choose a faculty";
  if (!courseId) errors.courseId = "Choose a course";
  const thisYear = new Date().getFullYear();
  if (!Number.isInteger(admissionYear) || admissionYear < 1990 || admissionYear > thisYear + 1)
    errors.admissionYear = "Enter a valid admission year";

  if (!errors.courseId && !errors.facultyId) {
    const [rows] = await pool.query("SELECT faculty_id FROM courses WHERE id = ?", [courseId]);
    if (!rows.length) errors.courseId = "That course does not exist";
    else if (rows[0].faculty_id !== facultyId)
      errors.courseId = "That course does not belong to the chosen faculty";
  }
  if (!errors.studentId) {
    const [dupe] = await pool.query(
      "SELECT id FROM students WHERE student_id = ? AND id <> ?",
      [studentId, ignoreId || 0]
    );
    if (dupe.length) errors.studentId = "This student ID is already registered";
  }
  return { errors, data: { studentId, name, facultyId, courseId, admissionYear } };
}

// ---------- list + filter ----------
router.get("/", async (req, res, next) => {
  try {
    const { search = "", faculty, course, year, sort = "added", dir = "desc" } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

    const where = [];
    const params = [];
    if (search.trim()) {
      where.push("(s.name LIKE ? OR s.student_id LIKE ?)");
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }
    if (faculty) { where.push("s.faculty_id = ?"); params.push(Number(faculty)); }
    if (course)  { where.push("s.course_id = ?");  params.push(Number(course)); }
    if (year)    { where.push("s.admission_year = ?"); params.push(Number(year)); }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const orderCol = SORTS[sort] || SORTS.added;
    const orderDir = String(dir).toLowerCase() === "asc" ? "ASC" : "DESC";

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM students s ${whereSql}`, params
    );
    const [rows] = await pool.query(
      `${BASE_SELECT} ${whereSql} ORDER BY ${orderCol} ${orderDir}, s.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );
    res.json({ data: rows, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (e) {
    next(e);
  }
});

// ---------- suggest next student ID ----------
router.get("/next-id", async (req, res, next) => {
  try {
    const courseId = Number(req.query.courseId);
    const year = Number(req.query.year);
    const [[course]] = await pool.query("SELECT code FROM courses WHERE id = ?", [courseId]);
    if (!course || !year) return res.json({ studentId: "" });
    const prefix = `${year}-${course.code}-`;
    const [[{ last }]] = await pool.query(
      "SELECT MAX(CAST(SUBSTRING_INDEX(student_id, '-', -1) AS UNSIGNED)) AS last FROM students WHERE student_id LIKE ?",
      [`${prefix}%`]
    );
    res.json({ studentId: `${prefix}${String((last || 0) + 1).padStart(3, "0")}` });
  } catch (e) {
    next(e);
  }
});

// ---------- create ----------
router.post("/", async (req, res, next) => {
  try {
    const { errors, data } = await validate(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ errors });
    const [result] = await pool.query(
      `INSERT INTO students (student_id, name, faculty_id, course_id, admission_year)
       VALUES (?, ?, ?, ?, ?)`,
      [data.studentId, data.name, data.facultyId, data.courseId, data.admissionYear]
    );
    const [[row]] = await pool.query(`${BASE_SELECT} WHERE s.id = ?`, [result.insertId]);
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

// ---------- update ----------
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [exists] = await pool.query("SELECT id FROM students WHERE id = ?", [id]);
    if (!exists.length) return res.status(404).json({ error: "Student not found" });
    const { errors, data } = await validate(req.body, id);
    if (Object.keys(errors).length) return res.status(400).json({ errors });
    await pool.query(
      `UPDATE students SET student_id=?, name=?, faculty_id=?, course_id=?, admission_year=? WHERE id=?`,
      [data.studentId, data.name, data.facultyId, data.courseId, data.admissionYear, id]
    );
    const [[row]] = await pool.query(`${BASE_SELECT} WHERE s.id = ?`, [id]);
    res.json(row);
  } catch (e) {
    next(e);
  }
});

// ---------- delete ----------
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM students WHERE id = ?", [Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ error: "Student not found" });
    res.json({ deleted: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
