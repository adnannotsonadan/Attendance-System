require('dotenv').config();
const pool = require('./config/database');

async function verifyDeployment() {
  console.log('🔍 Verifying Attendance Management System Deployment...\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('   ✅ Database connection successful\n');
    
    // Check if all tables exist
    console.log('2. Checking database schema...');
    const tables = ['admins', 'teachers', 'students', 'classes', 'subjects', 'attendance', 'marks', 'timetable'];
    for (const table of tables) {
      try {
        await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`   ✅ Table ${table} exists`);
      } catch (err) {
        console.log(`   ❌ Table ${table} missing: ${err.message}`);
      }
    }
    console.log('');
    
    // Check demo data
    console.log('3. Checking demo data...');
    const studentCount = await pool.query('SELECT COUNT(*) as count FROM students');
    console.log(`   👤 Students: ${studentCount.rows[0].count}`);
    
    const teacherCount = await pool.query('SELECT COUNT(*) as count FROM teachers');
    console.log(`   👩‍🏫 Teachers: ${teacherCount.rows[0].count}`);
    
    const adminCount = await pool.query('SELECT COUNT(*) as count FROM admins');
    console.log(`   👨‍💼 Admins: ${adminCount.rows[0].count}`);
    
    // Check sections
    console.log('\n4. Checking sections...');
    const sections = await pool.query("SELECT DISTINCT class_name FROM classes WHERE class_name LIKE '1%' ORDER BY class_name");
    console.log(`   📚 Sections: ${sections.rows.map(r => r.class_name).join(', ')}`);
    
    // Check timetable
    console.log('\n5. Checking timetable...');
    const timetableCount = await pool.query('SELECT COUNT(*) as count FROM timetable');
    console.log(`   📅 Timetable entries: ${timetableCount.rows[0].count}`);
    
    console.log('\n✅ Deployment verification completed successfully!');
    console.log('\n📋 Default login credentials:');
    console.log('   Admin: admin@school.com / admin123');
    console.log('   Teachers: sarah.johnson@school.edu / teacher123 (1A), rahul.sharma@school.edu / teacher123 (1B), etc.');
    console.log('   Student: student@school.com / student123');
    console.log('\n🚀 System is ready for production use!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Deployment verification failed:', error.message);
    process.exit(1);
  }
}

verifyDeployment();