import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export default function SuperAdminSidebar({ mobileOpen, onCloseMobile }) {
  const { logout } = useAuth();
  const { generalSettings, companies, stats } = useSuperAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const navLinks = [
    {
      to: '/super-admin',
      label: 'Dashboard',
      end: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    },
    {
      to: '/super-admin/companies',
      label: 'Companies',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21h18"></path>
          <path d="M5 21V7l8-4v18"></path>
          <path d="M19 21V11l-6-3"></path>
          <path d="M9 9h1"></path>
          <path d="M9 13h1"></path>
          <path d="M9 17h1"></path>
        </svg>
      )
    },
    {
      to: '/super-admin/subscriptions',
      label: 'Subscriptions',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      )
    },
    {
      to: '/super-admin/settings',
      label: 'Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="sa-mobile-backdrop" onClick={onCloseMobile} aria-hidden="true" />
      )}

      <aside className={`sa-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sa-sidebar-header">
          <Link to="/super-admin" className="logo sa-logo" onClick={onCloseMobile} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {generalSettings?.logoUrl ? (
              <img
                src={generalSettings.logoUrl}
                alt={generalSettings.platformName || 'Platform Logo'}
                style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }}
              />
            ) : null}
            <span>
              <span className="logo-accent">
                {generalSettings?.platformName ? generalSettings.platformName.toLowerCase() : 'nexora'}
              </span>
              <span className="logo-dot">.</span>
            </span>
          </Link>
          <div className="sa-sidebar-badge font-mono">
            <span className="sa-badge-crown">★</span>
            <span>SUPER ADMIN</span>
          </div>
          <button
            type="button"
            className="sa-close-mobile-btn"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="sa-sidebar-nav">
          <div className="sa-nav-label font-mono">PLATFORM CONTROL</div>
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sa-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <span className="sa-nav-icon">{item.icon}</span>
              <span className="sa-nav-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="sa-sidebar-footer">
          <div className="sa-tenant-cluster-card">
            <div className="sa-cluster-status">
              <span className="status-indicator-dot"></span>
              <span className="font-mono">GLOBAL CLUSTER</span>
            </div>
            <div className="sa-cluster-info font-mono">
              {stats?.activeCompanies?.value ? `${stats.activeCompanies.value} Active Tenants` : `${companies.length} ${companies.length === 1 ? 'Tenant Workspace' : 'Tenant Workspaces'}`}
            </div>
          </div>

          <div className="sa-footer-links">
            <a
              href="#help"
              className="sa-footer-link"
              onClick={(e) => {
                e.preventDefault();
                alert('Nexora Super Admin Documentation & Operations Desk.\nSupport: ops@nexoracrm.com');
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Help & Support</span>
            </a>

            <button
              type="button"
              className="sa-footer-link sa-logout-link"
              onClick={handleLogout}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
