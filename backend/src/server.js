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
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    // In production, also allow any vercel.app subdomain
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
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
