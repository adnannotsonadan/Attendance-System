const express = require('express');
// Use mock database if running mock server, otherwise use real database
const pool = process.env.USE_MOCK_DB === 'true' ? require('../config/mock-database') : require('../config/database');

const router = express.Router();

// Student Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const studentId = req.session.userId;
    
    // Get student info
    const student = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
    const studentInfo = student.rows[0];
    
    // Get attendance statistics
    const attendanceStats = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM attendance 
      WHERE student_id = $1 
      GROUP BY status
    `, [studentId]);

    const stats = {
      present: 0,
      absent: 0,
      total: 0
    };

    attendanceStats.rows.forEach(row => {
      stats[row.status] = parseInt(row.count);
      stats.total += parseInt(row.count);
    });

    // Calculate attendance percentage
    const attendancePercentage = stats.total > 0 ? 
      ((stats.present / stats.total) * 100).toFixed(1) : 0;

    res.render('student/dashboard', { 
      title: 'Student Dashboard',
      stats: stats,
      attendancePercentage: attendancePercentage,
      studentInfo: studentInfo
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).send('Server error');
  }
});

// Attendance View
router.get('/attendance', async (req, res) => {
  try {
    const studentId = req.session.userId;
    
    // Get student info
    const student = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
    const studentInfo = student.rows[0];
    
    // Get detailed attendance records
    const attendanceRecords = await pool.query(`
      SELECT a.*, t.name as teacher_name
      FROM attendance a
      LEFT JOIN teachers t ON a.marked_by = t.id
      WHERE a.student_id = $1
      ORDER BY a.date DESC
      LIMIT 100
    `, [studentId]);

    // Get attendance statistics
    const attendanceStats = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM attendance 
      WHERE student_id = $1 
      GROUP BY status
    `, [studentId]);

    const stats = {
      present: 0,
      absent: 0,
      total: 0
    };

    attendanceStats.rows.forEach(row => {
      stats[row.status] = parseInt(row.count);
      stats.total += parseInt(row.count);
    });

    // Calculate attendance percentage
    const attendancePercentage = stats.total > 0 ? 
      ((stats.present / stats.total) * 100).toFixed(1) : 0;

    res.render('student/attendance', { 
      title: 'My Attendance',
      attendance: attendanceRecords.rows,
      stats: stats,
      attendancePercentage: attendancePercentage,
      studentInfo: studentInfo
    });
  } catch (error) {
    console.error('Student attendance error:', error);
    res.status(500).send('Server error');
  }
});

// Marks View
router.get('/marks', async (req, res) => {
  try {
    const studentId = req.session.userId;
    
    // Get student info
    const student = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
    const studentInfo = student.rows[0];
    
    // Get marks records
    const marksRecords = await pool.query(`
      SELECT m.*, sub.subject_name, t.name as teacher_name
      FROM marks m
      JOIN subjects sub ON m.subject_id = sub.id
      LEFT JOIN teachers t ON m.teacher_id = t.id
      WHERE m.student_id = $1
      ORDER BY m.date DESC, sub.subject_name
    `, [studentId]);

    // Calculate overall statistics
    let totalMarks = 0;
    let totalMaxMarks = 0;
    const subjectStats = {};

    marksRecords.rows.forEach(mark => {
      totalMarks += mark.marks_obtained;
      totalMaxMarks += mark.total_marks;
      
      if (!subjectStats[mark.subject_name]) {
        subjectStats[mark.subject_name] = {
          obtained: 0,
          total: 0,
          count: 0
        };
      }
      subjectStats[mark.subject_name].obtained += mark.marks_obtained;
      subjectStats[mark.subject_name].total += mark.total_marks;
      subjectStats[mark.subject_name].count += 1;
    });

    const overallPercentage = totalMaxMarks > 0 ? 
      ((totalMarks / totalMaxMarks) * 100).toFixed(1) : 0;

    res.render('student/marks', { 
      title: 'My Marks',
      marks: marksRecords.rows,
      studentInfo: studentInfo,
      overallPercentage: overallPercentage,
      subjectStats: subjectStats
    });
  } catch (error) {
    console.error('Student marks error:', error);
    res.status(500).send('Server error');
  }
});

// Timetable View
router.get('/timetable', async (req, res) => {
  try {
    const studentId = req.session.userId;
    
    // Get student info
    const student = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
    const studentInfo = student.rows[0];
    const className = studentInfo.class_name;
    
    // Get class timetable
    const timetable = await pool.query(`
      SELECT t.*, te.name as teacher_name
      FROM timetable t
      LEFT JOIN teachers te ON t.teacher_id = te.id
      WHERE t.class_name = $1
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
    `, [className]);

    res.render('student/timetable', { 
      title: 'Class Timetable',
      timetable: timetable.rows,
      studentInfo: studentInfo,
      className: className
    });
  } catch (error) {
    console.error('Student timetable error:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;