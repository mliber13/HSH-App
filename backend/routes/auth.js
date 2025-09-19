const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const storage = require('../utils/storage');

// Simple login endpoint (for development)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For development, we'll use a simple hardcoded user
    // In production, you'd check against a real user database
    if (email === 'admin@hsh.com' && password === 'admin123') {
      const token = jwt.sign(
        { userId: 'admin', email: 'admin@hsh.com' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        token,
        user: {
          id: 'admin',
          email: 'admin@hsh.com',
          name: 'HSH Admin'
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
