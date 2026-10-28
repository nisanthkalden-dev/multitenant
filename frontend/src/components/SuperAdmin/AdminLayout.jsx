import React, { useState } from 'react';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminTopbar from './SuperAdminTopbar';

export default function AdminLayout({ children, title = 'Dashboard', breadcrumb = ['Dashboard'] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="sa-app-layout">
      {/* Sidebar Navigation */}
      <SuperAdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="sa-main-content">
        <SuperAdminTopbar
          title={title}
          breadcrumb={breadcrumb}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="sa-page-body">
          {children}
        </main>
      </div>
    </div>
  );
}
