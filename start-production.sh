#!/bin/bash

# Production startup script for Attendance Management System

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  echo "Please create a .env file with your configuration."
  echo "You can copy .env.example to .env and modify it."
  exit 1
fi

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'school_management',
  password: process.env.DB_PASSWORD || '2678',
  port: process.env.DB_PORT || 5432,
});

pool.query('SELECT NOW()')
  .then(res => {
    console.log('✅ PostgreSQL connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  });
" || exit 1

# Start the application
echo "Starting Attendance Management System..."
npm start