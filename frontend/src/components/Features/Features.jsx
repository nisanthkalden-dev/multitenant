import React from 'react';

const featuresData = [
  {
    title: 'Lead Management',
    description: 'Capture, qualify and organize leads without losing opportunities. Segment by source, intent, and deal readiness automatically.',
    badge: 'Smart Intake • Auto-Scoring',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <line x1="20" y1="8" x2="20" y2="14"></line>
        <line x1="23" y1="11" x2="17" y2="11"></line>
      </svg>
    )
  },
  {
    title: 'Contact Management',
    description: 'Keep customer information, conversations and activity history organized. Access full context before every interaction.',
    badge: '360° Profiles • Interaction Logs',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    title: 'Sales Pipeline',
    description: 'Track every deal from first contact to close. Spot bottlenecks, forecast revenue, and drag-and-drop deals across stages.',
    badge: 'Visual Kanban • Stage Analytics',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="3" x2="9" y2="21"></line>
        <line x1="15" y1="3" x2="15" y2="21"></line>
      </svg>
    )
  },
  {
    title: 'Tasks & Activities',
    description: 'Give your team clear next steps and never lose track of follow-ups. Schedule calls, meeting reminders, and auto-assign tasks.',
    badge: 'Automated Follow-ups • Reminders',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    )
  },
  {
    title: 'Team Collaboration',
    description: 'Keep sales and customer-facing teams aligned around the same information. Share internal deal notes and handoffs instantly.',
    badge: 'Real-time Feed • Mention Colleagues',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
    )
  },
  {
    title: 'Reports & Analytics',
    description: 'Understand pipeline performance, sales activity and business growth. Generate rep productivity and revenue forecasts in clicks.',
    badge: 'Custom Dashboards • Export Reports',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    )
  }
];

export default function Features() {
  return (
    <section className="section features-section" id="features">
      <div className="container">
        <div className="section-intro text-center">
          <div className="section-eyebrow">CRM CAPABILITIES</div>
          <h2 className="section-heading">Everything Your Team Needs to Manage Customers</h2>
          <p className="section-text">
            Bring your sales, customer relationships and daily workflows into one place.
          </p>
        </div>

        {/* 6 Dedicated CRM Feature Areas */}
        <div className="features-asymmetric-grid">
          {featuresData.map((feature, idx) => (
            <div className="feature-card supporting-card" key={idx}>
              <div className="card-icon-box">
                {feature.icon}
              </div>
              <h4 className="card-title">{feature.title}</h4>
              <p className="card-desc">{feature.description}</p>
              <div className="card-footer-meta">
                <span className="code-badge font-mono">{feature.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
