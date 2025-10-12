// Mock database for testing without PostgreSQL
const bcrypt = require('bcryptjs');

// Mock data storage
let mockData = {
  admins: [],
  teachers: [],
  students: [],
  classes: [],
  subjects: [],
  attendance: [],
  marks: [],
  marks_log: [],
  timetable: []
};

// Mock database connection
const mockPool = {
  async query(text, params = []) {
    // Parse SQL-like queries and handle them
    const query = text.toLowerCase().trim();
    
    // Admin login
    if (query.includes('select * from admins where email')) {
      const email = params[0];
      const admin = mockData.admins.find(a => a.email === email);
      return { rows: admin ? [admin] : [] };
    }
    
    // Teacher login
    if (query.includes('select * from teachers where email')) {
      const email = params[0];
      const teacher = mockData.teachers.find(t => t.email === email);
      return { rows: teacher ? [teacher] : [] };
    }
    
    // Student login
    if (query.includes('select * from students where email')) {
      const email = params[0];
      const student = mockData.students.find(s => s.email === email);
      return { rows: student ? [student] : [] };
    }

    // Get student by ID
    if (query.includes('select * from students where id')) {
      const id = parseInt(params[0]);
      const student = mockData.students.find(s => s.id === id);
      return { rows: student ? [student] : [] };
    }
    
    // Count queries
    if (query.includes('select count(*) as count from students')) {
      return { rows: [{ count: mockData.students.length.toString() }] };
    }
    
    if (query.includes('select count(*) as count from teachers')) {
      return { rows: [{ count: mockData.teachers.length.toString() }] };
    }

    // Average attendance for admin dashboard
    if (query.includes('avg_attendance') || (query.includes('round') && query.includes('attendance'))) {
      const totalAttendance = mockData.attendance.length;
      const presentCount = mockData.attendance.filter(a => a.status === 'present').length;
      const avgAttendance = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(2) : '0';
      return { rows: [{ avg_attendance: avgAttendance }] };
    }
    
    // Get all teachers for admin
    if (query.includes('select * from teachers order by name')) {
      return { rows: mockData.teachers };
    }
    
    // Get all students ordered by class and name
    if (query.includes('select * from students order by class_name, name')) {
      const sortedStudents = mockData.students.sort((a, b) => {
        if (a.class_name === b.class_name) {
          return a.name.localeCompare(b.name);
        }
        return a.class_name.localeCompare(b.class_name);
      });
      return { rows: sortedStudents };
    }
    
    // Get all students for admin
    if (query.includes('select * from students order by name')) {
      return { rows: mockData.students };
    }
    
    // Get all admins
    if (query.includes('select * from admins')) {
      return { rows: mockData.admins };
    }
    
    // Insert teacher
    if (query.includes('insert into teachers')) {
      const [name, email, password, subject, class_name] = params;
      const newTeacher = {
        id: mockData.teachers.length + 1,
        name,
        email,
        password,
        subject,
        class_name
      };
      mockData.teachers.push(newTeacher);
      return { rows: [] };
    }
    
    // Insert student
    if (query.includes('insert into students')) {
      const [name, roll_no, email, password, class_name] = params;
      const newStudent = {
        id: mockData.students.length + 1,
        name,
        roll_no,
        email,
        password,
        class_name
      };
      mockData.students.push(newStudent);
      return { rows: [] };
    }
    
    // Delete operations
    if (query.includes('delete from teachers where id')) {
      const id = parseInt(params[0]);
      mockData.teachers = mockData.teachers.filter(t => t.id !== id);
      return { rows: [] };
    }
    
    if (query.includes('delete from students where id')) {
      const id = parseInt(params[0]);
      mockData.students = mockData.students.filter(s => s.id !== id);
      return { rows: [] };
    }
    
    // Teacher-specific queries
    if (query.includes('select class_name') && query.includes('from teachers where id')) {
      const teacherId = parseInt(params[0]);
      const teacher = mockData.teachers.find(t => t.id === teacherId);
      return { rows: teacher ? [{ class_name: teacher.class_name }] : [] };
    }

    // Get teacher info with class and subject
    if (query.includes('select class_name, subject from teachers where id')) {
      const teacherId = parseInt(params[0]);
      const teacher = mockData.teachers.find(t => t.id === teacherId);
      return { rows: teacher ? [{ class_name: teacher.class_name, subject: teacher.subject }] : [] };
    }
    
    // Get students by class
    if (query.includes('select * from students where class_name')) {
      const className = params[0];
      const students = mockData.students.filter(s => s.class_name === className);
      return { rows: students };
    }
    
    // Attendance statistics by student
    if (query.includes('select') && query.includes('status') && query.includes('count') && query.includes('attendance')) {
      const studentId = params[0];
      const attendance = mockData.attendance.filter(a => a.student_id === parseInt(studentId));
      const stats = attendance.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});
      
      return { 
        rows: Object.entries(stats).map(([status, count]) => ({ status, count: count.toString() }))
      };
    }

    // Get today's attendance for teacher
    if (query.includes('select student_id, status') && query.includes('current_date')) {
      const teacherId = parseInt(params[0]);
      const todayAttendance = mockData.attendance.filter(a => 
        a.marked_by === teacherId && 
        a.date === new Date().toISOString().split('T')[0]
      );
      
      const attendanceMap = {};
      todayAttendance.forEach(record => {
        attendanceMap[record.student_id] = record.status;
      });
      
      return { rows: todayAttendance };
    }
    
    // Add query to get timetable by student's class
    if (query.includes('select') && query.includes('timetable') && query.includes('class_name')) {
      const className = params[0];
      const timetable = mockData.timetable.filter(t => t.class_name === className);
      // Add teacher names
      const timetableWithTeachers = timetable.map(entry => ({
        ...entry,
        teacher_name: mockData.teachers.find(t => t.id === entry.teacher_id)?.name || 'Unknown'
      }));
      return { rows: timetableWithTeachers };
    }

    // Admin timetable query with teacher names
    if (query.includes('select t.*, te.name as teacher_name') && query.includes('from timetable t')) {
      const timetable = mockData.timetable.map(entry => ({
        ...entry,
        teacher_name: mockData.teachers.find(t => t.id === entry.teacher_id)?.name || 'Unknown'
      }));
      return { rows: timetable };
    }

    // Admin attendance query with joins
    if (query.includes('select a.*, s.name as student_name, s.roll_no, s.class_name, t.name as teacher_name') && query.includes('from attendance a')) {
      const attendance = mockData.attendance.map(record => {
        const student = mockData.students.find(s => s.id === record.student_id);
        const teacher = mockData.teachers.find(t => t.id === record.marked_by);
        return {
          ...record,
          student_name: student?.name || 'Unknown',
          roll_no: student?.roll_no || 'Unknown',
          class_name: student?.class_name || 'Unknown',
          teacher_name: teacher?.name || 'System',
          status: record.status || 'present' // Ensure status is always a string
        };
      });
      return { rows: attendance };
    }

    // Admin marks query with all joins
    if (query.includes('select m.*, s.name as student_name, s.roll_no, s.class_name, sub.subject_name, t.name as teacher_name')) {
      const marks = mockData.marks.map(mark => {
        const student = mockData.students.find(s => s.id === mark.student_id);
        const subject = mockData.subjects.find(s => s.id === mark.subject_id);
        const teacher = mockData.teachers.find(t => t.id === mark.teacher_id);
        return {
          ...mark,
          student_name: student?.name || 'Unknown',
          roll_no: student?.roll_no || 'Unknown',
          class_name: student?.class_name || 'Unknown',
          subject_name: subject?.subject_name || 'Unknown',
          teacher_name: teacher?.name || 'Unknown'
        };
      });
      return { rows: marks };
    }
    
    // Get subjects by class
    if (query.includes('select * from subjects where class_name')) {
      const className = params[0];
      const subjects = mockData.subjects.filter(s => s.class_name === className);
      return { rows: subjects };
    }

    // Get marks with joins
    if (query.includes('select m.*, s.name as student_name') && query.includes('marks')) {
      const teacherId = params[0];
      const marks = mockData.marks.filter(m => m.teacher_id === parseInt(teacherId)).map(mark => {
        const student = mockData.students.find(s => s.id === mark.student_id);
        const subject = mockData.subjects.find(s => s.id === mark.subject_id);
        return {
          ...mark,
          student_name: student?.name || 'Unknown',
          roll_no: student?.roll_no || 'Unknown',
          subject_name: subject?.subject_name || 'Unknown'
        };
      });
      return { rows: marks };
    }

    // Student marks query
    if (query.includes('select m.*, sub.subject_name, t.name as teacher_name') && query.includes('marks')) {
      const studentId = parseInt(params[0]);
      const marks = mockData.marks.filter(m => m.student_id === studentId).map(mark => {
        const subject = mockData.subjects.find(s => s.id === mark.subject_id);
        const teacher = mockData.teachers.find(t => t.id === mark.teacher_id);
        return {
          ...mark,
          subject_name: subject?.subject_name || 'Unknown',
          teacher_name: teacher?.name || 'Unknown'
        };
      });
      return { rows: marks };
    }

    // Attendance records with joins
    if (query.includes('select a.*, s.name as student_name') && query.includes('attendance')) {
      const teacherId = params[0];
      const attendance = mockData.attendance.filter(a => a.marked_by === parseInt(teacherId)).map(record => {
        const student = mockData.students.find(s => s.id === record.student_id);
        const teacher = mockData.teachers.find(t => t.id === record.marked_by);
        return {
          ...record,
          student_name: student?.name || 'Unknown',
          roll_no: student?.roll_no || 'Unknown',
          class_name: student?.class_name || 'Unknown',
          teacher_name: teacher?.name || 'Unknown'
        };
      });
      return { rows: attendance };
    }

    // Student attendance records
    if (query.includes('select a.*, t.name as teacher_name') && query.includes('attendance a')) {
      const studentId = parseInt(params[0]);
      const attendance = mockData.attendance.filter(a => a.student_id === studentId).map(record => {
        const teacher = mockData.teachers.find(t => t.id === record.marked_by);
        return {
          ...record,
          teacher_name: teacher?.name || 'Unknown'
        };
      });
      return { rows: attendance };
    }
    
    // Insert attendance
    if (query.includes('insert into attendance')) {
      const [student_id, date, status, marked_by] = params;
      const newAttendance = {
        id: mockData.attendance.length + 1,
        student_id: parseInt(student_id),
        date,
        status,
        marked_by: parseInt(marked_by)
      };
      mockData.attendance.push(newAttendance);
      return { rows: [] };
    }

    // Insert marks
    if (query.includes('insert into marks')) {
      const [student_id, subject_id, exam_name, marks_obtained, total_marks, teacher_id, date] = params;
      const newMark = {
        id: mockData.marks.length + 1,
        student_id: parseInt(student_id),
        subject_id: parseInt(subject_id),
        exam_name,
        marks_obtained: parseInt(marks_obtained),
        total_marks: parseInt(total_marks),
        teacher_id: parseInt(teacher_id),
        date: date || new Date().toISOString().split('T')[0]
      };
      mockData.marks.push(newMark);
      return { rows: [] };
    }

    // Update marks
    if (query.includes('update marks set marks_obtained')) {
      const [marks_obtained, markId] = params;
      const mark = mockData.marks.find(m => m.id === parseInt(markId));
      if (mark) {
        mark.marks_obtained = parseInt(marks_obtained);
      }
      return { rows: [] };
    }

    // Update marks with total marks
    if (query.includes('update marks set marks_obtained') && query.includes('total_marks')) {
      const [marks_obtained, total_marks, markId] = params;
      const mark = mockData.marks.find(m => m.id === parseInt(markId));
      if (mark) {
        mark.marks_obtained = parseInt(marks_obtained);
        mark.total_marks = parseInt(total_marks);
      }
      return { rows: [] };
    }

    // Check existing marks
    if (query.includes('select id from marks where student_id') && query.includes('subject_id') && query.includes('exam_name')) {
      const [student_id, subject_id, exam_name] = params;
      const existingMark = mockData.marks.find(m => 
        m.student_id === parseInt(student_id) && 
        m.subject_id === parseInt(subject_id) && 
        m.exam_name === exam_name
      );
      return { rows: existingMark ? [{ id: existingMark.id }] : [] };
    }

    // Get or create subject queries
    if (query.includes('select id from subjects where subject_name') && query.includes('class_name')) {
      const [subject_name, class_name] = params;
      const subject = mockData.subjects.find(s => s.subject_name === subject_name && s.class_name === class_name);
      return { rows: subject ? [{ id: subject.id }] : [] };
    }

    // Insert subject
    if (query.includes('insert into subjects') && query.includes('returning id')) {
      const [subject_name, class_name] = params;
      const newSubject = {
        id: mockData.subjects.length + 1,
        subject_name,
        class_name
      };
      mockData.subjects.push(newSubject);
      return { rows: [{ id: newSubject.id }] };
    }

    // Delete attendance
    if (query.includes('delete from attendance') && query.includes('current_date')) {
      const teacherId = parseInt(params[0]);
      const today = new Date().toISOString().split('T')[0];
      mockData.attendance = mockData.attendance.filter(a => 
        !(a.marked_by === teacherId && a.date === today)
      );
      return { rows: [] };
    }

    // Insert timetable entry
    if (query.includes('insert into timetable')) {
      const [class_name, day, period, subject, teacher_id] = params;
      const newTimetableEntry = {
        id: mockData.timetable.length + 1,
        class_name,
        day,
        period,
        subject,
        teacher_id: parseInt(teacher_id)
      };
      mockData.timetable.push(newTimetableEntry);
      return { rows: [] };
    }

    // Delete timetable entry
    if (query.includes('delete from timetable where id')) {
      const id = parseInt(params[0]);
      mockData.timetable = mockData.timetable.filter(t => t.id !== id);
      return { rows: [] };
    }
    
    // Default fallback - return empty result
    console.log('Unhandled query:', query, 'with params:', params);
    return { rows: [] };
  },
  
  on(event, callback) {
    if (event === 'connect') {
      setTimeout(() => callback(), 100);
    }
  }
};

