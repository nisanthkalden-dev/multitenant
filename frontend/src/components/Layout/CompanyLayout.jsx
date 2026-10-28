import React, { useState } from 'react';
import CompanyTopbar from '../Topbar/CompanyTopbar';
import RoleBasedSidebar from '../Sidebar/RoleBasedSidebar';

export default function CompanyLayout({ children, pageTitle, pageSubtitle, actions = null }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="crm-dashboard-app">
      <CompanyTopbar onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      <div className="app-main-layout">
        <RoleBasedSidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="app-workspace-body" id="main-content">
          {(pageTitle || actions) && (
            <div className="app-page-header">
              <div className="app-page-titles">
                {pageTitle && <h1 className="app-page-title">{pageTitle}</h1>}
                {pageSubtitle && <p className="app-page-subtitle">{pageSubtitle}</p>}
              </div>
              {actions && <div className="app-page-actions">{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
