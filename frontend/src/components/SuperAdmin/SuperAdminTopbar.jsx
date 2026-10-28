import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

export default function SuperAdminTopbar({ title, breadcrumb = [], onOpenMobile }) {
  const { logout } = useAuth();
  const { profileSettings } = useSuperAdmin();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'New registration', desc: 'Pulse Media Labs registered', time: '40m ago' },
    { id: 2, title: 'License threshold', desc: 'Skyline Studio reached max seats', time: '2h ago' },
    { id: 3, title: 'Compliance check', desc: 'Daily database backup verified', time: '4h ago' }
  ];

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  return (
    <header className="sa-topbar">
      <div className="sa-topbar-left">
        {/* Mobile Hamburger */}
        <button
          type="button"
          className="sa-hamburger-btn"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
        >
          <span className="sa-hamburger-bar"></span>
          <span className="sa-hamburger-bar"></span>
          <span className="sa-hamburger-bar"></span>
        </button>

        <div className="sa-page-titles">
          <div className="sa-breadcrumbs font-mono">
            <span>Super Admin</span>
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className="crumb-separator">/</span>
                <span>{crumb}</span>
              </React.Fragment>
            ))}
          </div>
          <h1 className="sa-topbar-heading">{title}</h1>
        </div>
      </div>

      <div className="sa-topbar-right">
        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Quick Add Company Button */}
        <Link to="/super-admin/companies/add" className="btn btn-primary btn-sm sa-quick-add-btn font-mono">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Company</span>
        </Link>

        {/* Notifications Icon Button */}
        <div className="sa-dropdown-wrapper">
          <button
            type="button"
            className="sa-icon-btn"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
            }}
            aria-label="Notifications"
            title="Notifications"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="sa-notif-ping"></span>
          </button>

          {notifOpen && (
            <div className="sa-dropdown-menu sa-notif-menu">
              <div className="sa-menu-header">
                <span className="sa-menu-title">Notifications</span>
                <span className="sa-menu-badge font-mono">3 New</span>
              </div>
              <div className="sa-notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className="sa-notif-item">
                    <div className="sa-notif-dot"></div>
                    <div className="sa-notif-content">
                      <div className="sa-notif-title">{n.title}</div>
                      <div className="sa-notif-desc">{n.desc}</div>
                      <div className="sa-notif-time font-mono">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="sa-dropdown-wrapper">
          <button
            type="button"
            className="sa-profile-btn"
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
            }}
            aria-label="Super Admin Profile Menu"
          >
            <div className="sa-topbar-avatar font-mono">
              {profileSettings.avatarUrl ? (
                <img
                  src={profileSettings.avatarUrl}
                  alt={profileSettings.fullName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                profileSettings.fullName
                  ? profileSettings.fullName
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'SA'
                  : 'SA'
              )}
            </div>
            <div className="sa-profile-meta">
              <span className="sa-user-name">{profileSettings.fullName}</span>
              <span className="sa-user-badge font-mono">Master Root</span>
            </div>
            <svg
              className={`sa-caret ${dropdownOpen ? 'open' : ''}`}
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

          {dropdownOpen && (
            <div className="sa-dropdown-menu sa-profile-menu">
              <div className="sa-menu-header">
                <div className="sa-user-name">{profileSettings.fullName}</div>
                <div className="sa-user-email font-mono">{profileSettings.email}</div>
              </div>
              <div className="sa-menu-divider"></div>
              <Link
                to="/super-admin/settings"
                className="sa-menu-item"
                onClick={() => setDropdownOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span>Admin Settings</span>
              </Link>
              <Link
                to="/dashboard"
                className="sa-menu-item"
                onClick={() => setDropdownOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                <span>Switch to Company CRM</span>
              </Link>
              <div className="sa-menu-divider"></div>
              <button
                type="button"
                className="sa-menu-item sa-menu-logout"
                onClick={handleLogout}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
