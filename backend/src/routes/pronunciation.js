const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDbStatus } = require('../db');
const Session = require('../models/Session');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ─── Multer Config ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `audio_${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/webm', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/x-wav'];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are accepted.`));
    }
  },
});

// ─── In-memory session store (fallback when no DB) ──────
const sessions = [];

/**
 * POST /api/pronunciation/analyze
 * Upload audio + metadata → forward to FastAPI AI service → return results
 */
router.post('/analyze', upload.single('audio'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file uploaded. Send a file with field name "audio".',
      });
    }

    const { language = 'en-US', referenceText = '' } = req.body;
    const audioPath = req.file.path;
    const sessionId = uuidv4();

    console.log(`🎤 Received audio: ${req.file.filename} (${(req.file.size / 1024).toFixed(1)}KB)`);
    console.log(`   Language: ${language}, Reference: "${referenceText.substring(0, 50)}..."`);

    // Forward to FastAPI AI service
    let analysisResult;

    try {
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(audioPath));
      formData.append('language', language);
      formData.append('reference_text', referenceText);

      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/api/analyze`,
        formData,
        {
          headers: { ...formData.getHeaders() },
          timeout: 30000, // 30s timeout for AI processing
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      analysisResult = aiResponse.data;
      console.log(`✅ AI analysis complete: score=${analysisResult.overallScore}`);

    } catch (aiError) {
      console.warn(`⚠️  AI service unavailable (${aiError.message}), using mock analysis`);
      analysisResult = generateMockAnalysis(referenceText, language);
    }

    // Store session result
    const sessionData = {
      sessionId,
      timestamp: new Date().toISOString(),
      language,
      referenceText,
      audioFile: req.file.filename,
      results: analysisResult,
    };
    
    if (getDbStatus()) {
      const newSession = new Session(sessionData);
      await newSession.save();
    } else {
      sessions.push(sessionData);
      // Keep only last 100 sessions in memory
      if (sessions.length > 100) sessions.shift();
    }

    // Clean up audio file after processing (optional — keep for debugging)
    // fs.unlinkSync(audioPath);

    res.json({
      success: true,
      sessionId,
      results: analysisResult,
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pronunciation/sessions
 * Get recent practice sessions
 */
router.get('/sessions', async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  
  if (getDbStatus()) {
    try {
      const dbSessions = await Session.find().sort({ timestamp: -1 }).limit(limit);
      const total = await Session.countDocuments();
      return res.json({ success: true, sessions: dbSessions, total });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  const recentSessions = sessions
    .slice(-limit)
    .reverse()
    .map(s => ({
      sessionId: s.sessionId,
      timestamp: s.timestamp,
      language: s.language,
      referenceText: s.referenceText,
      overallScore: s.results?.overallScore,
      pronunciationScore: s.results?.pronunciationScore,
      fluencyScore: s.results?.fluencyScore,
    }));

  res.json({ success: true, sessions: recentSessions, total: sessions.length });
});

/**
 * GET /api/pronunciation/sessions/:id
 * Get a specific session's full details
 */
router.get('/sessions/:id', async (req, res) => {
  if (getDbStatus()) {
    try {
      const session = await Session.findOne({ sessionId: req.params.id });
      if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
      return res.json({ success: true, session });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
  }

  const session = sessions.find(s => s.sessionId === req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }
  res.json({ success: true, session });
});

// ─── Mock Analysis Generator ────────────────────────────
function generateMockAnalysis(referenceText, language) {
  const words = referenceText ? referenceText.split(/\s+/) : ['hello', 'world'];

  const wordResults = words.map(word => {
    const score = Math.floor(Math.random() * 35) + 65; // 65-100
    let status = 'correct';
    if (score < 70) status = 'missed';
    else if (score < 80) status = 'mispronounced';

    return {
      word,
      score,
      status,
      phonemes: [],
    };
  });

  const avgScore = Math.round(wordResults.reduce((sum, w) => sum + w.score, 0) / wordResults.length);
  const mispronounced = wordResults.filter(w => w.status === 'mispronounced');

  const suggestions = [];
  if (mispronounced.length > 0) {
    mispronounced.forEach(w => {
      suggestions.push(`Focus on the pronunciation of "${w.word}" — practice the individual sounds slowly.`);
    });
  }
  suggestions.push('Try speaking at a more natural pace for better fluency scores.');
  if (avgScore > 80) suggestions.push('Great job! Your pronunciation is very clear.');

  return {
    overallScore: avgScore,
    pronunciationScore: Math.min(100, avgScore + Math.floor(Math.random() * 10) - 3),
    fluencyScore: Math.max(40, avgScore - Math.floor(Math.random() * 15)),
    completenessScore: Math.min(100, avgScore + Math.floor(Math.random() * 12)),
    words: wordResults,
    suggestions,
    recognizedText: referenceText || 'hello world',
    language,
    source: 'mock', // Indicates this is mock data, not real AI analysis
  };
}

module.exports = router;
