# Attendance Management System - Production Deployment Guide

This guide provides step-by-step instructions for deploying the Attendance Management System to a production environment.

## System Requirements

- Node.js v14 or higher
- PostgreSQL v10 or higher
- 2GB RAM minimum
- 10GB disk space minimum

## Prerequisites

1. Install Node.js and npm
2. Install PostgreSQL and create a database named `school_management`
3. Ensure PostgreSQL is running and accessible

## Installation Steps

### 1. Clone or Copy the Application

```bash
# If using git
git clone <repository-url>
cd attendance-system

# Or copy the application files to your server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_USER=your_postgres_username
DB_HOST=localhost
DB_NAME=school_management
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# Server Configuration
PORT=3000
NODE_ENV=production
```

### 4. Set Up the Database

Run the database schema to create tables:

```bash
# Connect to PostgreSQL and run the schema
psql -U your_username -d school_management -f database/schema.sql
```

Or use the setup script:

```bash
npm run setup
```

### 5. Start the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Production Deployment Considerations

### Security

1. Change default passwords in the database setup
2. Use strong, unique passwords for all accounts
3. Configure HTTPS in production
4. Set secure session configuration

### Performance

1. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name attendance-system
   ```

2. Configure database connection pooling in `config/database.js`

### Monitoring

1. Set up application logging
2. Configure error tracking
3. Monitor database performance

## Default Demo Accounts

After setup, the following demo accounts will be available:

### Admin Account
- Email: admin@school.com
- Password: admin123

### Teacher Accounts
- Email: sarah.johnson@school.edu (Section 1A)
- Email: rahul.sharma@school.edu (Section 1B)
- Email: priya.patel@school.edu (Section 1C)
- Email: anjali.gupta@school.edu (Section 1D)
- Email: vikram.singh@school.edu (Section 1E)
- Email: kavya.reddy@school.edu (Section 1F)
- Email: meera.das@school.edu (Section 1G)
- Password for all teachers: teacher123

### Student Account
- Email: student@school.com
- Password: student123

## Features Included

1. **PostgreSQL Database Integration**
   - Full database connectivity
   - Proper schema with all required tables
   - Data persistence

2. **Admin Panel**
   - Full CRUD operations for students and teachers
   - Section-wise student filtering
   - Subject-wise teacher filtering
   - CSV/PDF import functionality for bulk data
   - Timetable management
   - Attendance reports
   - Marks management

3. **Teacher Panel**
   - Attendance marking
   - Student performance tracking
   - Timetable viewing

4. **Student Panel**
   - Attendance viewing
   - Marks viewing
   - Timetable viewing

5. **All 1st Standard Sections**
   - Support for sections 1A through 1G
   - Proper teacher assignments for each section
   - Section-specific data management

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify database credentials in `.env` file
   - Ensure `school_management` database exists

2. **Port Already in Use**
   - Change the PORT environment variable
   - Kill the process using the port

3. **Permission Errors**
   - Ensure proper file permissions
   - Run with appropriate user privileges

### Logs

Check `server.log` for application logs and errors.

## Maintenance

1. Regular database backups
2. Monitor disk space usage
3. Update dependencies periodically
4. Review and rotate logs

## Support

For issues with deployment or configuration, please contact the development team.