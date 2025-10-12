const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
// Use mock database if running mock server, otherwise use real database
const pool = process.env.USE_MOCK_DB === 'true' ? require('../config/mock-database') : require('../config/database');

// Setup multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and PDF files are allowed!'), false);
    }
  }
});

const router = express.Router();

// Admin Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get statistics for the dashboard
    const studentsResult = await pool.query('SELECT COUNT(*) as count FROM students');
    const teachersResult = await pool.query('SELECT COUNT(*) as count FROM teachers');
    const attendanceResult = await pool.query('SELECT ROUND(AVG(CASE WHEN status = \'present\' THEN 1 ELSE 0 END) * 100, 2) as avg_attendance FROM attendance');
    
    const stats = {
      students: studentsResult.rows[0].count,
      teachers: teachersResult.rows[0].count,
      avgAttendance: attendanceResult.rows[0].avg_attendance || 0
    };
    
    res.render('admin/dashboard', { 
      title: 'Admin Dashboard',
      stats: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Server error');
  }
});

// Teachers Management
router.get('/teachers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teachers ORDER BY name');
    res.render('admin/teachers', { 
      title: 'Manage Teachers',
      teachers: result.rows
    });
  } catch (error) {
    console.error('Teachers error:', error);
    res.status(500).send('Server error');
  }
});

router.post('/teachers/add', async (req, res) => {
  try {
    const { name, email, subject, class_name } = req.body;
    const password = 'teacher123'; // Default password
    
    await pool.query(
      'INSERT INTO teachers (name, email, password, subject, class_name) VALUES ($1, $2, $3, $4, $5)',
      [name, email, password, subject, class_name]
    );
    
    res.redirect('/admin/teachers?success=Teacher added successfully');
  } catch (error) {
    console.error('Add teacher error:', error);
    res.redirect('/admin/teachers?error=Failed to add teacher');
  }
});

router.post('/teachers/update', async (req, res) => {
  try {
    const { id, name, email, subject, class_name } = req.body;
    
    await pool.query(
      'UPDATE teachers SET name = $1, email = $2, subject = $3, class_name = $4 WHERE id = $5',
      [name, email, subject, class_name, id]
    );
    
    res.redirect('/admin/teachers?success=Teacher updated successfully');
  } catch (error) {
    console.error('Update teacher error:', error);
    res.redirect('/admin/teachers?error=Failed to update teacher');
  }
});

router.post('/teachers/delete/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM teachers WHERE id = $1', [req.params.id]);
    res.redirect('/admin/teachers?success=Teacher deleted successfully');
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.redirect('/admin/teachers?error=Failed to delete teacher');
  }
});

// Students Management
router.get('/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY name');
    res.render('admin/students', { 
      title: 'Manage Students',
      students: result.rows
    });
  } catch (error) {
    console.error('Students error:', error);
    res.status(500).send('Server error');
  }
});

router.post('/students/add', async (req, res) => {
  try {
    const { name, roll_no, email, class_name } = req.body;
    const password = 'student123'; // Default password
    
    await pool.query(
      'INSERT INTO students (name, roll_no, email, password, class_name) VALUES ($1, $2, $3, $4, $5)',
      [name, roll_no, email, password, class_name]
    );
    
    res.redirect('/admin/students?success=Student added successfully');
  } catch (error) {
    console.error('Add student error:', error);
    res.redirect('/admin/students?error=Failed to add student');
  }
});

router.post('/students/update', async (req, res) => {
  try {
    const { id, name, roll_no, email, class_name } = req.body;
    
    await pool.query(
      'UPDATE students SET name = $1, roll_no = $2, email = $3, class_name = $4 WHERE id = $5',
      [name, roll_no, email, class_name, id]
    );
    
    res.redirect('/admin/students?success=Student updated successfully');
  } catch (error) {
    console.error('Update student error:', error);
    res.redirect('/admin/students?error=Failed to update student');
  }
});

