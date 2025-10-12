# Quick Setup Instructions

## Option 1: Using PostgreSQL (Recommended for Production)

### 1. Install PostgreSQL
- Download PostgreSQL from: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the password you set for the `postgres` user

### 2. Create Database
```sql
-- Open pgAdmin or psql command line
-- Connect as postgres user
CREATE DATABASE school_management;
```

### 3. Update Database Configuration
Edit `config/database.js` and update the password:
```javascript
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'school_management',
  password: 'YOUR_POSTGRES_PASSWORD', // Change this!
  port: 5432,
});
```

### 4. Run Database Schema
```bash
# From project directory
psql -U postgres -d school_management -f database/schema.sql
```

### 5. Setup Demo Data
```bash
npm run setup
```

### 6. Start Server
```bash
npm start
```

## Option 2: Quick Test with Mock Data (No Database Required)

If you want to test the application immediately without setting up PostgreSQL, I can create a mock version that runs in memory.

Would you like me to create the mock version for immediate testing?

## Login Credentials (After Setup)

- **Admin**: admin@school.com / admin123
- **Teacher**: teacher@school.com / teacher123  
- **Student**: student@school.com / student123

## Access Application

Once running, visit: http://localhost:3000