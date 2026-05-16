require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const pronunciationRoutes = require('./routes/pronunciation');
const progressRoutes = require('./routes/progress');
const healthRoutes = require('./routes/health');
const { connectDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files (for debug purposes)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Routes ─────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pronunciation', pronunciationRoutes);
app.use('/api/progress', progressRoutes);

// ─── Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// ─── Start ──────────────────────────────────────────────
app.listen(PORT, async () => {
  await connectDB();
  console.log(`\n🚀 Accentrix Backend running on http://localhost:${PORT}`);
  console.log(`📡 AI Service URL: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
