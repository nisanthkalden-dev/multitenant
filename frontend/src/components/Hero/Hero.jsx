import React, { useState } from 'react';

export default function Hero({ onCopyNotify }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText('acme.nexora.app');
    setCopied(true);
    if (onCopyNotify) {
      onCopyNotify('Workspace domain copied to clipboard!');
    }
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const resourceProgress = [
    { label: 'LEAD CONVERSION RATE', value: '34.8%', width: '35%' },
    { label: 'QUALIFIED PIPELINE', value: '68.2%', width: '68%' },
    { label: 'TARGET QUOTA ACHIEVED', value: '82%', width: '82%' }
  ];

  const velocitySegments = [
    true, true, true, true, true,
    true, true, true, true, true,
    true, true, true, true, true,
    false
  ];

  return (
    <section className="hero-section" id="home">
      <div className="hero-bg-fx" aria-hidden="true">
        <div className="bg-grid-pattern"></div>
        <div className="bg-radial-glow primary-glow"></div>
        <div className="bg-radial-glow secondary-glow"></div>
      </div>

      <div className="container hero-container">
        {/* Hero Content (Left Column) */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-ping"></span>
            <span className="badge-text">ENTERPRISE MULTI-TENANT CRM</span>
          </div>

          <h1 className="hero-title">
            Next-Gen CRM.<br />
            <span className="accent-text">Built for Growing Teams.</span>
          </h1>

          <p className="hero-subtitle">
            Unify your leads, deals, customer relationships, and isolated team workspaces into one secure, intuitive platform.
          </p>

          <div className="hero-actions-wrap">
            <div className="hero-actions">
              <a href="#pricing" className="btn btn-primary btn-lg">Start Free Trial</a>
              <a href="#security" className="btn btn-secondary btn-lg">View Security</a>
            </div>

            {/* CRM Quick-Access Workspace Preview */}
            <div
              className="hero-cli-preview"
              id="cliSnippetBox"
              title="Click to copy quick link"
              onClick={handleCopy}
              style={{ cursor: 'pointer' }}
            >
              <span className="cli-prompt font-mono">workspace:</span>
              <span className="cli-code font-mono">acme.nexora.app</span>
              <button
                type="button"
                className="cli-copy-btn"
                id="cliCopyBtn"
                aria-label="Copy workspace domain"
                title="Copy to clipboard"
                onClick={handleCopy}
              >
                <svg className="copy-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span className={`copy-feedback font-mono ${copied ? 'show' : ''}`}>Copied!</span>
              </button>
            </div>
          </div>

          {/* Trust Line */}
          <div className="hero-trust-line">
            <span className="trust-check-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Isolated Tenant Security
            </span>
            <span className="trust-check-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Role-Based Access
            </span>
            <span className="trust-check-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Real-Time Sync
            </span>
          </div>
        </div>

        {/* Hero Right Column: Actual CRM Dashboard + Actual CRM Notifications */}
        <div className="hero-visual">
          <div className="dashboard-wrapper">
            <div className="dashboard-glow" aria-hidden="true"></div>

            {/* Central CRM Dashboard Panel */}
            <div className="dashboard-panel main-panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <span className="panel-dot red"></span>
                  <span className="panel-dot yellow"></span>
                  <span className="panel-dot green"></span>
                  <span className="panel-title-tag font-mono">CRM PIPELINE DASHBOARD</span>
                </div>
                <div className="panel-header-right">
                  <div className="dashboard-region-picker">
                    <button type="button" className="region-btn active font-mono">LIVE PIPELINE</button>
                  </div>
                </div>
              </div>

              <div className="panel-body">
                {/* Dashboard Metric Header */}
                <div className="dashboard-metric-header">
                  <div className="metric-big-num">
                    <div className="metric-val-wrap">
                      <span className="val font-mono">₹18.4L</span>
                      <span className="status-beacon" title="Pipeline active"></span>
                    </div>
                    <span className="lbl">Monthly Revenue Managed &bull; Acme Technologies</span>
                  </div>
                  <div className="panel-status-pill">
                    <span className="status-indicator-dot"></span>
                    <span>86 DEALS IN MOTION</span>
                  </div>
                </div>

                {/* CRM Resource Progress / Sales Stages */}
                <div className="resource-bars">
                  {resourceProgress.map((item, idx) => (
                    <div className="resource-bar-item" key={idx}>
                      <div className="bar-info">
                        <span className="bar-label font-mono">{item.label}</span>
                        <span className="bar-value font-mono">{item.value}</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: item.width }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submetrics Grid */}
                <div className="dashboard-submetrics">
                  <div className="submetric-box">
                    <span className="submetric-lbl font-mono">ACTIVE CUSTOMERS</span>
                    <span className="submetric-val font-mono">1,284 <span className="rate font-sans">profiles</span></span>
                  </div>
                  <div className="submetric-box">
                    <span className="submetric-lbl font-mono">TEAM VELOCITY</span>
                    <span className="submetric-val font-mono text-tertiary">24 <span className="rate font-sans">members active</span></span>
                  </div>
                </div>

                {/* Performance Visual Block */}
                <div className="performance-visual-block">
                  <div className="perf-header">
                    <span className="perf-title font-mono">Sales Velocity Index</span>
                    <span className="perf-status text-tertiary font-mono">Ahead of Target &bull; 114%</span>
                  </div>
                  <div className="segmented-progress-bar" aria-label="Sales Velocity Indicator">
                    {velocitySegments.map((isActive, idx) => (
                      <span key={idx} className={`segment ${isActive ? 'active' : ''}`}></span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating CRM Notification 1: New Lead Added */}
            <div className="floating-panel float-lead crm-notification-card">
              <div className="floating-icon lead-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
              <div className="floating-content">
                <span className="float-title">New Lead Added</span>
                <span className="float-sub"><strong>Sarah Johnson</strong> &bull; Acme Technologies</span>
              </div>
              <span className="float-pill success">Qualified</span>
            </div>

            {/* Floating CRM Notification 2: Deal Won */}
            <div className="floating-panel float-backup crm-notification-card">
              <div className="floating-icon backup-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
                </svg>
              </div>
              <div className="floating-content">
                <span className="float-title">Deal Won</span>
                <span className="float-sub font-mono text-tertiary"><strong>₹2,40,000</strong> &bull; Closed</span>
              </div>
              <span className="float-pill info">Closed</span>
            </div>

            {/* Floating CRM Notification 3: Task Completed */}
            <div className="floating-panel float-latency crm-notification-card">
              <div className="floating-icon latency-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="floating-content">
                <span className="float-title">Task Completed</span>
                <span className="float-sub">Follow up with Vertex Labs</span>
              </div>
              <span className="float-pill highlight">Done</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
