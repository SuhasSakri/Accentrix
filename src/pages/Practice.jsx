import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Play, Square, RotateCcw, ChevronDown, Volume2, AlertCircle, CheckCircle2, XCircle, TrendingUp, Clock, Wifi, WifiOff } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { analyzePronunciation, recordProgress, checkHealth } from '../services/api';
import './Practice.css';

const SAMPLE_PHRASES = {
  english: [
    { id: 1, text: 'The quick brown fox jumps over the lazy dog', difficulty: 'Easy', langCode: 'en-US' },
    { id: 2, text: 'She sells seashells by the seashore', difficulty: 'Medium', langCode: 'en-US' },
    { id: 3, text: 'How much wood would a woodchuck chuck', difficulty: 'Medium', langCode: 'en-US' },
    { id: 4, text: 'Peter Piper picked a peck of pickled peppers', difficulty: 'Hard', langCode: 'en-US' },
  ],
  spanish: [
    { id: 1, text: 'El perro corre por el parque', difficulty: 'Easy', langCode: 'es-ES' },
    { id: 2, text: 'Los pájaros cantan en los árboles', difficulty: 'Medium', langCode: 'es-ES' },
    { id: 3, text: 'Camarón que se duerme se lo lleva la corriente', difficulty: 'Hard', langCode: 'es-ES' },
  ],
  french: [
    { id: 1, text: 'Bonjour, comment allez-vous', difficulty: 'Easy', langCode: 'fr-FR' },
    { id: 2, text: 'Les poissons rouges nagent dans le bassin', difficulty: 'Medium', langCode: 'fr-FR' },
    { id: 3, text: 'Un chasseur sachant chasser doit savoir chasser sans son chien', difficulty: 'Hard', langCode: 'fr-FR' },
  ],
  german: [
    { id: 1, text: 'Guten Morgen, wie geht es dir?', difficulty: 'Easy', langCode: 'de-DE' },
    { id: 2, text: 'Ich lerne gerne neue Sprachen', difficulty: 'Medium', langCode: 'de-DE' },
    { id: 3, text: 'Fischers Fritz fischt frische Fische', difficulty: 'Hard', langCode: 'de-DE' },
  ],
  italian: [
    { id: 1, text: 'Buongiorno, come stai oggi?', difficulty: 'Easy', langCode: 'it-IT' },
    { id: 2, text: 'Il cibo italiano è molto delizioso', difficulty: 'Medium', langCode: 'it-IT' },
    { id: 3, text: 'Sopra la panca la capra campa, sotto la panca la capra crepa', difficulty: 'Hard', langCode: 'it-IT' },
  ],
  portuguese: [
    { id: 1, text: 'Bom dia, como você está?', difficulty: 'Easy', langCode: 'pt-BR' },
    { id: 2, text: 'Eu gosto muito de viajar pelo mundo', difficulty: 'Medium', langCode: 'pt-BR' },
    { id: 3, text: 'O rato roeu a roupa do rei de Roma', difficulty: 'Hard', langCode: 'pt-BR' },
  ],
  hindi: [
    { id: 1, text: 'नमस्ते, आप कैसे हैं?', difficulty: 'Easy', langCode: 'hi-IN' },
    { id: 2, text: 'मुझे नई भाषाएं सीखना पसंद है', difficulty: 'Medium', langCode: 'hi-IN' },
    { id: 3, text: 'खड़क सिंह के खड़कने से खड़कती हैं खिड़कियां', difficulty: 'Hard', langCode: 'hi-IN' },
  ],
  japanese: [
    { id: 1, text: 'こんにちは、お元気ですか？', difficulty: 'Easy', langCode: 'ja-JP' },
    { id: 2, text: '私は新しい言語を学ぶのが好きです', difficulty: 'Medium', langCode: 'ja-JP' },
    { id: 3, text: '生麦生米生卵', difficulty: 'Hard', langCode: 'ja-JP' },
  ],
  chinese: [
    { id: 1, text: '你好，你今天怎么样？', difficulty: 'Easy', langCode: 'zh-CN' },
    { id: 2, text: '我喜欢学习新的语言', difficulty: 'Medium', langCode: 'zh-CN' },
    { id: 3, text: '四是四，十是十，十四是十四，四十是四十', difficulty: 'Hard', langCode: 'zh-CN' },
  ],
};

