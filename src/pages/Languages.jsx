import { useState } from 'react';
import { Search, ChevronRight, Star, Users, BookOpen, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Languages.css';

const LANGUAGES = [
  {
    code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸',
    speakers: '1.5B', difficulty: 'Native', phrases: 150,
    progress: 45, featured: true,
    description: 'Master American and British English pronunciation.',
  },
  {
    code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸',
    speakers: '559M', difficulty: 'Easy', phrases: 120,
    progress: 28, featured: true,
    description: 'Learn Castilian and Latin American Spanish phonetics.',
  },
  {
    code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷',
    speakers: '310M', difficulty: 'Medium', phrases: 100,
    progress: 15, featured: true,
    description: 'Perfect your French nasal vowels and liaisons.',
  },
  {
    code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪',
    speakers: '132M', difficulty: 'Medium', phrases: 90,
    progress: 0, featured: false,
    description: 'Master German compound words and umlauts.',
  },
  {
    code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹',
    speakers: '68M', difficulty: 'Easy', phrases: 85,
    progress: 0, featured: false,
    description: 'Learn musical Italian pronunciation and double consonants.',
  },
  {
    code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷',
    speakers: '258M', difficulty: 'Medium', phrases: 80,
    progress: 0, featured: false,
    description: 'Practice Brazilian and European Portuguese sounds.',
  },
  {
    code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵',
    speakers: '125M', difficulty: 'Hard', phrases: 110,
    progress: 0, featured: false,
    description: 'Learn pitch accent and Japanese phonetic systems.',
  },
  {
    code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷',
    speakers: '82M', difficulty: 'Hard', phrases: 95,
    progress: 0, featured: false,
    description: 'Master Korean consonant clusters and vowel harmony.',
  },
  {
    code: 'zh', name: 'Mandarin', nativeName: '中文', flag: '🇨🇳',
    speakers: '1.1B', difficulty: 'Hard', phrases: 130,
    progress: 0, featured: false,
    description: 'Practice Mandarin tones and pinyin pronunciation.',
  },
  {
    code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦',
    speakers: '274M', difficulty: 'Hard', phrases: 75,
    progress: 0, featured: false,
    description: 'Learn Arabic throat sounds and emphatic consonants.',
  },
  {
    code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳',
    speakers: '602M', difficulty: 'Medium', phrases: 70,
    progress: 0, featured: false,
    description: 'Practice retroflex consonants and aspirated sounds.',
  },
  {
    code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺',
    speakers: '255M', difficulty: 'Hard', phrases: 85,
    progress: 0, featured: false,
    description: 'Master Russian palatalization and stress patterns.',
  },
];

const Languages = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const filteredLanguages = LANGUAGES.filter(lang => {
    const matchesSearch = lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || lang.difficulty.toLowerCase() === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const featuredLanguages = LANGUAGES.filter(l => l.featured);

  return (
    <div className="languages" id="languages-page">
      <div className="languages__bg">
        <div className="languages__orb languages__orb--1" />
        <div className="languages__orb languages__orb--2" />
      </div>

      <div className="container languages__container">
        <div className="languages__header">
          <h1 className="languages__title">
            Choose Your <span className="gradient-text">Language</span>
          </h1>
          <p className="languages__subtitle">
            Practice pronunciation in 30+ languages with AI-powered feedback
          </p>
        </div>

        {/* Featured Languages */}
        <div className="languages__featured">
          <h2 className="languages__section-title">
            <Star size={20} />
            Featured Languages
          </h2>
          <div className="languages__featured-grid">
            {featuredLanguages.map(lang => (
              <Link to="/practice" key={lang.code} className="lang-featured-card" id={`featured-${lang.code}`}>
                <div className="lang-featured-card__header">
                  <span className="lang-featured-card__flag">{lang.flag}</span>
                  <div className="lang-featured-card__info">
                    <h3 className="lang-featured-card__name">{lang.name}</h3>
                    <span className="lang-featured-card__native">{lang.nativeName}</span>
                  </div>
                  <span className={`lang-featured-card__difficulty lang-featured-card__difficulty--${lang.difficulty.toLowerCase()}`}>
                    {lang.difficulty}
                  </span>
                </div>
                <p className="lang-featured-card__description">{lang.description}</p>
                <div className="lang-featured-card__stats">
                  <span><Users size={14} /> {lang.speakers} speakers</span>
                  <span><BookOpen size={14} /> {lang.phrases} phrases</span>
                </div>
                {lang.progress > 0 && (
                  <div className="lang-featured-card__progress">
                    <div className="lang-featured-card__progress-bar">
                      <div
                        className="lang-featured-card__progress-fill"
                        style={{ width: `${lang.progress}%` }}
                      />
                    </div>
                    <span className="lang-featured-card__progress-label">{lang.progress}% complete</span>
                  </div>
                )}
                <div className="lang-featured-card__action">
                  {lang.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  <ChevronRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Languages */}
        <div className="languages__all">
          <div className="languages__all-header">
            <h2 className="languages__section-title">
              <BookOpen size={20} />
              All Languages
            </h2>

            <div className="languages__filters">
              <div className="languages__search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="languages__search-input"
                  id="language-search"
                />
              </div>

              <div className="languages__difficulty-filters">
                {['all', 'easy', 'medium', 'hard'].map(level => (
                  <button
                    key={level}
                    className={`languages__filter-btn ${selectedDifficulty === level ? 'languages__filter-btn--active' : ''}`}
                    onClick={() => setSelectedDifficulty(level)}
                    id={`filter-${level}`}
                  >
                    {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="languages__grid">
            {filteredLanguages.map(lang => (
              <Link to="/practice" key={lang.code} className="lang-card" id={`lang-${lang.code}`}>
                <div className="lang-card__header">
                  <span className="lang-card__flag">{lang.flag}</span>
                  <div>
                    <h3 className="lang-card__name">{lang.name}</h3>
                    <span className="lang-card__native">{lang.nativeName}</span>
                  </div>
                </div>
                <div className="lang-card__meta">
                  <span className={`lang-card__difficulty lang-card__difficulty--${lang.difficulty.toLowerCase()}`}>
                    {lang.difficulty}
                  </span>
                  <span className="lang-card__phrases">{lang.phrases} phrases</span>
                </div>
                {lang.progress > 0 && (
                  <div className="lang-card__progress">
                    <div className="lang-card__progress-bar">
                      <div className="lang-card__progress-fill" style={{ width: `${lang.progress}%` }} />
                    </div>
                    <span className="lang-card__progress-text">{lang.progress}%</span>
                  </div>
                )}
                <ChevronRight size={16} className="lang-card__arrow" />
              </Link>
            ))}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="languages__empty">
              <p>No languages found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Languages;
