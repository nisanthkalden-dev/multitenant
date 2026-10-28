import React from 'react';

const metricItems = [
  { number: 'Unlimited', label: 'WORKSPACES' },
  { number: 'Role-Based', label: 'PERMISSIONS' },
  { number: 'Real-Time', label: 'ACTIVITY' },
  { number: 'Secure', label: 'TENANT ISOLATION' },
  { number: '10K+', label: 'ACTIVE TEAMS' },
  { number: '1M+', label: 'CUSTOMER RECORDS' }
];

export default function TrustMetrics() {
  return (
    <section className="metrics-strip-section" aria-label="Key Product & Multi-Tenancy Capabilities">
      <div className="metrics-marquee-track">
        {/* First group */}
        <div className="metrics-marquee-group">
          {metricItems.map((item, index) => (
            <React.Fragment key={`metric-1-${index}`}>
              <div className="metric-strip-item">
                <span className="strip-number font-mono">{item.number}</span>
                <span className="strip-label">{item.label}</span>
              </div>
              <div className="strip-divider" aria-hidden="true"></div>
            </React.Fragment>
          ))}
        </div>

        {/* Duplicated Group for Infinite Seamless Loop */}
        <div className="metrics-marquee-group" aria-hidden="true">
          {metricItems.map((item, index) => (
            <React.Fragment key={`metric-2-${index}`}>
              <div className="metric-strip-item">
                <span className="strip-number font-mono">{item.number}</span>
                <span className="strip-label">{item.label}</span>
              </div>
              <div className="strip-divider" aria-hidden="true"></div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
