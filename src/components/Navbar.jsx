import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mic, BarChart3, Globe, BookOpen, Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: <Mic size={18} /> },
    { path: '/practice', label: 'Practice', icon: <BookOpen size={18} /> },
    { path: '/progress', label: 'Progress', icon: <BarChart3 size={18} /> },
    { path: '/languages', label: 'Languages', icon: <Globe size={18} /> },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`} id="main-nav">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo" id="nav-logo">
          <div className="navbar__logo-icon">
            <Mic size={22} />
            <div className="navbar__logo-pulse" />
          </div>
          <span className="navbar__logo-text">
            Accent<span className="gradient-text">rix</span>
          </span>
        </Link>

        <div className={`navbar__links ${isMobileOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`navbar__link ${location.pathname === path ? 'navbar__link--active' : ''}`}
              id={`nav-${label.toLowerCase()}`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          ))}
          
          <div className="navbar__auth-section">
            {user ? (
              <div className="navbar__user-menu">
                <span className="navbar__user-name">
                  <User size={18} /> {user.name}
                </span>
                <button onClick={handleLogout} className="navbar__link navbar__logout-btn">
                  <LogOut size={18} /> <span>Log Out</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="navbar__link navbar__login-btn">
                <LogIn size={18} /> <span>Sign In</span>
              </Link>
            )}
            {!user && (
              <Link to="/practice" className="navbar__cta" id="nav-start-btn">
                Start Speaking
              </Link>
            )}
          </div>
        </div>

        <button
          className="navbar__mobile-toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          id="nav-mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
