import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({
  theme,
  toggleTheme,
  menuOpen,
  setMenuOpen,
  scrolled,
  activeSection,
  onLoginClick
}) {
  const navItems = [
    { label: 'Home', href: '/#home', id: 'home' },
    { label: 'Features', href: '/#features', id: 'features' },
    { label: 'Security', href: '/#security', id: 'security' },
    { label: 'Pricing', href: '/#pricing', id: 'pricing' }
  ];

  const handleNavLinkClick = () => {
    setMenuOpen(false);
  };

  const isLight = theme === 'light';

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-wrapper">
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="logo" aria-label="Nexora CRM Home">
            <span className="logo-accent">nexora</span>crm<span className="logo-dot">.</span>
            <span className="logo-badge">saas</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={`nav-menu ${menuOpen ? 'open' : ''}`} id="navMenu" aria-label="Primary">
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                    onClick={handleNavLinkClick}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="nav-mobile-actions">
              <button
                type="button"
                className="btn btn-secondary theme-toggle-btn-mobile"
                id="themeToggleBtnMobile"
                aria-label="Toggle theme"
                onClick={toggleTheme}
              >
                <svg className="theme-icon sun-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <svg className="theme-icon moon-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span className="mobile-theme-label">
                  {isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                </span>
              </button>
              <Link to="/login" className="btn btn-secondary nav-login-btn" onClick={handleNavLinkClick}>
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary nav-cta-btn" onClick={handleNavLinkClick}>
                Get Started
              </Link>
            </div>
          </nav>

          {/* Right Side Nav Actions */}
          <div className="header-actions">
            {/* Theme Toggle */}
            <button
              type="button"
              className="theme-toggle-btn"
              id="themeToggleBtn"
              aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              onClick={toggleTheme}
            >
              <svg className="theme-icon sun-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <svg className="theme-icon moon-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>

            <Link to="/login" className="btn btn-secondary nav-login-btn">
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary nav-cta-btn">
              Get Started
            </Link>

            <button
              type="button"
              className={`hamburger ${menuOpen ? 'is-active' : ''}`}
              id="hamburgerBtn"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              aria-controls="navMenu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
        </div>
      </div>
      <div
        className="nav-backdrop"
        id="navBackdrop"
        aria-hidden="true"
        style={{ display: menuOpen ? 'block' : 'none' }}
        onClick={() => setMenuOpen(false)}
      ></div>
    </header>
  );
}