// Initialize with demo data for 1st Standard (7 sections A-G, 30 students each)
async function initializeMockData() {
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    // Demo admin
    mockData.admins.push({
      id: 1,
      name: 'Principal Admin',
      email: 'admin@school.com',
      password: adminPassword
    });

    // Create teachers for each subject
    const teachers = [
      { id: 1, name: 'Mrs. Sarah Johnson', email: 'teacher@school.com', password: teacherPassword, subject: 'English', class_name: '1A' },
      { id: 2, name: 'Mr. Rahul Sharma', email: 'rahul.sharma@school.edu', password: teacherPassword, subject: 'Math', class_name: '1B' },
      { id: 3, name: 'Ms. Priya Patel', email: 'priya.patel@school.edu', password: teacherPassword, subject: 'Science', class_name: '1C' },
      { id: 4, name: 'Mrs. Anjali Gupta', email: 'anjali.gupta@school.edu', password: teacherPassword, subject: 'English', class_name: '1D' },
      { id: 5, name: 'Mr. Vikram Singh', email: 'vikram.singh@school.edu', password: teacherPassword, subject: 'Math', class_name: '1E' },
      { id: 6, name: 'Ms. Kavya Reddy', email: 'kavya.reddy@school.edu', password: teacherPassword, subject: 'Science', class_name: '1F' },
      { id: 7, name: 'Mrs. Meera Das', email: 'meera.das@school.edu', password: teacherPassword, subject: 'English', class_name: '1G' }
    ];
    
    mockData.teachers.push(...teachers);

    // Create 10 students for each section (A to G) with new format
    const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const studentNames = [
      ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Emma Davis', 'Chris Miller', 'Lisa Garcia', 'Tom Anderson', 'Amy Taylor'],
      ['Alex Rodriguez', 'Maya Patel', 'Ryan Lee', 'Zoe Martinez', 'Jake Thompson', 'Priya Sharma', 'Lucas Wang', 'Sofia Kumar', 'Noah Singh', 'Aria Chen'],
      ['Ethan Clark', 'Mia Lopez', 'Owen White', 'Chloe Harris', 'Logan Young', 'Ava Martin', 'Mason Green', 'Grace Adams', 'Carter Baker', 'Lily Nelson'],
      ['Hunter Wright', 'Bella Scott', 'Blake Turner', 'Zara Phillips', 'Cole Evans', 'Ruby Campbell', 'Finn Parker', 'Nora Roberts', 'Reid Collins', 'Ivy Morris'],
      ['Kai Stewart', 'Luna Cooper', 'Drew Reed', 'Sage Bailey', 'Knox Rivera', 'Iris Cook', 'Cruz Morgan', 'Rose Bell', 'Jude Murphy', 'Wren Ward'],
      ['Axel Torres', 'Nova Price', 'Lane Foster', 'Skye Howard', 'Zane Brooks', 'Vera Gray', 'Crew James', 'Faye Wood', 'Rome Hughes', 'Elle Ross'],
      ['Knox Butler', 'Sage Coleman', 'Beau Jenkins', 'Iris Perry', 'Jett Powell', 'Luna Hayes', 'West Myers', 'Cora Ford', 'Vale Griffin', 'Zara Wells']
    ];
    
    let studentId = 1;
    
    sections.forEach((section, sectionIndex) => {
      for (let i = 0; i < 10; i++) {
        const rollNo = String(sectionIndex * 10 + i + 1).padStart(3, '0'); // 001, 002, etc.
        const studentName = studentNames[sectionIndex][i];
        
        // Create proper email based on name (matching login page)
        let email;
        if (sectionIndex === 0 && i === 0) email = 'john.doe@school.edu'; // 1A first student
        else if (sectionIndex === 1 && i === 0) email = 'alex.rodriguez@school.edu'; // 1B first student
        else if (sectionIndex === 2 && i === 0) email = 'ethan.clark@school.edu'; // 1C first student
        else if (sectionIndex === 3 && i === 0) email = 'hunter.wright@school.edu'; // 1D first student
        else if (sectionIndex === 4 && i === 0) email = 'kai.stewart@school.edu'; // 1E first student
        else if (sectionIndex === 5 && i === 0) email = 'axel.torres@school.edu'; // 1F first student
        else if (sectionIndex === 6 && i === 0) email = 'knox.butler@school.edu'; // 1G first student
        else email = studentName.toLowerCase().replace(' ', '.') + '@school.edu';
        
        const student = {
          id: studentId++,
          name: studentName,
          roll_no: rollNo,
          email: email,
          password: studentPassword,
          class_name: `1${section}`,
          section: section // Add section field for easier filtering
        };
        
        mockData.students.push(student);
      }
    });

    // Create classes for each section
    sections.forEach((section, index) => {
      mockData.classes.push({
        id: index + 1,
        class_name: `1${section}`,
        teacher_id: (index % teachers.length) + 1 // Distribute teachers across sections
      });
    });

    // Create subjects for 1st standard
    const subjects = ['English', 'Math', 'Science'];
    let subjectId = 1;
    
    sections.forEach(section => {
      subjects.forEach(subject => {
        mockData.subjects.push({
          id: subjectId++,
          subject_name: subject,
          class_name: `1${section}`
        });
      });
    });

    // Create timetable for each section
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = ['1', '2', '3', '4'];
    let timetableId = 1;
    
    sections.forEach((section, sectionIndex) => {
      const className = `1${section}`;
      
      days.forEach(day => {
        periods.forEach((period, periodIndex) => {
          // Rotate subjects across periods
          const subjectIndex = (periodIndex) % subjects.length;
          const subject = subjects[subjectIndex];
          
          // Assign teacher based on subject
          let teacherId;
          if (subject === 'English') teacherId = sectionIndex < 4 ? 1 : (sectionIndex === 6 ? 7 : 4); // Teachers 1, 4, 7
          else if (subject === 'Math') teacherId = sectionIndex < 4 ? 2 : 5; // Teachers 2, 5
          else teacherId = sectionIndex < 4 ? 3 : 6; // Science: Teachers 3, 6
          
          mockData.timetable.push({
            id: timetableId++,
            class_name: className,
            day: day,
            period: period,
            subject: subject,
            teacher_id: teacherId
          });
        });
      });
    });

    // Sample attendance (more diverse data)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dayBefore = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Add sample attendance for first few students
    for (let i = 1; i <= 10; i++) {
      mockData.attendance.push(
        { id: i * 3 - 2, student_id: i, date: today, status: 'present', marked_by: 1 },
        { id: i * 3 - 1, student_id: i, date: yesterday, status: 'present', marked_by: 1 },
        { id: i * 3, student_id: i, date: dayBefore, status: i % 3 === 0 ? 'absent' : 'present', marked_by: 1 }
      );
    }

    // Sample marks (more diverse data)
    let markId = 1;
    for (let i = 1; i <= 15; i++) {
      subjects.forEach((subject, subjectIndex) => {
        mockData.marks.push({
          id: markId++,
          student_id: i,
          subject_id: (subjectIndex + 1) + ((Math.floor((i-1)/30)) * 3), // Calculate correct subject_id
          exam_name: 'Monthly Test',
          marks_obtained: Math.floor(Math.random() * 30) + 70, // Random marks between 70-100
          total_marks: 100,
          teacher_id: subjectIndex + 1,
          date: today
        });
      });
    }

    console.log('✅ Mock database initialized with 1st Standard data');
    console.log(`📚 Created ${mockData.students.length} students across 7 sections (A-G)`);
    console.log(`👩‍🏫 Created ${mockData.teachers.length} teachers for 3 subjects`);
    console.log(`📅 Created ${mockData.timetable.length} timetable entries`);
  } catch (error) {
    console.error('❌ Mock database initialization failed:', error);
  }
}

// Initialize on startup only if requested
if (process.env.USE_MOCK_DB === 'true') {
  initializeMockData();
}

module.exports = mockPool;