const LANG_MAP = {
  english: 'en-US',
  spanish: 'es-ES',
  french: 'fr-FR',
  german: 'de-DE',
  italian: 'it-IT',
  portuguese: 'pt-BR',
  hindi: 'hi-IN',
  japanese: 'ja-JP',
  chinese: 'zh-CN'
};

const Practice = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [selectedPhrase, setSelectedPhrase] = useState(SAMPLE_PHRASES.english[0]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, online, offline
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');

  const {
    isRecording,
    audioBlob,
    audioLevel,
    recordingTime,
    error: recordingError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const languages = [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
    { code: 'french', name: 'French', flag: '🇫🇷' },
    { code: 'german', name: 'German', flag: '🇩🇪' },
    { code: 'italian', name: 'Italian', flag: '🇮🇹' },
    { code: 'portuguese', name: 'Portuguese', flag: '🇧🇷' },
    { code: 'hindi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'japanese', name: 'Japanese', flag: '🇯🇵' },
    { code: 'chinese', name: 'Chinese', flag: '🇨🇳' },
  ];

  // Check backend health on mount
  useEffect(() => {
    checkHealth().then(health => {
      setBackendStatus(health.status === 'ok' ? 'online' : 'offline');
    }).catch(() => {
      setBackendStatus('offline');
    });
  }, []);

  // When recording stops and we have audio, analyze it
  useEffect(() => {
    if (!isRecording && audioBlob && !showResults && !isAnalyzing) {
      handleAnalyze();
    }
  }, [isRecording, audioBlob]);

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    
    const targetText = isCustomMode ? customText : selectedPhrase.text;
    if (!targetText.trim()) {
      setAnalyzeError('Please enter some text to practice.');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const response = await analyzePronunciation(
        audioBlob,
        isCustomMode ? LANG_MAP[selectedLanguage] : selectedPhrase.langCode,
        targetText
      );

      if (response.success && response.results) {
        setResults(response.results);
        setShowResults(true);

        // Record progress in background
        recordProgress({
          language: isCustomMode ? LANG_MAP[selectedLanguage] : selectedPhrase.langCode,
          referenceText: targetText,
          overallScore: response.results.overallScore,
          pronunciationScore: response.results.pronunciationScore,
          fluencyScore: response.results.fluencyScore,
          completenessScore: response.results.completenessScore,
          duration: recordingTime,
        }).catch(err => console.warn('Failed to record progress:', err));
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalyzeError(error.message || 'Failed to analyze audio. Is the backend running?');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleListen = () => {
    const targetText = isCustomMode ? customText : selectedPhrase.text;
    if (!targetText) return;

    // Use native browser Text-to-Speech
    const utterance = new SpeechSynthesisUtterance(targetText);
    utterance.lang = LANG_MAP[selectedLanguage] || 'en-US';

    window.speechSynthesis.cancel(); // Stop any current speech
    window.speechSynthesis.speak(utterance);
  };

  const resetPractice = () => {
    resetRecording();
    setShowResults(false);
    setResults(null);
    setIsAnalyzing(false);
    setAnalyzeError(null);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'good';
    if (score >= 60) return 'medium';
    return 'poor';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="practice" id="practice-page">
      <div className="practice__bg">
        <div className="practice__orb practice__orb--1" />
        <div className="practice__orb practice__orb--2" />
      </div>

      <div className="container practice__container">
        {/* Header */}
        <div className="practice__header">
          <h1 className="practice__title">
            Pronunciation <span className="gradient-text">Practice</span>
          </h1>
          <p className="practice__subtitle">
            Select a phrase, record your speech, and get instant AI feedback
          </p>

          {/* Backend Status Indicator */}
          <div className={`practice__status practice__status--${backendStatus}`}>
            {backendStatus === 'online' ? <Wifi size={14} /> : backendStatus === 'offline' ? <WifiOff size={14} /> : null}
            <span>
              {backendStatus === 'online' && 'Backend connected'}
              {backendStatus === 'offline' && 'Backend offline — start backend for real analysis'}
              {backendStatus === 'checking' && 'Checking backend...'}
            </span>
          </div>
        </div>

        <div className="practice__layout">
          {/* Left: Controls */}
          <div className="practice__controls">
            {/* Language Selector */}
            <div className="practice__section">
              <label className="practice__label">Language</label>
              <div className="practice__dropdown-wrapper">
                <button
                  className="practice__dropdown-trigger"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  id="language-selector"
                >
                  <span className="practice__dropdown-flag">
                    {languages.find(l => l.code === selectedLanguage)?.flag}
                  </span>
                  <span>{languages.find(l => l.code === selectedLanguage)?.name}</span>
                  <ChevronDown size={16} className={`practice__dropdown-chevron ${showLanguageDropdown ? 'practice__dropdown-chevron--open' : ''}`} />
                </button>
                {showLanguageDropdown && (
                  <div className="practice__dropdown-menu">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        className={`practice__dropdown-item ${selectedLanguage === lang.code ? 'practice__dropdown-item--active' : ''}`}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setSelectedPhrase(SAMPLE_PHRASES[lang.code][0]);
                          setShowLanguageDropdown(false);
                          resetPractice();
                        }}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="practice__mode-tabs">
              <button 
                className={`practice__tab-btn ${!isCustomMode ? 'practice__tab-btn--active' : ''}`}
                onClick={() => setIsCustomMode(false)}
              >
                Suggested Phrases
              </button>
              <button 
                className={`practice__tab-btn ${isCustomMode ? 'practice__tab-btn--active' : ''}`}
                onClick={() => setIsCustomMode(true)}
              >
                Custom Practice
              </button>
            </div>

            {/* Phrase Selector or Custom Input */}
            <div className="practice__section">
              <label className="practice__label">
                {isCustomMode ? 'Type your own text' : 'Practice Phrase'}
              </label>
              
              {isCustomMode ? (
                <textarea
                  className="practice__custom-input"
                  placeholder="Type any sentence you want to practice..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={4}
                />
              ) : (
                <div className="practice__phrases">
                  {SAMPLE_PHRASES[selectedLanguage].map(phrase => (
                    <button
                      key={phrase.id}
                      className={`practice__phrase-btn ${selectedPhrase.id === phrase.id ? 'practice__phrase-btn--active' : ''}`}
                      onClick={() => { setSelectedPhrase(phrase); resetPractice(); }}
                      id={`phrase-${phrase.id}`}
                    >
                      <span className="practice__phrase-text">{phrase.text}</span>
                      <span className={`practice__phrase-difficulty practice__phrase-difficulty--${phrase.difficulty.toLowerCase()}`}>
                        {phrase.difficulty}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Recording */}
          <div className="practice__recorder">
            {/* Target Phrase Display */}
            <div className="practice__target glass">
              <label className="practice__label">Say this phrase:</label>
              <p className="practice__target-text">
                {isCustomMode ? (customText || "Type something to practice...") : selectedPhrase.text}
              </p>
              <button className="practice__listen-btn" onClick={handleListen} id="listen-btn">
                <Volume2 size={16} />
                Listen to Native Pronunciation
              </button>
            </div>

            {/* Mic Button */}
            <div className="practice__mic-area">
              {/* Audio Level Visualization */}
              <div className="practice__audio-viz">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="practice__viz-bar"
                    style={{
                      height: isRecording
                        ? `${Math.max(4, Math.sin(Date.now() / 200 + i * 0.5) * audioLevel * 0.5 + audioLevel * 0.3)}px`
                        : '4px',
                      transition: 'height 0.1s ease',
                    }}
                  />
                ))}
              </div>

              <div className="practice__mic-wrapper">
                {isRecording && (
                  <>
                    <div className="practice__mic-ripple practice__mic-ripple--1" />
                    <div className="practice__mic-ripple practice__mic-ripple--2" />
                    <div className="practice__mic-ripple practice__mic-ripple--3" />
                  </>
                )}
                <button
                  className={`practice__mic-btn ${isRecording ? 'practice__mic-btn--recording' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isAnalyzing}
                  id="record-btn"
                >
                  {isRecording ? <Square size={28} /> : <Mic size={32} />}
                </button>
              </div>

              <div className="practice__mic-info">
                {isAnalyzing ? (
                  <div className="practice__analyzing">
                    <div className="practice__analyzing-spinner" />
                    <span>Analyzing your speech...</span>
                  </div>
                ) : isRecording ? (
                  <>
                    <span className="practice__recording-indicator">
                      <span className="practice__recording-dot" />
                      Recording
                    </span>
                    <span className="practice__timer">{formatTime(recordingTime)}</span>
                  </>
                ) : (
                  <span className="practice__mic-hint">
                    {showResults ? 'Click to try again' : 'Click the microphone to start recording'}
                  </span>
                )}
              </div>

              {/* Errors */}
              {(recordingError || analyzeError) && (
                <div className="practice__error">
                  <AlertCircle size={16} />
                  <span>{recordingError || analyzeError}</span>
                </div>
              )}

              {(isRecording || showResults || analyzeError) && !isAnalyzing && (
                <button className="practice__reset-btn" onClick={resetPractice} id="reset-btn">
                  <RotateCcw size={16} />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {showResults && results && (
          <div className="results" id="results-section">
            <div className="results__header">
              <h2 className="results__title">
                <TrendingUp size={24} />
                Your Results
              </h2>
              {results.source === 'mock' && (
                <span className="results__source-badge">
                  Mock Data — Connect Azure for real analysis
                </span>
              )}
            </div>

            {/* Playback Audio */}
            {audioUrl && (
              <div className="results__playback">
                <p className="results__playback-label">Listen to your recording:</p>
                <audio src={audioUrl} controls className="results__audio-player" />
              </div>
            )}

            {/* Score Cards */}
            <div className="results__scores">
              {[
                { label: 'Overall', score: results.overallScore, icon: <CheckCircle2 size={20} /> },
                { label: 'Pronunciation', score: results.pronunciationScore, icon: <Mic size={20} /> },
                { label: 'Fluency', score: results.fluencyScore, icon: <Volume2 size={20} /> },
                { label: 'Completeness', score: results.completenessScore, icon: <Clock size={20} /> },
              ].map((item, i) => (
                <div key={i} className={`score-card score-card--${getScoreColor(item.score)}`} id={`score-${item.label.toLowerCase()}`}>
                  <div className="score-card__header">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <div className="score-card__value-wrapper">
                    <svg className="score-card__ring" viewBox="0 0 100 100">
                      <circle className="score-card__ring-bg" cx="50" cy="50" r="42" />
                      <circle
                        className="score-card__ring-fill"
                        cx="50" cy="50" r="42"
                        style={{
                          strokeDasharray: `${2 * Math.PI * 42}`,
                          strokeDashoffset: `${2 * Math.PI * 42 * (1 - item.score / 100)}`,
                        }}
                      />
                    </svg>
                    <div className="score-card__value">{item.score}</div>
                  </div>
                  <div className="score-card__label">{getScoreLabel(item.score)}</div>
                </div>
              ))}
            </div>

            {/* Word Analysis */}
            <div className="results__words glass">
              <h3 className="results__section-title">Word-by-Word Analysis</h3>
              <div className="results__word-list">
                {results.words.map((word, i) => (
                  <span
                    key={i}
                    className={`results__word results__word--${word.status}`}
                    title={`Score: ${word.score}/100`}
                    id={`word-${i}`}
                  >
                    {word.word}
                    <span className="results__word-score">{word.score}</span>
                  </span>
                ))}
              </div>
              <div className="results__legend">
                <span className="results__legend-item">
                  <CheckCircle2 size={14} className="results__legend-icon--correct" />
                  Correct
                </span>
                <span className="results__legend-item">
                  <AlertCircle size={14} className="results__legend-icon--mispronounced" />
                  Needs improvement
                </span>
                <span className="results__legend-item">
                  <XCircle size={14} className="results__legend-icon--missed" />
                  Missed
                </span>
              </div>
            </div>

            {/* Suggestions */}
            <div className="results__suggestions glass">
              <h3 className="results__section-title">💡 Improvement Tips</h3>
              <ul className="results__suggestion-list">
                {results.suggestions.map((tip, i) => (
                  <li key={i} className="results__suggestion-item">{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice;
