const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDbStatus } = require('../db');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_accentrix_key';

// ─── POST /api/auth/register ────────────────────────────
router.post('/register', async (req, res) => {
  if (!getDbStatus()) {
    return res.status(503).json({ success: false, error: 'Database is offline. Registration disabled.' });
  }

  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists with this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    await newUser.save();

    // Create JWT
    const token = jwt.sign({ userId: newUser._id, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user: { id: newUser._id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Server error during registration.' });
  }
});

// ─── POST /api/auth/login ───────────────────────────────
router.post('/login', async (req, res) => {
  if (!getDbStatus()) {
    return res.status(503).json({ success: false, error: 'Database is offline. Login disabled.' });
  }

  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid credentials.' });
    }

    // Create JWT
    const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login.' });
  }
});

// ─── GET /api/auth/me ───────────────────────────────────
router.get('/me', async (req, res) => {
  if (!getDbStatus()) return res.status(503).json({ success: false, error: 'DB offline' });

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

module.exports = router;
