# School Management System

A comprehensive full-stack web application for managing school operations including attendance tracking, marks management, and timetable scheduling.

## 🌟 Features

### 👨‍💼 Admin Dashboard
- **User Management**: Add, edit, and delete teachers and students
- **Timetable Management**: Create and manage class schedules
- **Attendance Reports**: View comprehensive attendance analytics
- **Marks Management**: Edit student marks with change logging
- **Dashboard Analytics**: Overview statistics and performance metrics

### 👨‍🏫 Teacher Dashboard
- **Attendance Marking**: Mark daily attendance for assigned classes
- **Marks Entry**: Add exam and test scores for students
- **Class Management**: View assigned classes and student lists
- **Timetable View**: Access personal teaching schedule

### 👨‍🎓 Student Dashboard
- **Attendance Tracking**: View personal attendance records and statistics
- **Marks Overview**: Access exam results and performance analytics
- **Academic Progress**: Track grades and performance trends
- **Timetable Access**: View class schedule and daily timetable

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Template Engine**: EJS
- **Authentication**: Express-session with bcrypt password hashing
- **UI Framework**: Custom CSS with responsive design

## 📋 Prerequisites

Before setting up the application, ensure you have:

- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** (comes with Node.js)

## 🚀 Installation & Setup

### 1. Clone/Download the Project
```bash
# If using git
git clone <repository-url>
cd "Attendance system"

# Or extract the downloaded zip file and navigate to the folder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Create PostgreSQL Database
```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE school_management;
```

#### Configure Database Connection
Update the database configuration in `config/database.js`:
```javascript
const pool = new Pool({
  user: 'your_postgres_username',
  host: 'localhost',
  database: 'school_management',
  password: 'your_postgres_password',
  port: 5432,
});
```

#### Initialize Database Schema
```bash
# Run the schema file in PostgreSQL
psql -U your_username -d school_management -f database/schema.sql

# Or copy and paste the schema.sql content into your PostgreSQL client
```

#### Setup Demo Data
```bash
npm run setup
```

### 4. Start the Application
```bash
npm start
```

The application will be available at: **http://localhost:3000**

## 🔐 Demo Login Credentials

The system comes with pre-configured demo accounts for testing:

### Admin Account
- **Email**: admin@school.com
- **Password**: admin123
- **Access**: Full system administration

### Teacher Account
- **Email**: teacher@school.com
- **Password**: teacher123
- **Access**: Class management, attendance, marks

### Student Account
- **Email**: student@school.com
- **Password**: student123
- **Access**: View attendance, marks, timetable

## 📱 Usage Guide

### Getting Started
1. Navigate to **http://localhost:3000**
2. Select your role from the dropdown (Admin/Teacher/Student)
3. Use the provided demo credentials to login
4. Explore the dashboard features based on your role

### Admin Workflow
1. **Login** as admin
2. **Add Teachers**: Go to Teachers section, add new teacher accounts
3. **Add Students**: Go to Students section, add new student accounts
4. **Create Timetable**: Set up class schedules in Timetable section
5. **Monitor System**: View attendance reports and manage marks

### Teacher Workflow
1. **Login** as teacher
2. **Mark Attendance**: Use the attendance section to mark daily attendance
3. **Add Marks**: Enter student exam scores and test results
4. **View Schedule**: Check your assigned classes and timetable

### Student Workflow
1. **Login** as student
2. **Check Attendance**: View your attendance percentage and records
3. **View Marks**: Access your exam results and performance analytics
4. **See Schedule**: Check class timetable and daily schedule

## 🗂️ Project Structure

```
Attendance system/
├── config/
│   └── database.js          # Database configuration
├── database/
│   └── schema.sql           # Database schema and sample data
├── public/
│   └── css/
│       └── style.css        # Main stylesheet
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── admin.js            # Admin panel routes
│   ├── teacher.js          # Teacher panel routes
│   └── student.js          # Student panel routes
├── views/
│   ├── admin/              # Admin dashboard templates
│   ├── teacher/            # Teacher dashboard templates
│   ├── student/            # Student dashboard templates
│   ├── login.ejs           # Login page
│   └── 404.ejs             # Error page
├── server.js               # Main application server
├── setup-db.js             # Database setup script
└── package.json            # Project dependencies
```

## 🔧 Configuration

### Environment Variables
You can set these environment variables for production:
```bash
PORT=3000                    # Application port
DATABASE_URL=postgres://...  # Database connection string
SESSION_SECRET=your-secret   # Session encryption key
```

### Database Configuration
Update `config/database.js` with your PostgreSQL credentials:
- **host**: Database server address
- **port**: Database port (default: 5432)
- **database**: Database name
- **user**: PostgreSQL username
- **password**: PostgreSQL password

## 🎨 Customization

### Adding New Features
1. **Database**: Add new tables to `database/schema.sql`
2. **Routes**: Create new route files in `routes/` directory
3. **Views**: Add EJS templates in `views/` directory
4. **Styles**: Modify `public/css/style.css` for styling

### Modifying Existing Features
- **Authentication**: Update `routes/auth.js`
- **Dashboard Logic**: Modify respective route files
- **UI/UX**: Edit EJS templates and CSS styles

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error**
```
Error: ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check database credentials in `config/database.js`
- Verify database `school_management` exists

