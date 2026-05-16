import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Award, Flame, Mic, Globe, Clock, RefreshCw, WifiOff } from 'lucide-react';
import { getProgress } from '../services/api';
import './Progress.css';

// Fallback data when backend is offline
const FALLBACK_DATA = {
  stats: {
    totalSessions: 25,
    averageScore: 79,
    bestScore: 94,
    currentStreak: 7,
    totalPracticeTime: '2h 38m',
    languagesPracticed: 3,
  },
  weeklyScores: [
    { day: 'Mon', score: 68, sessions: 3 },
    { day: 'Tue', score: 71, sessions: 5 },
    { day: 'Wed', score: 73, sessions: 2 },
    { day: 'Thu', score: 76, sessions: 4 },
    { day: 'Fri', score: 79, sessions: 3 },
    { day: 'Sat', score: 82, sessions: 6 },
    { day: 'Sun', score: 87, sessions: 2 },
  ],
  history: [
    { date: new Date().toISOString(), language: 'en-US', overallScore: 87, pronunciationScore: 89, duration: 12 },
    { date: new Date(Date.now() - 86400000).toISOString(), language: 'en-US', overallScore: 82, pronunciationScore: 85, duration: 25 },
    { date: new Date(Date.now() - 172800000).toISOString(), language: 'es-ES', overallScore: 79, pronunciationScore: 81, duration: 8 },
    { date: new Date(Date.now() - 259200000).toISOString(), language: 'fr-FR', overallScore: 76, pronunciationScore: 78, duration: 18 },
    { date: new Date(Date.now() - 345600000).toISOString(), language: 'en-US', overallScore: 73, pronunciationScore: 75, duration: 15 },
  ],
  achievements: [
    { id: 'first_session', icon: '🎯', title: 'First Session', description: 'Completed your first practice session', unlocked: true },
    { id: 'streak_7', icon: '🔥', title: '7-Day Streak', description: 'Practiced for 7 consecutive days', unlocked: true },
    { id: 'score_90', icon: '⭐', title: 'Score 90+', description: 'Achieved a score above 90', unlocked: true },
    { id: 'polyglot', icon: '🌍', title: 'Polyglot', description: 'Practiced in 3 different languages', unlocked: true },
    { id: 'score_95', icon: '💎', title: 'Score 95+', description: 'Achieved a score above 95', unlocked: false },
    { id: 'streak_30', icon: '🏆', title: '30-Day Streak', description: 'Practice for 30 consecutive days', unlocked: false },
  ],
};

const Progress = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await getProgress();
      if (response.success) {
        setData(response);
        setIsLive(true);
      } else {
        setData(FALLBACK_DATA);
        setIsLive(false);
      }
    } catch {
      setData(FALLBACK_DATA);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading || !data) {
    return (
      <div className="progress" id="progress-page">
        <div className="progress__bg">
          <div className="progress__orb progress__orb--1" />
          <div className="progress__orb progress__orb--2" />
        </div>
        <div className="container progress__container" style={{ textAlign: 'center', paddingTop: '200px' }}>
          <div className="practice__analyzing-spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--neutral-400)' }}>Loading your progress...</p>
        </div>
      </div>
    );
  }

  const { stats, weeklyScores, history, achievements } = data;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getLangName = (code) => {
    const map = { 'en-US': 'English', 'es-ES': 'Spanish', 'fr-FR': 'French' };
    return map[code] || code;
  };

  return (
    <div className="progress" id="progress-page">
      <div className="progress__bg">
        <div className="progress__orb progress__orb--1" />
        <div className="progress__orb progress__orb--2" />
      </div>

      <div className="container progress__container">
        <div className="progress__header">
          <h1 className="progress__title">
            Your <span className="gradient-text">Progress</span>
          </h1>
          <p className="progress__subtitle">
            Track your pronunciation improvement journey
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
            {!isLive && (
              <span className="practice__status practice__status--offline" style={{ animation: 'none' }}>
                <WifiOff size={12} />
                Demo data — start backend for live tracking
              </span>
            )}
            <button onClick={fetchProgress} className="practice__reset-btn" style={{ fontSize: '0.75rem' }}>
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="progress__stats-grid">
          <div className="stat-card stat-card--primary">
            <div className="stat-card__icon">
              <Target size={24} />
            </div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stats.averageScore || 0}</span>
              <span className="stat-card__label">Avg Score</span>
            </div>
            {stats.averageScore > 0 && (
              <div className="stat-card__trend stat-card__trend--up">
                <TrendingUp size={14} />
                +{Math.min(stats.averageScore, 11)}
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--amber">
              <Flame size={24} />
            </div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stats.currentStreak || 0}</span>
              <span className="stat-card__label">Day Streak</span>
            </div>
            {stats.currentStreak > 0 && <div className="stat-card__badge">🔥</div>}
          </div>

          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--green">
              <Award size={24} />
            </div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stats.bestScore || 0}</span>
              <span className="stat-card__label">Best Score</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--cyan">
              <Mic size={24} />
            </div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stats.totalSessions || 0}</span>
              <span className="stat-card__label">Total Sessions</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--violet">
              <Clock size={24} />
            </div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stats.totalPracticeTime || '0m'}</span>
              <span className="stat-card__label">Practice Time</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--rose">
              <Globe size={24} />
            </div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stats.languagesPracticed || 0}</span>
              <span className="stat-card__label">Languages</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="progress__chart glass">
          <div className="progress__chart-header">
            <h2 className="progress__chart-title">
              <BarChart3 size={20} />
              Weekly Score Trend
            </h2>
            <div className="progress__chart-period">
              <Calendar size={14} />
              This Week
            </div>
          </div>

          <div className="progress__chart-area">
            <div className="progress__chart-bars">
              {weeklyScores.map((item, i) => (
                <div key={i} className="progress__bar-group">
                  <div className="progress__bar-wrapper">
                    <div
                      className="progress__bar"
                      style={{
                        height: `${item.score || 2}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      {item.score > 0 && <span className="progress__bar-value">{item.score}</span>}
                    </div>
                  </div>
                  <span className="progress__bar-label">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="progress__bottom-grid">
          {/* Session History */}
          <div className="progress__history glass">
            <h2 className="progress__section-title">
              <Clock size={20} />
              Recent Sessions
            </h2>
            <div className="progress__history-list">
              {history.length > 0 ? history.map((session, i) => (
                <div key={i} className="history-item" id={`session-${i}`}>
                  <div className="history-item__left">
                    <span className="history-item__date">{formatDate(session.date)}</span>
                    <span className="history-item__meta">
                      {getLangName(session.language)} · {session.duration || 0}s
                    </span>
                  </div>
                  <div className="history-item__right">
                    <div className="history-item__scores">
                      <span className="history-item__avg">
                        Score: <strong>{session.overallScore}</strong>
                      </span>
                    </div>
                    <div
                      className="history-item__bar"
                      style={{ '--fill': `${session.overallScore}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                  No sessions yet. Start practicing to see your history!
                </p>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="progress__achievements glass">
            <h2 className="progress__section-title">
              <Award size={20} />
              Achievements
            </h2>
            <div className="progress__achievement-list">
              {achievements.map((achievement, i) => (
                <div
                  key={i}
                  className={`achievement ${!achievement.unlocked ? 'achievement--locked' : ''}`}
                  id={`achievement-${i}`}
                >
                  <span className="achievement__icon">{achievement.icon}</span>
                  <div className="achievement__info">
                    <span className="achievement__title">{achievement.title}</span>
                    <span className="achievement__description">{achievement.description}</span>
                  </div>
                  {achievement.unlocked && (
                    <span className="achievement__check">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
