require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');

// Import database connection
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'school-management-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId || !req.session.userRole) {
    return res.redirect('/login');
  }
  next();
};

// Role-based access middleware
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.session.userRole !== role) {
      return res.status(403).send('Unauthorized access');
    }
    next();
  };
};

// Make user info available to all templates
app.use((req, res, next) => {
  res.locals.user = {
    id: req.session.userId,
    role: req.session.userRole,
    name: req.session.userName,
    email: req.session.userEmail
  };
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/admin', requireAuth, requireRole('admin'), adminRoutes);
app.use('/teacher', requireAuth, requireRole('teacher'), teacherRoutes);
app.use('/student', requireAuth, requireRole('student'), studentRoutes);

// Home route - redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`School Management System running on http://localhost:${PORT}`);
  console.log('Please make sure PostgreSQL is running and the database "school_management" exists');
});

// Keep the process alive and handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = app;