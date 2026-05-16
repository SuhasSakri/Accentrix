import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Zap, BarChart3, Globe, ArrowRight, Volume2, CheckCircle2, Sparkles, Shield, Brain, Headphones } from 'lucide-react';
import './Home.css';

const Home = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      heroRef.current.style.setProperty('--mouse-x', `${x}px`);
      heroRef.current.style.setProperty('--mouse-y', `${y}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Mic size={28} />,
      title: 'Voice Recording',
      description: 'Crystal-clear audio capture with noise reduction for accurate analysis.',
      color: 'blue',
    },
    {
      icon: <Brain size={28} />,
      title: 'AI Analysis',
      description: 'Azure Cognitive Services powered speech recognition and scoring.',
      color: 'violet',
    },
    {
      icon: <Zap size={28} />,
      title: 'Real-Time Feedback',
      description: 'Instant pronunciation corrections with word-level accuracy details.',
      color: 'amber',
    },
    {
      icon: <BarChart3 size={28} />,
      title: 'Progress Tracking',
      description: 'Visual dashboards showing your improvement journey over time.',
      color: 'emerald',
    },
    {
      icon: <Globe size={28} />,
      title: 'Multilingual',
      description: 'Support for 30+ languages with native speaker reference models.',
      color: 'cyan',
    },
    {
      icon: <Shield size={28} />,
      title: 'Edge AI',
      description: 'On-device TensorFlow Lite inference for privacy and speed.',
      color: 'rose',
    },
  ];

  const steps = [
    { number: '01', title: 'Speak', description: 'Record a word, phrase, or sentence in your target language.', icon: <Mic size={32} /> },
    { number: '02', title: 'Analyze', description: 'AI evaluates pronunciation, fluency, and accuracy in real-time.', icon: <Brain size={32} /> },
    { number: '03', title: 'Improve', description: 'Get targeted feedback with specific sounds to practice.', icon: <Sparkles size={32} /> },
  ];

  const stats = [
    { value: '98%', label: 'Accuracy Rate' },
    { value: '30+', label: 'Languages' },
    { value: '<1s', label: 'Response Time' },
    { value: '50K+', label: 'Active Users' },
  ];

  return (
    <div className="home" id="home-page">
      {/* Hero Section */}
      <section className="hero" ref={heroRef} id="hero-section">
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
          <div className="hero__grid-overlay" />
        </div>

        <div className="hero__content container">
          <div className="hero__text">
            <div className="hero__badge">
              <Sparkles size={14} />
              <span>AI-Powered Pronunciation Coach</span>
            </div>

            <h1 className="hero__title">
              Speak with
              <br />
              <span className="gradient-text">Confidence</span>
            </h1>

            <p className="hero__subtitle">
              Accentrix uses advanced AI to analyze your pronunciation in real-time,
              providing instant feedback and personalized coaching to help you
              speak any language fluently.
            </p>

            <div className="hero__actions">
              <Link to="/practice" className="hero__btn hero__btn--primary" id="hero-start-btn">
                <Mic size={20} />
                Start Practicing
                <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="hero__btn hero__btn--secondary" id="hero-learn-btn">
                <Headphones size={20} />
                How It Works
              </a>
            </div>

            <div className="hero__stats">
              {stats.map((stat, i) => (
                <div key={i} className="hero__stat">
                  <span className="hero__stat-value">{stat.value}</span>
                  <span className="hero__stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__mic-container">
              <div className="hero__mic-ring hero__mic-ring--outer" />
              <div className="hero__mic-ring hero__mic-ring--middle" />
              <div className="hero__mic-ring hero__mic-ring--inner" />
              <div className="hero__mic-core">
                <Mic size={48} />
              </div>
              <div className="hero__waveform">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="hero__wave-bar"
                    style={{
                      animationDelay: `${i * 0.08}s`,
                      height: `${Math.random() * 40 + 10}px`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Floating Score Cards */}
            <div className="hero__float-card hero__float-card--score">
              <div className="hero__float-card-icon hero__float-card-icon--green">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div className="hero__float-card-label">Pronunciation Score</div>
                <div className="hero__float-card-value">92/100</div>
              </div>
            </div>

            <div className="hero__float-card hero__float-card--fluency">
              <div className="hero__float-card-icon hero__float-card-icon--blue">
                <Volume2 size={16} />
              </div>
              <div>
                <div className="hero__float-card-label">Fluency Rating</div>
                <div className="hero__float-card-value">Excellent</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Simple Process</span>
            <h2 className="section-title">
              How <span className="gradient-text">Accentrix</span> Works
            </h2>
            <p className="section-subtitle">
              Three simple steps to better pronunciation
            </p>
          </div>

          <div className="steps">
            {steps.map((step, i) => (
              <div key={i} className="step" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="step__number">{step.number}</div>
                <div className="step__icon">{step.icon}</div>
                <h3 className="step__title">{step.title}</h3>
                <p className="step__description">{step.description}</p>
                {i < steps.length - 1 && <div className="step__connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">
              Everything You Need to <span className="gradient-text">Master Pronunciation</span>
            </h2>
            <p className="section-subtitle">
              Powered by cutting-edge AI and speech recognition technology
            </p>
          </div>

          <div className="features__grid">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`feature-card feature-card--${feature.color}`}
                style={{ animationDelay: `${i * 0.1}s` }}
                id={`feature-${i}`}
              >
                <div className="feature-card__glow" />
                <div className="feature-card__icon">{feature.icon}</div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-card__bg">
              <div className="cta-card__orb cta-card__orb--1" />
              <div className="cta-card__orb cta-card__orb--2" />
            </div>
            <div className="cta-card__content">
              <h2 className="cta-card__title">
                Ready to Perfect Your Pronunciation?
              </h2>
              <p className="cta-card__subtitle">
                Join thousands of learners improving their speaking skills with AI-powered feedback.
              </p>
              <Link to="/practice" className="cta-card__btn" id="cta-start-btn">
                <Mic size={20} />
                Start Free Practice
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="main-footer">
        <div className="container">
          <div className="footer__content">
            <div className="footer__brand">
              <div className="navbar__logo-icon" style={{ width: 36, height: 36 }}>
                <Mic size={18} />
              </div>
              <span className="navbar__logo-text" style={{ fontSize: '1.2rem' }}>
                Accent<span className="gradient-text">rix</span>
              </span>
            </div>
            <p className="footer__text">
              © 2026 Accentrix. AI-powered pronunciation coaching for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