router.post('/students/delete/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE id = $1', [req.params.id]);
    res.redirect('/admin/students?success=Student deleted successfully');
  } catch (error) {
    console.error('Delete student error:', error);
    res.redirect('/admin/students?error=Failed to delete student');
  }
});

// Timetable Management
router.get('/timetable', async (req, res) => {
  try {
    const timetableResult = await pool.query(`
      SELECT t.*, te.name as teacher_name 
      FROM timetable t 
      LEFT JOIN teachers te ON t.teacher_id = te.id 
      ORDER BY t.class_name, t.day, t.period
    `);
    
    const teachersResult = await pool.query('SELECT * FROM teachers ORDER BY name');
    
    res.render('admin/timetable', { 
      title: 'Manage Timetable',
      timetable: timetableResult.rows,
      teachers: teachersResult.rows
    });
  } catch (error) {
    console.error('Timetable error:', error);
    res.status(500).send('Server error');
  }
});

router.post('/timetable/add', async (req, res) => {
  try {
    const { class_name, day, period, subject, teacher_id } = req.body;
    
    await pool.query(
      'INSERT INTO timetable (class_name, day, period, subject, teacher_id) VALUES ($1, $2, $3, $4, $5)',
      [class_name, day, period, subject, teacher_id]
    );
    
    res.redirect('/admin/timetable?success=Timetable entry added successfully');
  } catch (error) {
    console.error('Add timetable error:', error);
    res.redirect('/admin/timetable?error=Failed to add timetable entry');
  }
});

router.post('/timetable/update', async (req, res) => {
  try {
    const { id, class_name, day, period, subject, teacher_id } = req.body;
    
    await pool.query(
      'UPDATE timetable SET class_name = $1, day = $2, period = $3, subject = $4, teacher_id = $5 WHERE id = $6',
      [class_name, day, period, subject, teacher_id, id]
    );
    
    res.redirect('/admin/timetable?success=Timetable entry updated successfully');
  } catch (error) {
    console.error('Update timetable error:', error);
    res.redirect('/admin/timetable?error=Failed to update timetable entry');
  }
});

router.post('/timetable/delete/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM timetable WHERE id = $1', [req.params.id]);
    res.redirect('/admin/timetable?success=Timetable entry deleted successfully');
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.redirect('/admin/timetable?error=Failed to delete timetable entry');
  }
});

// Attendance Reports
router.get('/attendance', async (req, res) => {
  try {
    const attendanceResult = await pool.query(`
      SELECT a.*, s.name as student_name, s.roll_no, s.class_name, t.name as teacher_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN teachers t ON a.marked_by = t.id
      ORDER BY a.date DESC, s.class_name, s.name
      LIMIT 100
    `);
    
    res.render('admin/attendance', { 
      title: 'Attendance Reports',
      attendance: attendanceResult.rows
    });
  } catch (error) {
    console.error('Attendance error:', error);
    res.status(500).send('Server error');
  }
});

