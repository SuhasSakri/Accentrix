const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: String, default: 'default_user', unique: true },
  totalSessions: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  totalPracticeTime: { type: Number, default: 0 },
  languagesPracticed: { type: [String], default: [] },
  dailyScores: { type: Map, of: Object, default: {} },
  history: { type: Array, default: [] },
  achievements: { type: Array, default: [] }
});

module.exports = mongoose.model('Progress', progressSchema);
