require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function setupDatabase() {
  try {
    console.log('Setting up database with demo users...');
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    // Clear existing demo users
    await pool.query('DELETE FROM admins WHERE email = $1', ['admin@school.com']);
    await pool.query('DELETE FROM teachers WHERE email IN ($1, $2, $3, $4, $5, $6, $7, $8)', [
      'teacher@school.com', 
      'sarah.johnson@school.edu', 
      'rahul.sharma@school.edu', 
      'priya.patel@school.edu', 
      'anjali.gupta@school.edu', 
      'vikram.singh@school.edu', 
      'kavya.reddy@school.edu', 
      'meera.das@school.edu'
    ]);
    await pool.query('DELETE FROM students WHERE email = $1', ['student@school.com']);
    // Clear any old students from sample data
    await pool.query('DELETE FROM students WHERE class_name IN ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', ['1A', '1B', '1C', '1D', '1E', '1F', '1G', '10A', '10B', '9A']);

    // Insert demo admin
    await pool.query(
      'INSERT INTO admins (name, email, password) VALUES ($1, $2, $3)',
      ['Admin User', 'admin@school.com', adminPassword]
    );

    // Insert demo teachers for all 1st standard sections
    const teachers = [
      { name: 'Mrs. Sarah Johnson', email: 'sarah.johnson@school.edu', subject: 'English', class_name: '1A' },
      { name: 'Mr. Rahul Sharma', email: 'rahul.sharma@school.edu', subject: 'Math', class_name: '1B' },
      { name: 'Ms. Priya Patel', email: 'priya.patel@school.edu', subject: 'Science', class_name: '1C' },
      { name: 'Mrs. Anjali Gupta', email: 'anjali.gupta@school.edu', subject: 'English', class_name: '1D' },
      { name: 'Mr. Vikram Singh', email: 'vikram.singh@school.edu', subject: 'Math', class_name: '1E' },
      { name: 'Ms. Kavya Reddy', email: 'kavya.reddy@school.edu', subject: 'Science', class_name: '1F' },
      { name: 'Mrs. Meera Das', email: 'meera.das@school.edu', subject: 'English', class_name: '1G' }
    ];

    // Clear existing teachers
    await pool.query('DELETE FROM teachers WHERE email IN ($1, $2, $3, $4, $5, $6, $7, $8)', [
      'teacher@school.com', 
      'sarah.johnson@school.edu', 
      'rahul.sharma@school.edu', 
      'priya.patel@school.edu', 
      'anjali.gupta@school.edu', 
      'vikram.singh@school.edu', 
      'kavya.reddy@school.edu', 
      'meera.das@school.edu'
    ]);

    // Insert teachers for all sections
    let teacherIds = [];
    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      const result = await pool.query(
        'INSERT INTO teachers (name, email, password, subject, class_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [teacher.name, teacher.email, teacherPassword, teacher.subject, teacher.class_name]
      );
      teacherIds.push(result.rows[0].id);
    }

    // Insert demo student
    await pool.query(
      'INSERT INTO students (name, roll_no, email, password, class_name) VALUES ($1, $2, $3, $4, $5)',
      ['Student User', 'STU001', 'student@school.com', studentPassword, '1A']
    );

    // Insert sample classes (clear first)
    await pool.query('DELETE FROM classes WHERE class_name IN ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', ['1A', '1B', '1C', '1D', '1E', '1F', '1G', '10A', '10B', '9A']);
    
    // Insert classes for all 1st standard sections
    const sections = ['1A', '1B', '1C', '1D', '1E', '1F', '1G'];
    for (let i = 0; i < sections.length && i < teacherIds.length; i++) {
      await pool.query('INSERT INTO classes (class_name, teacher_id) VALUES ($1, $2)', [sections[i], teacherIds[i]]);
    }

    // Insert sample subjects for all sections
    await pool.query('DELETE FROM subjects WHERE class_name IN ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', ['1A', '1B', '1C', '1D', '1E', '1F', '1G', '10A', '10B', '9A']);
    
    // Insert subjects for all 1st standard sections
    const allSections = ['1A', '1B', '1C', '1D', '1E', '1F', '1G'];
    const subjects = ['English', 'Math', 'Science'];
    
    for (const section of allSections) {
      for (const subject of subjects) {
        await pool.query('INSERT INTO subjects (subject_name, class_name) VALUES ($1, $2)', [subject, section]);
      }
    }

    // Insert sample timetable for all sections
    await pool.query('DELETE FROM timetable WHERE class_name IN ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', ['1A', '1B', '1C', '1D', '1E', '1F', '1G', '10A', '10B', '9A']);
    
    // Insert timetable for all 1st standard sections
    const timetableSections = ['1A', '1B', '1C', '1D', '1E', '1F', '1G'];
    
    for (let i = 0; i < timetableSections.length && i < teacherIds.length; i++) {
      const section = timetableSections[i];
      const teacherId = teacherIds[i];
      
      // Insert timetable entries for this section
      await pool.query('INSERT INTO timetable (class_name, day, period, subject, teacher_id) VALUES ($1, $2, $3, $4, $5)', [section, 'Monday', '1', 'English', teacherId]);
      await pool.query('INSERT INTO timetable (class_name, day, period, subject, teacher_id) VALUES ($1, $2, $3, $4, $5)', [section, 'Monday', '2', 'Math', teacherId]);
      await pool.query('INSERT INTO timetable (class_name, day, period, subject, teacher_id) VALUES ($1, $2, $3, $4, $5)', [section, 'Tuesday', '1', 'Science', teacherId]);
      await pool.query('INSERT INTO timetable (class_name, day, period, subject, teacher_id) VALUES ($1, $2, $3, $4, $5)', [section, 'Tuesday', '2', 'English', teacherId]);
    }

    console.log('✅ Database setup completed successfully!');
    console.log('\nDemo Users Created:');
    console.log('📧 Admin: admin@school.com / admin123');
    console.log('📧 Teachers: sarah.johnson@school.edu / teacher123 (1A), rahul.sharma@school.edu / teacher123 (1B), etc.');  
    console.log('📧 Student: student@school.com / student123');
    console.log('\nAll 7 sections of 1st Standard (1A through 1G) are now set up!');
    console.log('\nYou can now start the server with: npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();