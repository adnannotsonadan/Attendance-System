const express = require('express');
// Use mock database if running mock server, otherwise use real database
const pool = process.env.USE_MOCK_DB === 'true' ? require('../config/mock-database') : require('../config/database');

const router = express.Router();

// Teacher Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const teacherId = req.session.userId;
    
    // Get today's attendance stats for teacher's classes
    const todayAttendance = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE DATE(a.date) = CURRENT_DATE
      AND a.marked_by = $1
      GROUP BY status
    `, [teacherId]);

    const stats = {
      present: 0,
      absent: 0
    };

    todayAttendance.rows.forEach(row => {
      stats[row.status] = parseInt(row.count);
    });

    res.render('teacher/dashboard', { 
      title: 'Teacher Dashboard',
      stats: stats
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).send('Server error');
  }
});

// Attendance Management
router.get('/attendance', async (req, res) => {
  try {
    const teacherId = req.session.userId;
    
    // Get teacher's classes
    const teacher = await pool.query('SELECT class_name FROM teachers WHERE id = $1', [teacherId]);
    const className = teacher.rows[0].class_name;
    
    // Get students in teacher's class
    const students = await pool.query('SELECT * FROM students WHERE class_name = $1 ORDER BY name', [className]);
    
    // Get today's attendance if already marked
    const todayAttendance = await pool.query(`
      SELECT student_id, status 
      FROM attendance 
      WHERE DATE(date) = CURRENT_DATE AND marked_by = $1
    `, [teacherId]);

    const attendanceMap = {};
    todayAttendance.rows.forEach(record => {
      attendanceMap[record.student_id] = record.status;
    });

    res.render('teacher/attendance', { 
      title: 'Mark Attendance',
      students: students.rows,
      className: className,
      attendanceMap: attendanceMap
    });
  } catch (error) {
    console.error('Teacher attendance error:', error);
    res.status(500).send('Server error');
  }
});

router.post('/attendance/mark', async (req, res) => {
  try {
    const teacherId = req.session.userId;
    const { attendance } = req.body; // attendance will be an object with student_id: status
    
    if (!attendance) {
      return res.redirect('/teacher/attendance?error=No attendance data provided');
    }

    // Delete existing attendance for today
    await pool.query('DELETE FROM attendance WHERE DATE(date) = CURRENT_DATE AND marked_by = $1', [teacherId]);
    
    // Insert new attendance records
    for (const [studentId, status] of Object.entries(attendance)) {
      if (status && status !== '') {
        await pool.query(
          'INSERT INTO attendance (student_id, date, status, marked_by) VALUES ($1, CURRENT_DATE, $2, $3)',
          [studentId, status, teacherId]
        );
      }
    }
    
    res.redirect('/teacher/attendance?success=Attendance marked successfully');
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.redirect('/teacher/attendance?error=Failed to mark attendance');
  }
});

// Marks Management
router.get('/marks', async (req, res) => {
  try {
    const teacherId = req.session.userId;
    
    // Get teacher's class and subject
    const teacher = await pool.query('SELECT class_name, subject FROM teachers WHERE id = $1', [teacherId]);
    const { class_name, subject } = teacher.rows[0];
    
    // Get students in teacher's class
    const students = await pool.query('SELECT * FROM students WHERE class_name = $1 ORDER BY name', [class_name]);
    
    // Get subjects for the class
    const subjects = await pool.query('SELECT * FROM subjects WHERE class_name = $1', [class_name]);
    
    // Get existing marks
    const marks = await pool.query(`
      SELECT m.*, s.name as student_name, s.roll_no, sub.subject_name
      FROM marks m
      JOIN students s ON m.student_id = s.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE m.teacher_id = $1
      ORDER BY m.date DESC, s.name
    `, [teacherId]);

    res.render('teacher/marks', { 
      title: 'Manage Marks',
      students: students.rows,
      subjects: subjects.rows,
      marks: marks.rows,
      className: class_name,
      teacherSubject: subject
    });
  } catch (error) {
    console.error('Teacher marks error:', error);
    res.status(500).send('Server error');
  }
});

router.post('/marks/add', async (req, res) => {
  try {
    const teacherId = req.session.userId;
    const { student_id, subject_id, exam_name, marks_obtained, total_marks } = req.body;
    
    await pool.query(
      'INSERT INTO marks (student_id, subject_id, exam_name, marks_obtained, total_marks, teacher_id, date) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)',
      [student_id, subject_id, exam_name, marks_obtained, total_marks, teacherId]
    );
    
    res.redirect('/teacher/marks?success=Marks added successfully');
  } catch (error) {
    console.error('Add marks error:', error);
    res.redirect('/teacher/marks?error=Failed to add marks');
  }
});

// Timetable View
router.get('/timetable', async (req, res) => {
  try {
    const teacherId = req.session.userId;
    
    // Get teacher's timetable
    const timetable = await pool.query(`
      SELECT * FROM timetable 
      WHERE teacher_id = $1 
      ORDER BY 
        CASE day
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
        END,
        period
    `, [teacherId]);

    res.render('teacher/timetable', { 
      title: 'My Timetable',
      timetable: timetable.rows
    });
  } catch (error) {
    console.error('Teacher timetable error:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;