**Port Already in Use**
```
Error: listen EADDRINUSE :::3000
```
- Change port in `server.js` or set PORT environment variable
- Kill existing process using the port

**Login Issues**
- Ensure demo data was inserted (`npm run setup`)
- Check password hashing in database
- Verify session configuration

### Database Reset
To reset the database with fresh demo data:
```bash
# Drop and recreate database
psql -U your_username -c "DROP DATABASE school_management;"
psql -U your_username -c "CREATE DATABASE school_management;"

# Reinstall schema and demo data
psql -U your_username -d school_management -f database/schema.sql
npm run setup
```

## 📊 Database Schema

### Tables Overview
- **admins**: System administrator accounts
- **teachers**: Teacher accounts with subject assignments
- **students**: Student accounts with class assignments
- **classes**: Class definitions with assigned teachers
- **subjects**: Subject definitions per class
- **attendance**: Daily attendance records
- **marks**: Student exam and test scores
- **marks_log**: Change tracking for marks modifications
- **timetable**: Class scheduling and periods

### Key Relationships
- Teachers → Classes (one-to-many)
- Students → Classes (many-to-one)
- Attendance → Students (many-to-one)
- Marks → Students + Subjects (many-to-many)

## 🔐 Security Features

- **Password Hashing**: bcrypt encryption for all passwords
- **Session Management**: Secure session handling with express-session
- **Role-based Access**: Restricted access based on user roles
- **Input Validation**: Form validation and sanitization
- **SQL Injection Protection**: Parameterized queries

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📝 License

This project is for educational purposes. Feel free to modify and use as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🚀 Production Deployment

### System Requirements

- Node.js v14 or higher
- PostgreSQL v10 or higher
- 2GB RAM minimum
- 10GB disk space minimum

### Installation Steps

1. Clone or copy the application files to your server
2. Install dependencies: `npm install`
3. Install dotenv for environment variables: `npm install dotenv`
4. Create a `.env` file with your configuration (see `.env.example`)
5. Set up PostgreSQL database named `school_management`
6. Run database setup: `npm run setup`
7. Start the server: `npm start`
8. Visit `http://localhost:3000` in your browser

### Environment Configuration

Create a `.env` file in the root directory:

```
# Database Configuration
DB_USER=your_postgres_username
DB_HOST=localhost
DB_NAME=school_management
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# Server Configuration
PORT=3000
NODE_ENV=production

# Session Configuration
SESSION_SECRET=your_secure_session_secret_key_here_change_this_in_production

# Explicitly disable mock database
USE_MOCK_DB=false
```

### Production Considerations

1. **Security**
   - Change all default passwords
   - Use strong, unique passwords for all accounts
   - Configure HTTPS in production
   - Set secure session configuration

2. **Performance**
   - Use a process manager like PM2
   - Configure database connection pooling

3. **Monitoring**
   - Set up application logging
   - Configure error tracking
   - Monitor database performance

### Deployment Verification

Run the verification script to ensure all components are working:

```bash
node verify-deployment.js
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console logs for error details
3. Verify database connectivity and setup

---

**Happy Learning! 🎓**