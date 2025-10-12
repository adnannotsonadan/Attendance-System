-- School Management System Database Schema

-- Create the database (run this first)
-- CREATE DATABASE school_management;

-- Use this database
-- \c school_management;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS marks_log CASCADE;
DROP TABLE IF EXISTS marks CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- 1. Admins table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Teachers table
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    subject TEXT NOT NULL,
    class_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    roll_no TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    class_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Classes table
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    class_name TEXT NOT NULL,
    teacher_id INT REFERENCES teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Subjects table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    subject_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Attendance table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    marked_by INT REFERENCES teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Marks table
CREATE TABLE marks (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    exam_name TEXT NOT NULL,
    marks_obtained INT NOT NULL,
    total_marks INT NOT NULL,
    teacher_id INT REFERENCES teachers(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Marks log table (for tracking changes)
CREATE TABLE marks_log (
    id SERIAL PRIMARY KEY,
    marks_id INT REFERENCES marks(id) ON DELETE CASCADE,
    old_value INT NOT NULL,
    new_value INT NOT NULL,
    changed_by INT REFERENCES admins(id) ON DELETE SET NULL,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Timetable table
CREATE TABLE timetable (
    id SERIAL PRIMARY KEY,
    class_name TEXT NOT NULL,
    day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    period TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_id INT REFERENCES teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo data
-- Demo Admin
INSERT INTO admins (name, email, password) VALUES 
('Admin User', 'admin@school.com', '$2b$10$8K9qHHh8zJx9J8X9J8X9JO8X9J8X9J8X9J8X9J8X9J8X9J8X9J8X9J');

-- Demo Teacher
INSERT INTO teachers (name, email, password, subject, class_name) VALUES 
('Teacher User', 'teacher@school.com', '$2b$10$8K9qHHh8zJx9J8X9J8X9JO8X9J8X9J8X9J8X9J8X9J8X9J8X9J8X9J', 'Mathematics', '10A');

-- Demo Student
INSERT INTO students (name, roll_no, email, password, class_name) VALUES 
('Student User', 'STU001', 'student@school.com', '$2b$10$8K9qHHh8zJx9J8X9J8X9JO8X9J8X9J8X9J8X9J8X9J8X9J8X9J8X9J', '10A');

-- Insert some sample classes
INSERT INTO classes (class_name, teacher_id) VALUES 
('10A', 1),
('10B', 1),
('9A', 1);

-- Insert some sample subjects
INSERT INTO subjects (subject_name, class_name) VALUES 
('Mathematics', '10A'),
('Physics', '10A'),
('Chemistry', '10A'),
('English', '10A');

-- Insert sample timetable
INSERT INTO timetable (class_name, day, period, subject, teacher_id) VALUES 
('10A', 'Monday', '1', 'Mathematics', 1),
('10A', 'Monday', '2', 'Physics', 1),
('10A', 'Tuesday', '1', 'Chemistry', 1),
('10A', 'Tuesday', '2', 'English', 1);

-- Create indexes for better performance
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_marks_student_subject ON marks(student_id, subject_id);
CREATE INDEX idx_timetable_class_day ON timetable(class_name, day);