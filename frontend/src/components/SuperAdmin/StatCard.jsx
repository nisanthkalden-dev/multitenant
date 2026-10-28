import React from 'react';

export default function StatCard({ title, value, growth, trend = 'positive', icon, subtitle }) {
  return (
    <div className="sa-stat-card">
      <div className="sa-stat-card-header">
        <span className="sa-stat-title">{title}</span>
        {icon && <div className="sa-stat-icon-wrap">{icon}</div>}
      </div>
      <div className="sa-stat-card-body">
        <div className="sa-stat-value font-mono">{value}</div>
        {(growth || subtitle) && (
          <div className={`sa-stat-growth ${trend}`}>
            {trend === 'positive' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            )}
            {trend === 'negative' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
            <span>{growth || subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
}
