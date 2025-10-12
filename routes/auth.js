const express = require('express');
const bcrypt = require('bcryptjs');
// Use mock database if running mock server, otherwise use real database
const pool = process.env.USE_MOCK_DB === 'true' ? require('../config/mock-database') : require('../config/database');

const router = express.Router();

// Login page
router.get('/login', (req, res) => {
  res.render('login', { 
    title: 'Login - School Management System',
    error: req.query.error 
  });
});

// Login form submission
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let query;
    
    // Determine which table to query based on role
    switch (role) {
      case 'admin':
        query = 'SELECT * FROM admins WHERE email = $1';
        break;
      case 'teacher':
        query = 'SELECT * FROM teachers WHERE email = $1';
        break;
      case 'student':
        query = 'SELECT * FROM students WHERE email = $1';
        break;
      default:
        return res.redirect('/login?error=Invalid role selected');
    }

    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return res.redirect('/login?error=Invalid credentials');
    }

    const user = result.rows[0];
    
    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.redirect('/login?error=Invalid credentials');
    }

    // Set session data
    req.session.userId = user.id;
    req.session.userRole = role;
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    // Redirect based on role
    switch (role) {
      case 'admin':
        res.redirect('/admin/dashboard');
        break;
      case 'teacher':
        res.redirect('/teacher/dashboard');
        break;
      case 'student':
        res.redirect('/student/dashboard');
        break;
    }

  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/login?error=Server error occurred');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;