import React from 'react';

export default function AnnouncementBanner({ isVisible, onClose }) {
  if (!isVisible) return null;

  return (
    <div className="top-banner" id="announcementBanner">
      <div className="banner-inner">
        <p className="banner-text">
          Explore Multi-Tenant CRM: Secure isolated workspaces for growing organizations.
        </p>
        <div className="banner-actions">
          <a href="#features" className="banner-btn">Explore CRM</a>
          <button
            type="button"
            className="banner-close"
            id="bannerCloseBtn"
            aria-label="Close notification"
            onClick={onClose}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
