import React from 'react';
import { useAuth } from '../../context/AuthContext';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import CompanyAdminDashboard from './CompanyAdminDashboard/CompanyAdminDashboard';
import ManagerDashboard from './ManagerDashboard/ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard/EmployeeDashboard';

export default function RoleBasedDashboardRouter() {
  const { role, user } = useAuth();

  // Route to the appropriate sub-dashboard based on authenticated role
  const renderDashboardByRole = () => {
    switch (role) {
      case 'company_admin':
        return <CompanyAdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'employee':
      default:
        return <EmployeeDashboard />;
    }
  };

  const getPageHeaderInfo = () => {
    switch (role) {
      case 'company_admin':
        return {
          title: 'Organization Command Overview',
          subtitle: `Platform Administration & Governance • ${user?.companyName || 'Company'}`
        };
      case 'manager':
        return {
          title: 'Team Operations Command',
          subtitle: `Supervision, Quota Execution & Team Performance • ${user?.companyName || 'Company'}`
        };
      case 'employee':
      default:
        return {
          title: 'My Daily Workbench',
          subtitle: `Assigned Accounts, Execution Pipeline & Tasks • ${user?.companyName || 'Company'}`
        };
    }
  };

  const headerInfo = getPageHeaderInfo();

  return (
    <CompanyLayout
      pageTitle={headerInfo.title}
      pageSubtitle={headerInfo.subtitle}
    >
      {renderDashboardByRole()}
    </CompanyLayout>
  );
}
