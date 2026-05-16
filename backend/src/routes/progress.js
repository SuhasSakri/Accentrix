const express = require('express');
const router = express.Router();
const { getDbStatus } = require('../db');
const Progress = require('../models/Progress');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

// ─── In-memory progress store ───────────────────────────
let progressData = {
  totalSessions: 0,
  averageScore: 0,
  bestScore: 0,
  currentStreak: 0,
  totalPracticeTime: 0, // seconds
  languagesPracticed: new Set(),
  dailyScores: {}, // { 'YYYY-MM-DD': { sessions: N, totalScore: N, bestScore: N } }
  history: [],
  achievements: [
    { id: 'first_session', icon: '🎯', title: 'First Session', description: 'Completed your first practice session', unlocked: false },
    { id: 'streak_7', icon: '🔥', title: '7-Day Streak', description: 'Practiced for 7 consecutive days', unlocked: false },
    { id: 'score_90', icon: '⭐', title: 'Score 90+', description: 'Achieved a score above 90', unlocked: false },
    { id: 'polyglot', icon: '🌍', title: 'Polyglot', description: 'Practiced in 3 different languages', unlocked: false },
    { id: 'score_95', icon: '💎', title: 'Score 95+', description: 'Achieved a score above 95', unlocked: false },
    { id: 'streak_30', icon: '🏆', title: '30-Day Streak', description: 'Practice for 30 consecutive days', unlocked: false },
  ],
};

/**
 * GET /api/progress
 * Get overall progress stats
 */
router.get('/', async (req, res) => {
  let activeProgress = progressData;
  const userId = req.user?.userId || 'default_user';

  if (getDbStatus()) {
    try {
      let dbProgress = await Progress.findOne({ userId });
      if (!dbProgress) {
        dbProgress = new Progress({ userId, achievements: progressData.achievements });
        await dbProgress.save();
      }
      activeProgress = dbProgress.toObject();
    } catch (err) {
      console.error('DB error fetching progress:', err);
    }
  }

  const languages = Array.from(activeProgress.languagesPracticed);

  // Compute weekly data
  const today = new Date();
  const weeklyScores = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    const dayData = activeProgress.dailyScores[key];

    weeklyScores.push({
      day: dayNames[date.getDay()],
      date: key,
      score: dayData ? Math.round(dayData.totalScore / dayData.sessions) : 0,
      sessions: dayData?.sessions || 0,
    });
  }

  // Format practice time
  const totalSeconds = activeProgress.totalPracticeTime;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const practiceTimeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  res.json({
    success: true,
    stats: {
      totalSessions: activeProgress.totalSessions,
      averageScore: activeProgress.averageScore,
      bestScore: activeProgress.bestScore,
      currentStreak: activeProgress.currentStreak,
      totalPracticeTime: practiceTimeFormatted,
      languagesPracticed: languages.length,
    },
    weeklyScores,
    history: activeProgress.history.slice(-20).reverse(),
    achievements: activeProgress.achievements,
  });
});

/**
 * POST /api/progress/record
 * Record a new practice session result
 */
router.post('/record', async (req, res) => {
  const { language, referenceText, overallScore, pronunciationScore, fluencyScore, completenessScore, duration } = req.body;

  if (overallScore === undefined) {
    return res.status(400).json({ success: false, error: 'overallScore is required' });
  }

  const today = new Date().toISOString().split('T')[0];
  const userId = req.user?.userId || 'default_user';

  let activeProgress = progressData;
  let dbProgress = null;

  if (getDbStatus()) {
    try {
      dbProgress = await Progress.findOne({ userId });
      if (!dbProgress) {
        dbProgress = new Progress({ userId, achievements: progressData.achievements });
      }
      activeProgress = dbProgress.toObject();
      if (!activeProgress.dailyScores) activeProgress.dailyScores = {};
    } catch (err) {
      console.error('DB error fetching progress:', err);
    }
  }

  // Update totals
  activeProgress.totalSessions++;
  const oldTotal = activeProgress.averageScore * (activeProgress.totalSessions - 1);
  activeProgress.averageScore = Math.round((oldTotal + overallScore) / activeProgress.totalSessions);
  activeProgress.bestScore = Math.max(activeProgress.bestScore, overallScore);
  activeProgress.totalPracticeTime += (duration || 10);

  if (language) {
    if (activeProgress.languagesPracticed instanceof Set) {
      activeProgress.languagesPracticed.add(language);
    } else {
      if (!activeProgress.languagesPracticed.includes(language)) {
        activeProgress.languagesPracticed.push(language);
      }
    }
  }

  // Update daily scores
  if (!activeProgress.dailyScores[today]) {
    activeProgress.dailyScores[today] = { sessions: 0, totalScore: 0, bestScore: 0 };
  }
  activeProgress.dailyScores[today].sessions++;
  activeProgress.dailyScores[today].totalScore += overallScore;
  activeProgress.dailyScores[today].bestScore = Math.max(
    activeProgress.dailyScores[today].bestScore,
    overallScore
  );

  // Calculate streak
  let streak = 0;
  const checkDate = new Date();
  while (true) {
    const key = checkDate.toISOString().split('T')[0];
    if (activeProgress.dailyScores[key]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  activeProgress.currentStreak = streak;

  // Add to history
  activeProgress.history.push({
    date: new Date().toISOString(),
    language: language || 'en-US',
    referenceText: referenceText || '',
    overallScore,
    pronunciationScore,
    fluencyScore,
    completenessScore,
    duration: duration || 10,
  });

  // Check achievements
  if (activeProgress.totalSessions >= 1) {
    activeProgress.achievements.find(a => a.id === 'first_session').unlocked = true;
  }
  if (activeProgress.currentStreak >= 7) {
    activeProgress.achievements.find(a => a.id === 'streak_7').unlocked = true;
  }
  if (activeProgress.currentStreak >= 30) {
    activeProgress.achievements.find(a => a.id === 'streak_30').unlocked = true;
  }
  if (overallScore >= 90) {
    activeProgress.achievements.find(a => a.id === 'score_90').unlocked = true;
  }
  if (overallScore >= 95) {
    activeProgress.achievements.find(a => a.id === 'score_95').unlocked = true;
  }
  if (activeProgress.languagesPracticed.length >= 3 || (activeProgress.languagesPracticed instanceof Set && activeProgress.languagesPracticed.size >= 3)) {
    activeProgress.achievements.find(a => a.id === 'polyglot').unlocked = true;
  }

  if (getDbStatus() && dbProgress) {
    try {
      dbProgress.set(activeProgress);
      await dbProgress.save();
    } catch (err) {
      console.error('DB error saving progress:', err);
    }
  }

  res.json({
    success: true,
    message: 'Session recorded',
    currentStreak: activeProgress.currentStreak,
    newAchievements: activeProgress.achievements.filter(a => a.unlocked).map(a => a.title),
  });
});

module.exports = router;
