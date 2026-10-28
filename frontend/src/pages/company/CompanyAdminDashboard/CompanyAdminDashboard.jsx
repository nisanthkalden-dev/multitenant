import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { MOCK_CUSTOMERS, MOCK_LEADS, MOCK_TASKS, MOCK_ACTIVITIES } from '../../../data/mockTenantData';
import { MOCK_USERS } from '../../../data/mockUsers';

export default function CompanyAdminDashboard() {
  const { user, companyId } = useAuth();

  // Multi-tenant isolation: filter data strictly by current companyId
  const tenantEmployees = MOCK_USERS.filter((u) => u.companyId === companyId);
  const tenantCustomers = MOCK_CUSTOMERS.filter((c) => c.companyId === companyId);
  const tenantLeads = MOCK_LEADS.filter((l) => l.companyId === companyId);
  const tenantTasks = MOCK_TASKS.filter((t) => t.companyId === companyId);
  const tenantActivities = MOCK_ACTIVITIES.filter((a) => a.companyId === companyId);

  const activeTasks = tenantTasks.filter((t) => t.status === 'Pending').length;

  return (
    <div className="role-dashboard-container admin-dashboard">
      {/* Top Banner Alert / Welcome */}
      <div className="crm-banner-card admin-banner">
        <div className="banner-content">
          <div className="banner-badge font-mono">
            <span>ADMINISTRATIVE GOVERNANCE</span>
          </div>
          <h2 className="banner-title">Welcome back, {user?.name || 'Administrator'}</h2>
          <p className="banner-subtitle">
            Executive oversight for <strong>{user?.companyName || 'Workspace'}</strong>. You hold full permissions to manage employees, licensing, and company data.
          </p>
        </div>
        <div className="banner-actions">
          <Link to="/company/users" className="btn btn-primary font-mono btn-sm">
            + Add Employee
          </Link>
          <Link to="/company/subscription" className="btn btn-secondary font-mono btn-sm">
            Licensing
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Total Employees</span>
            <div className="stat-icon-wrap" style={{ color: 'var(--tertiary)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{tenantEmployees.length}</div>
          <div className="stat-footer font-mono positive">
            <span>Allocated across 3 departments</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Total Customers</span>
            <div className="stat-icon-wrap" style={{ color: '#10b981' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{tenantCustomers.length}</div>
          <div className="stat-footer font-mono positive">
            <span>+2 onboarded this week</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Total Leads in Pipeline</span>
            <div className="stat-icon-wrap" style={{ color: '#38bdf8' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{tenantLeads.length}</div>
          <div className="stat-footer font-mono positive">
            <span>Est. ₹18.0L pipeline value</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Active Tasks</span>
            <div className="stat-icon-wrap" style={{ color: '#f59e0b' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{activeTasks}</div>
          <div className="stat-footer font-mono neutral">
            <span>{tenantTasks.length - activeTasks} completed</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Business Overview & Subscription Status */}
      <div className="crm-panels-split-2">
        {/* Left Column: Recent Customers & Leads */}
        <div className="crm-column-group">
          {/* Recent Customers Panel */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Recent Accounts & Customers</h3>
                <p className="panel-card-subtitle">Isolated client directory for {user?.companyName}</p>
              </div>
              <Link to="/company/customers" className="btn btn-secondary btn-xs font-mono">
                View All
              </Link>
            </div>

            <div className="crm-table-container">
              <table className="crm-data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Contact Person</th>
                    <th>Status</th>
                    <th>Value</th>
                    <th>Assigned Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantCustomers.slice(0, 4).map((cust) => (
                    <tr key={cust.id}>
                      <td className="font-semibold">{cust.name}</td>
                      <td className="font-mono text-muted">{cust.contactPerson}</td>
                      <td>
                        <span className="status-pill status-active font-mono">{cust.status}</span>
                      </td>
                      <td className="font-mono">{cust.value}</td>
                      <td className="font-mono text-xs">{cust.assignedTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Leads Pipeline */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Recent Pipeline Deals</h3>
                <p className="panel-card-subtitle">Active inbound deals requiring administrative oversight</p>
              </div>
              <Link to="/company/leads" className="btn btn-secondary btn-xs font-mono">
                Pipeline
              </Link>
            </div>

            <div className="crm-lead-cards-list">
              {tenantLeads.slice(0, 3).map((lead) => (
                <div key={lead.id} className="crm-lead-item">
                  <div className="lead-item-header">
                    <span className="lead-company font-semibold">{lead.company}</span>
                    <span className="lead-val font-mono">{lead.estimatedValue}</span>
                  </div>
                  <div className="lead-item-title text-muted text-sm">{lead.title}</div>
                  <div className="lead-item-footer font-mono">
                    <span className="lead-stage-pill">{lead.stage}</span>
                    <span className="lead-source">Source: {lead.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Subscription Status & Recent Company Audit Trail */}
        <div className="crm-column-group">
          {/* Subscription Info Card */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Subscription & Licensing</h3>
                <p className="panel-card-subtitle">Active commercial agreement</p>
              </div>
              <Link to="/company/subscription" className="btn btn-secondary btn-xs font-mono">
                Manage
              </Link>
            </div>

            <div className="company-sub-card">
              <div className="sub-tier-row">
                <span className="sub-plan-badge font-mono">GROWTH TIER</span>
                <span className="sub-status-live font-mono">
                  <span className="dot"></span> ACTIVE
                </span>
              </div>
              <div className="sub-pricing-row">
                <span className="sub-amount font-mono">₹4,999</span>
                <span className="sub-cycle font-mono">/ month</span>
              </div>
              <p className="sub-desc text-muted text-sm">
                Next renewal scheduled for <strong>Nov 24, 2026</strong>. 25-user seat capacity enabled with isolated database clustering.
              </p>
              <div className="sub-seat-bar">
                <div className="seat-meta font-mono">
                  <span>Seat Utilization:</span>
                  <span>{tenantEmployees.length} / 25 Used</span>
                </div>
                <div className="seat-progress-track">
                  <div
                    className="seat-progress-fill"
                    style={{ width: `${(tenantEmployees.length / 25) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Activity Stream */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Recent Company Activities</h3>
                <p className="panel-card-subtitle">Real-time audit stream across all staff</p>
              </div>
            </div>

            <div className="crm-activity-feed">
              {tenantActivities.map((act) => (
                <div key={act.id} className="activity-row">
                  <div className="act-bullet"></div>
                  <div className="act-body">
                    <div className="act-action">
                      <strong>{act.userName}</strong> ({act.userRole}): {act.action}
                    </div>
                    <div className="act-meta font-mono">
                      <span>{act.target}</span> &bull; <span>{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
