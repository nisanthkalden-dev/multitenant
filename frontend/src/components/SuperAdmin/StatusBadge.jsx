import React from 'react';

export default function StatusBadge({ status }) {
  const norm = (status || '').toLowerCase();
  let badgeClass = 'sa-badge-active';

  if (norm === 'trial') {
    badgeClass = 'sa-badge-trial';
  } else if (norm === 'suspended') {
    badgeClass = 'sa-badge-suspended';
  } else if (norm === 'inactive' || norm === 'cancelled') {
    badgeClass = 'sa-badge-inactive';
  }

  return (
    <span className={`sa-status-badge ${badgeClass} font-mono`}>
      <span className="sa-badge-dot"></span>
      {status}
    </span>
  );
}