// API endpoint to get teachers data
router.get('/teachers/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, class_name FROM teachers ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Teachers data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint to get students by teacher
router.get('/students/by-teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Get teacher's class
    const teacherResult = await pool.query('SELECT class_name FROM teachers WHERE id = $1', [teacherId]);
    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    const className = teacherResult.rows[0].class_name;
    
    // Get students in that class
    const studentsResult = await pool.query('SELECT id, name, roll_no FROM students WHERE class_name = $1 ORDER BY name', [className]);
    
    res.json(studentsResult.rows);
  } catch (error) {
    console.error('Students by teacher error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark attendance
router.post('/attendance/mark', async (req, res) => {
  try {
    const { teacher_id, date, attendance } = req.body;
    
    if (!attendance) {
      return res.redirect('/admin/attendance?error=No attendance data provided');
    }

    // Delete existing attendance for this teacher and date
    await pool.query('DELETE FROM attendance WHERE DATE(date) = DATE($1) AND marked_by = $2', [date, teacher_id]);
    
    // Insert new attendance records
    for (const [studentId, status] of Object.entries(attendance)) {
      if (status && status !== '') {
        await pool.query(
          'INSERT INTO attendance (student_id, date, status, marked_by) VALUES ($1, $2, $3, $4)',
          [studentId, date, status, teacher_id]
        );
      }
    }
    
    res.redirect('/admin/attendance?success=Attendance marked successfully');
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.redirect('/admin/attendance?error=Failed to mark attendance');
  }
});

// Update attendance record
router.post('/attendance/update', async (req, res) => {
  try {
    const { recordId, status } = req.body;
    
    await pool.query('UPDATE attendance SET status = $1 WHERE id = $2', [status, recordId]);
    
    res.json({ success: true, message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.json({ success: false, message: 'Failed to update attendance' });
  }
});

// Marks Management
router.get('/marks', async (req, res) => {
  try {
    // Get all students for the marks management interface
    const studentsResult = await pool.query('SELECT * FROM students ORDER BY class_name, name');
    
    // Get all marks with detailed information
    const marksResult = await pool.query(`
      SELECT m.*, s.name as student_name, s.roll_no, s.class_name, 
             sub.subject_name, t.name as teacher_name
      FROM marks m
      JOIN students s ON m.student_id = s.id
      JOIN subjects sub ON m.subject_id = sub.id
      LEFT JOIN teachers t ON m.teacher_id = t.id
      ORDER BY m.date DESC, s.class_name, s.name
    `);
    
    res.render('admin/marks', { 
      title: 'Manage Marks',
      marks: marksResult.rows,
      students: studentsResult.rows
    });
  } catch (error) {
    console.error('Marks error:', error);
    res.status(500).send('Server error');
  }
});

router.post('/marks/edit/:id', async (req, res) => {
  try {
    const { marks_obtained } = req.body;
    const markId = req.params.id;
    
    // Get old value for logging
    const oldMarkResult = await pool.query('SELECT marks_obtained FROM marks WHERE id = $1', [markId]);
    const oldValue = oldMarkResult.rows[0].marks_obtained;
    
    // Update marks
    await pool.query('UPDATE marks SET marks_obtained = $1 WHERE id = $2', [marks_obtained, markId]);
    
    // Log the change
    await pool.query(
      'INSERT INTO marks_log (marks_id, old_value, new_value, changed_by) VALUES ($1, $2, $3, $4)',
      [markId, oldValue, marks_obtained, req.session.userId]
    );
    
    res.redirect('/admin/marks?success=Marks updated successfully');
  } catch (error) {
    console.error('Edit marks error:', error);
    res.redirect('/admin/marks?error=Failed to update marks');
  }
});

// Add new marks (for the modal functionality)
router.post('/marks/add', async (req, res) => {
  try {
    const { student_id, subject, exam_name, marks_obtained, total_marks } = req.body;
    
    // Find subject ID based on subject name and student's class
    const studentResult = await pool.query('SELECT class_name FROM students WHERE id = $1', [student_id]);
    if (studentResult.rows.length === 0) {
      return res.json({ success: false, message: 'Student not found' });
    }
    
    const className = studentResult.rows[0].class_name;
    
    // Get or create subject
    let subjectResult = await pool.query('SELECT id FROM subjects WHERE subject_name = $1 AND class_name = $2', [subject, className]);
    let subjectId;
    
    if (subjectResult.rows.length === 0) {
      // Create subject if it doesn't exist
      const newSubjectResult = await pool.query(
        'INSERT INTO subjects (subject_name, class_name) VALUES ($1, $2) RETURNING id',
        [subject, className]
      );
      subjectId = newSubjectResult.rows[0].id;
    } else {
      subjectId = subjectResult.rows[0].id;
    }
    
    // Check if marks already exist for this student and subject
    const existingMarks = await pool.query(
      'SELECT id FROM marks WHERE student_id = $1 AND subject_id = $2 AND exam_name = $3',
      [student_id, subjectId, exam_name]
    );
    
    if (existingMarks.rows.length > 0) {
      // Update existing marks
      await pool.query(
        'UPDATE marks SET marks_obtained = $1, total_marks = $2 WHERE id = $3',
        [marks_obtained, total_marks, existingMarks.rows[0].id]
      );
    } else {
      // Insert new marks
      await pool.query(
        'INSERT INTO marks (student_id, subject_id, exam_name, marks_obtained, total_marks, teacher_id, date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [student_id, subjectId, exam_name, marks_obtained, total_marks, req.session.userId, new Date().toISOString().split('T')[0]]
      );
    }
    
    res.json({ success: true, message: 'Marks saved successfully' });
  } catch (error) {
    console.error('Add marks error:', error);
    res.json({ success: false, message: error.message });
  }
});

// File Upload Routes
// Upload Students CSV/PDF
router.post('/students/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.redirect('/admin/students?error=No file uploaded');
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let successCount = 0;
    let errorCount = 0;
    let errors = [];

    if (fileExtension === '.csv' || req.file.mimetype === 'text/csv' || req.file.mimetype === 'application/vnd.ms-excel') {
      // Process CSV file
      const students = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Handle different possible column names
          const student = {
            name: row.name || row.Name || row.NAME || row['Student Name'] || row['student_name'],
            roll_no: row.roll_no || row.Roll_No || row.ROLL_NO || row['Roll Number'] || row['roll_number'],
            email: row.email || row.Email || row.EMAIL || row['Email Address'] || row['email_address'],
            class_name: row.class_name || row.Class || row.CLASS || row['Class Name'] || row['class'] || '1st A'
          };
          
          if (student.name && student.roll_no) {
            students.push(student);
          }
        })
        .on('end', async () => {
          // Process each student
          for (const student of students) {
            try {
              // Set default email if not provided
              if (!student.email) {
                student.email = `${student.roll_no.toLowerCase().replace(/\s+/g, '')}@school.edu`;
              }
              
              const password = 'student123'; // Default password
              
              await pool.query(
                'INSERT INTO students (name, roll_no, email, password, class_name) VALUES ($1, $2, $3, $4, $5)',
                [student.name, student.roll_no, student.email, password, student.class_name]
              );
              successCount++;
            } catch (error) {
              console.error('Error adding student:', error);
              errorCount++;
              errors.push(`Failed to add ${student.name}: ${error.message}`);
            }
          }
          
          // Clean up uploaded file
          fs.unlinkSync(filePath);
          
          let message = `Upload completed: ${successCount} students added successfully`;
          if (errorCount > 0) {
            message += `, ${errorCount} failed`;
          }
          
          res.redirect(`/admin/students?success=${encodeURIComponent(message)}`);
        })
        .on('error', (error) => {
          fs.unlinkSync(filePath);
          res.redirect(`/admin/students?error=CSV processing error: ${error.message}`);
        });
        
    } else if (fileExtension === '.pdf') {
      // Process PDF file
      const dataBuffer = fs.readFileSync(filePath);
      
      pdf(dataBuffer).then(async (data) => {
        const text = data.text;
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        
        // Try to parse structured data from PDF
        // Expected format: Name | Roll No | Email | Class (separated by | or tabs)
        for (const line of lines) {
          const parts = line.split(/[|\t]/).map(part => part.trim());
          
          if (parts.length >= 2) {
            try {
              const name = parts[0];
              const roll_no = parts[1];
              const email = parts[2] || `${roll_no.toLowerCase().replace(/\s+/g, '')}@school.edu`;
              const class_name = parts[3] || '1st A';
              const password = 'student123';
              
              if (name && roll_no) {
                await pool.query(
                  'INSERT INTO students (name, roll_no, email, password, class_name) VALUES ($1, $2, $3, $4, $5)',
                  [name, roll_no, email, password, class_name]
                );
                successCount++;
              }
            } catch (error) {
              console.error('Error adding student from PDF:', error);
              errorCount++;
            }
          }
        }
        
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        
        let message = `PDF upload completed: ${successCount} students added successfully`;
        if (errorCount > 0) {
          message += `, ${errorCount} failed`;
        }
        
        res.redirect(`/admin/students?success=${encodeURIComponent(message)}`);
      }).catch((error) => {
        fs.unlinkSync(filePath);
        res.redirect(`/admin/students?error=PDF processing error: ${error.message}`);
      });
    } else {
      fs.unlinkSync(filePath);
      res.redirect('/admin/students?error=Unsupported file format. Please upload CSV or PDF files only.');
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.redirect(`/admin/students?error=Upload failed: ${error.message}`);
  }
});

// Upload Teachers CSV/PDF
router.post('/teachers/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.redirect('/admin/teachers?error=No file uploaded');
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let successCount = 0;
    let errorCount = 0;

    if (fileExtension === '.csv' || req.file.mimetype === 'text/csv' || req.file.mimetype === 'application/vnd.ms-excel') {
      // Process CSV file
      const teachers = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Handle different possible column names
          const teacher = {
            name: row.name || row.Name || row.NAME || row['Teacher Name'] || row['teacher_name'],
            email: row.email || row.Email || row.EMAIL || row['Email Address'] || row['email_address'],
            subject: row.subject || row.Subject || row.SUBJECT || row['Subject Name'] || row['subject_name'] || 'English',
            class_name: row.class_name || row.Class || row.CLASS || row['Class Name'] || row['class'] || '1st A'
          };
          
          if (teacher.name && teacher.email) {
            teachers.push(teacher);
          }
        })
        .on('end', async () => {
          // Process each teacher
          for (const teacher of teachers) {
            try {
              const password = 'teacher123'; // Default password
              
              await pool.query(
                'INSERT INTO teachers (name, email, password, subject, class_name) VALUES ($1, $2, $3, $4, $5)',
                [teacher.name, teacher.email, password, teacher.subject, teacher.class_name]
              );
              successCount++;
            } catch (error) {
              console.error('Error adding teacher:', error);
              errorCount++;
            }
          }
          
          // Clean up uploaded file
          fs.unlinkSync(filePath);
          
          let message = `Upload completed: ${successCount} teachers added successfully`;
          if (errorCount > 0) {
            message += `, ${errorCount} failed`;
          }
          
          res.redirect(`/admin/teachers?success=${encodeURIComponent(message)}`);
        })
        .on('error', (error) => {
          fs.unlinkSync(filePath);
          res.redirect(`/admin/teachers?error=CSV processing error: ${error.message}`);
        });
        
    } else if (fileExtension === '.pdf') {
      // Process PDF file
      const dataBuffer = fs.readFileSync(filePath);
      
      pdf(dataBuffer).then(async (data) => {
        const text = data.text;
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        
        // Try to parse structured data from PDF
        // Expected format: Name | Email | Subject | Class (separated by | or tabs)
        for (const line of lines) {
          const parts = line.split(/[|\t]/).map(part => part.trim());
          
          if (parts.length >= 2) {
            try {
              const name = parts[0];
              const email = parts[1];
              const subject = parts[2] || 'English';
              const class_name = parts[3] || '1st A';
              const password = 'teacher123';
              
              if (name && email) {
                await pool.query(
                  'INSERT INTO teachers (name, email, password, subject, class_name) VALUES ($1, $2, $3, $4, $5)',
                  [name, email, password, subject, class_name]
                );
                successCount++;
              }
            } catch (error) {
              console.error('Error adding teacher from PDF:', error);
              errorCount++;
            }
          }
        }
        
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        
        let message = `PDF upload completed: ${successCount} teachers added successfully`;
        if (errorCount > 0) {
          message += `, ${errorCount} failed`;
        }
        
        res.redirect(`/admin/teachers?success=${encodeURIComponent(message)}`);
      }).catch((error) => {
        fs.unlinkSync(filePath);
        res.redirect(`/admin/teachers?error=PDF processing error: ${error.message}`);
      });
    } else {
      fs.unlinkSync(filePath);
      res.redirect('/admin/teachers?error=Unsupported file format. Please upload CSV or PDF files only.');
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.redirect(`/admin/teachers?error=Upload failed: ${error.message}`);
  }
});

module.exports = router;