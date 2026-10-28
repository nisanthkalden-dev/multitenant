import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pipeline');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pipelineStages = [
    {
      title: 'Prospecting',
      count: 14,
      total: '₹3,40,000',
      deals: [
        { name: 'Apex Logistics', contact: 'Rohan Sharma', value: '₹1,20,000', tag: 'High Intent' },
        { name: 'Skyline Studio', contact: 'Ananya Roy', value: '₹2,20,000', tag: 'Referral' }
      ]
    },
    {
      title: 'Qualified',
      count: 9,
      total: '₹6,80,000',
      deals: [
        { name: 'Zenith Labs', contact: 'Marcus Chen', value: '₹4,50,000', tag: 'Demo Done' },
        { name: 'Aura Fintech', contact: 'Pooja Nair', value: '₹2,30,000', tag: 'In Review' }
      ]
    },
    {
      title: 'Proposal Sent',
      count: 6,
      total: '₹5,10,000',
      deals: [
        { name: 'Pulse Media', contact: 'David Lee', value: '₹3,10,000', tag: 'Negotiation' },
        { name: 'Vortex Global', contact: 'Elena Rostova', value: '₹2,00,000', tag: 'Legal Review' }
      ]
    },
    {
      title: 'Closed Won',
      count: 8,
      total: '₹3,10,000',
      deals: [
        { name: 'Acme Technologies', contact: 'Sarah Johnson', value: '₹2,40,000', tag: 'Onboarding' },
        { name: 'BluePeak Corp', contact: 'Karan Mehra', value: '₹70,000', tag: 'Active' }
      ]
    }
  ];

  return (
    <div className="crm-dashboard-app">
      {/* Top Application Bar */}
      <header className="app-topbar">
        <div className="app-topbar-inner">
          <div className="app-topbar-left">
            <Link to="/" className="logo app-logo" aria-label="Nexora CRM">
              <span className="logo-accent">nexora</span>crm<span className="logo-dot">.</span>
            </Link>
            <div className="workspace-indicator-pill font-mono">
              <span className="status-indicator-dot"></span>
              <span>{user?.workspace || 'acme.nexora.app'}</span>
            </div>
          </div>

          <div className="app-topbar-right">
            <ThemeToggle />

            <div className="user-profile-summary">
              <div className="user-avatar font-mono">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.fullName || 'User'}</span>
                <span className="user-role font-mono">{user?.role || 'Admin'}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm logout-btn font-mono"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="app-main-layout">
        {/* Sidebar Navigation */}
        <aside className="app-sidebar">
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'pipeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('pipeline')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
              </svg>
              <span>Pipeline & Deals</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
              onClick={() => setActiveTab('contacts')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Contacts (1,284)</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'activities' ? 'active' : ''}`}
              onClick={() => setActiveTab('activities')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Tasks & Reminders</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <span>Revenue Reports</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-tenant-badge">
              <span className="badge-ping"></span>
              <span className="tenant-status font-mono">ISOLATED TENANT DB</span>
            </div>
          </div>
        </aside>

        {/* Dashboard Content */}
        <main className="app-workspace-body">
          {/* Metrics summary cards */}
          <div className="dashboard-metric-header">
            <div className="metric-big-num">
              <div className="metric-val-wrap">
                <span className="val font-mono">₹18,40,000</span>
                <span className="status-beacon" title="Pipeline active"></span>
              </div>
              <span className="lbl">Total Active Pipeline Revenue &bull; Acme Workspace</span>
            </div>
            <div className="panel-status-pill">
              <span className="status-indicator-dot"></span>
              <span>86 DEALS IN MOTION</span>
            </div>
          </div>

          {/* Kanban Pipeline Board */}
          <div className="kanban-board">
            {pipelineStages.map((stage, idx) => (
              <div className="kanban-column" key={idx}>
                <div className="kanban-col-header">
                  <div className="kanban-col-title-wrap">
                    <span className="kanban-col-title">{stage.title}</span>
                    <span className="kanban-badge font-mono">{stage.count}</span>
                  </div>
                  <span className="kanban-col-total font-mono">{stage.total}</span>
                </div>

                <div className="kanban-cards-list">
                  {stage.deals.map((deal, dIdx) => (
                    <div className="kanban-card" key={dIdx}>
                      <div className="kanban-card-top">
                        <span className="deal-name">{deal.name}</span>
                        <span className="deal-value font-mono">{deal.value}</span>
                      </div>
                      <div className="kanban-card-bottom">
                        <span className="deal-contact">{deal.contact}</span>
                        <span className="deal-tag font-mono">{deal.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
