-- University Student Registry schema
CREATE DATABASE IF NOT EXISTS university_registry
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE university_registry;

DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS faculties;

CREATE TABLE faculties (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE courses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  faculty_id INT UNSIGNED NOT NULL,
  CONSTRAINT fk_course_faculty FOREIGN KEY (faculty_id)
    REFERENCES faculties(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE students (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  faculty_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED NOT NULL,
  admission_year SMALLINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_faculty FOREIGN KEY (faculty_id) REFERENCES faculties(id),
  CONSTRAINT fk_student_course  FOREIGN KEY (course_id)  REFERENCES courses(id),
  INDEX idx_students_name (name),
  INDEX idx_students_faculty (faculty_id),
  INDEX idx_students_course (course_id),
  INDEX idx_students_year (admission_year)
) ENGINE=InnoDB;
