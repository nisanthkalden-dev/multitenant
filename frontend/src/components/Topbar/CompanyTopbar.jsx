import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { ROLE_LABELS } from '../../data/mockUsers';

export default function CompanyTopbar({ onToggleMobile }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleDisplayName = ROLE_LABELS[role] || 'Member';

  // Role Badge Class
  const roleBadgeClass =
    role === 'company_admin'
      ? 'badge-role-admin'
      : role === 'manager'
      ? 'badge-role-manager'
      : 'badge-role-employee';

  return (
    <header className="app-topbar">
      <div className="app-topbar-inner">
        {/* Left: Mobile trigger, Brand & Workspace */}
        <div className="app-topbar-left">
          <button
            type="button"
            className="mobile-menu-trigger"
            onClick={onToggleMobile}
            aria-label="Toggle navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <Link to="/company/dashboard" className="logo app-logo" aria-label="Nexora CRM">
            <span className="logo-accent">nexora</span>crm<span className="logo-dot">.</span>
          </Link>

          <div className="workspace-indicator-pill font-mono">
            <span className="status-indicator-dot"></span>
            <span className="ws-name">{user?.companyName || 'Acme Corp'}</span>
            <span className="ws-sep">&bull;</span>
            <span className="ws-domain">{user?.workspace || 'acme.nexora.app'}</span>
          </div>
        </div>

        {/* Right: Theme Toggle & Role-Aware User Dropdown */}
        <div className="app-topbar-right">
          <ThemeToggle />

          <div className="user-profile-menu-container" ref={dropdownRef}>
            <button
              type="button"
              className="user-profile-trigger-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="user-avatar font-mono">
                {user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'US')}
              </div>

              <div className="user-info">
                <span className="user-name">{user?.name || user?.fullName || 'User'}</span>
                <span className={`user-role font-mono ${roleBadgeClass}`}>
                  {roleDisplayName}
                </span>
              </div>

              <svg
                className={`dropdown-chevron ${dropdownOpen ? 'open' : ''}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <div className="user-dropdown-menu" role="menu">
                <div className="dropdown-user-header">
                  <div className="hdr-name">{user?.name || user?.fullName}</div>
                  <div className="hdr-email font-mono">{user?.email}</div>
                  <div className="hdr-meta font-mono">
                    <span className="hdr-badge">{roleDisplayName}</span>
                    <span className="hdr-dept">{user?.department || 'Operations'}</span>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <Link
                  to="/company/settings"
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>My Profile</span>
                </Link>

                {role === 'company_admin' && (
                  <Link
                    to="/company/subscription"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    <span>Company Subscription</span>
                  </Link>
                )}

                <Link
                  to="/company/settings"
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  <span>Account Settings</span>
                </Link>

                <div className="dropdown-divider"></div>

                <button
                  type="button"
                  className="dropdown-item dropdown-logout-btn"
                  onClick={handleLogout}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
