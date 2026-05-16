const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  language: String,
  referenceText: String,
  audioFile: String,
  results: {
    overallScore: Number,
    pronunciationScore: Number,
    fluencyScore: Number,
    completenessScore: Number,
    words: Array,
    suggestions: Array,
    recognizedText: String,
    source: String
  }
});

module.exports = mongoose.model('Session', sessionSchema);
