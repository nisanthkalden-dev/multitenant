import React from 'react';

const securityData = [
  {
    title: 'Tenant-Level Data Isolation',
    description: 'Every customer organization is partitioned into its own logical database boundary. No cross-tenant data leakage is possible.',
    badge: 'Logical Partition • Zero Leakage',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    )
  },
  {
    title: 'Role-Based Access',
    description: 'Customizable role hierarchies with granular permission flags across leads, deals, customer profiles, and analytics reports.',
    badge: 'Granular Scope • Role Hierarchy',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    )
  },
  {
    title: 'Controlled Workspace Access',
    description: 'Admins govern user invitations, workspace domain assignments, session revocation, and permission scopes.',
    badge: 'Domain Governance • Session Control',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    )
  },
  {
    title: 'Activity Tracking & Audit Logs',
    description: 'Time-stamped audit trails for record modifications, stage updates, logins, and export activities across your organization.',
    badge: 'Timestamped Trails • Export Logs',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    )
  },
  {
    title: 'Permission Management',
    description: 'Easily define field-level read/write rules, preventing sales reps from viewing unassigned high-value enterprise accounts.',
    badge: 'Field-Level Rules • Record Shield',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 2l-2 2m-1.414 1.414L3 19v2h2l13.586-13.586m-2.828-2.828l2.828 2.828"></path>
      </svg>
    )
  },
  {
    title: 'Secure Authentication',
    description: 'Multi-factor authentication (MFA), encrypted bearer session tokens, and automated inactive timeout policies.',
    badge: 'MFA Security • Bearer Tokens',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    )
  }
];

export default function Security() {
  return (
    <section className="section security-section" id="security">
      <div className="container">
        <div className="section-intro text-center">
          <div className="section-eyebrow">ENTERPRISE ASSURANCE</div>
          <h2 className="section-heading">Your Data. Your Workspace. Your Control.</h2>
          <p className="section-text">
            Architected from the ground up for complete organization isolation, compliance, and granular administration.
          </p>
        </div>

        <div className="features-asymmetric-grid security-features-grid">
          {securityData.map((item, idx) => (
            <div className="feature-card supporting-card security-card" key={idx}>
              <div className="card-icon-box">
                {item.icon}
              </div>
              <h4 className="card-title">{item.title}</h4>
              <p className="card-desc">{item.description}</p>
              <div className="card-footer-meta">
                <span className="code-badge font-mono">{item.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
