import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { MOCK_CUSTOMERS, MOCK_LEADS, MOCK_TASKS, MOCK_ACTIVITIES } from '../../../data/mockTenantData';
import { MOCK_USERS } from '../../../data/mockUsers';

export default function ManagerDashboard() {
  const { user, companyId } = useAuth();
  const [taskFilter, setTaskFilter] = useState('All');

  // Filter tenant records
  const teamMembers = MOCK_USERS.filter(
    (u) => u.companyId === companyId && u.role === 'employee'
  );
  const tenantCustomers = MOCK_CUSTOMERS.filter((c) => c.companyId === companyId);
  const tenantLeads = MOCK_LEADS.filter((l) => l.companyId === companyId);
  const tenantTasks = MOCK_TASKS.filter((t) => t.companyId === companyId);
  const teamActivities = MOCK_ACTIVITIES.filter((a) => a.companyId === companyId);

  const pendingTasks = tenantTasks.filter((t) => t.status === 'Pending');
  const completedTasks = tenantTasks.filter((t) => t.status === 'Completed');

  const filteredTasks =
    taskFilter === 'All'
      ? tenantTasks
      : tenantTasks.filter((t) => t.status === taskFilter);

  return (
    <div className="role-dashboard-container manager-dashboard">
      {/* Manager Welcome Banner */}
      <div className="crm-banner-card manager-banner">
        <div className="banner-content">
          <div className="banner-badge font-mono">
            <span>TEAM MANAGEMENT COMMAND</span>
          </div>
          <h2 className="banner-title">Manager Workspace: {user?.name || 'Manager'}</h2>
          <p className="banner-subtitle">
            Lead coordination and performance tracking for <strong>{user?.companyName}</strong>. Monitor team activities, pipeline momentum, and task allocations.
          </p>
        </div>
        <div className="banner-actions">
          <Link to="/company/tasks" className="btn btn-primary font-mono btn-sm">
            + Assign Task
          </Link>
          <Link to="/company/team" className="btn btn-secondary font-mono btn-sm">
            View Team ({teamMembers.length})
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">My Team</span>
            <div className="stat-icon-wrap" style={{ color: 'var(--tertiary)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{teamMembers.length} Active Staff</div>
          <div className="stat-footer font-mono positive">
            <span>100% attendance & availability</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Team Performance</span>
            <div className="stat-icon-wrap" style={{ color: '#10b981' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">92.4% SLA</div>
          <div className="stat-footer font-mono positive">
            <span>+4.2% higher vs last cycle</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Active Team Leads</span>
            <div className="stat-icon-wrap" style={{ color: '#38bdf8' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{tenantLeads.length}</div>
          <div className="stat-footer font-mono positive">
            <span>Assigned across sales personnel</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Pending Tasks</span>
            <div className="stat-icon-wrap" style={{ color: '#f59e0b' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{pendingTasks.length} Due</div>
          <div className="stat-footer font-mono neutral">
            <span>{completedTasks.length} tasks marked complete</span>
          </div>
        </div>
      </div>

      {/* Team Roster & Tasks Allocation Section */}
      <div className="crm-panels-split-2">
        {/* Left: Team Members & Performance Status */}
        <div className="crm-column-group">
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Supervised Staff & Team Roster</h3>
                <p className="panel-card-subtitle">Staff reporting to {user?.name}</p>
              </div>
              <Link to="/company/team" className="btn btn-secondary btn-xs font-mono">
                Manage Team
              </Link>
            </div>

            <div className="team-roster-list">
              {teamMembers.map((member) => {
                const assignedLeadsCount = tenantLeads.filter(
                  (l) => l.assignedTo === member.userId
                ).length;
                const assignedTasksCount = tenantTasks.filter(
                  (t) => t.assignedTo === member.userId && t.status === 'Pending'
                ).length;

                return (
                  <div key={member.userId} className="team-member-row">
                    <div className="member-avatar font-mono">{member.avatar}</div>
                    <div className="member-meta">
                      <div className="member-name font-semibold">{member.name}</div>
                      <div className="member-email font-mono text-muted text-xs">
                        {member.email} &bull; {member.department}
                      </div>
                    </div>
                    <div className="member-stats font-mono">
                      <span className="pill-metric">{assignedLeadsCount} Leads</span>
                      <span className="pill-metric">{assignedTasksCount} Pending Tasks</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Assigned Customers */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Supervised Customer Accounts</h3>
                <p className="panel-card-subtitle">Accounts managed by your direct reports</p>
              </div>
              <Link to="/company/customers" className="btn btn-secondary btn-xs font-mono">
                Directory
              </Link>
            </div>

            <div className="crm-table-container">
              <table className="crm-data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Tier</th>
                    <th>Value</th>
                    <th>Assigned Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantCustomers.map((cust) => (
                    <tr key={cust.id}>
                      <td className="font-semibold">{cust.name}</td>
                      <td>
                        <span className="tier-tag font-mono text-xs">{cust.tier}</span>
                      </td>
                      <td className="font-mono">{cust.value}</td>
                      <td className="font-mono text-xs text-muted">{cust.assignedTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Team Tasks & Real-Time Activities */}
        <div className="crm-column-group">
          {/* Team Tasks Filterable Box */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Team Task Allocations</h3>
                <p className="panel-card-subtitle">Work items delegated across personnel</p>
              </div>
              <div className="sa-pill-selector">
                <button
                  type="button"
                  className={taskFilter === 'All' ? 'active font-mono' : 'font-mono'}
                  onClick={() => setTaskFilter('All')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={taskFilter === 'Pending' ? 'active font-mono' : 'font-mono'}
                  onClick={() => setTaskFilter('Pending')}
                >
                  Pending
                </button>
                <button
                  type="button"
                  className={taskFilter === 'Completed' ? 'active font-mono' : 'font-mono'}
                  onClick={() => setTaskFilter('Completed')}
                >
                  Completed
                </button>
              </div>
            </div>

            <div className="tasks-flow-list">
              {filteredTasks.map((task) => (
                <div key={task.id} className="task-row-card">
                  <div className="task-top">
                    <span
                      className={`task-status-badge font-mono ${
                        task.status === 'Completed' ? 'task-done' : 'task-pending'
                      }`}
                    >
                      {task.status}
                    </span>
                    <span className="task-due font-mono text-xs">{task.dueDate}</span>
                  </div>
                  <div className="task-title font-medium">{task.title}</div>
                  <div className="task-footer font-mono text-xs text-muted">
                    <span>Assigned to: <strong>{task.assignedTo}</strong></span>
                    <span>&bull;</span>
                    <span>Context: {task.relatedTo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Live Audit Activity */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Recent Team Activities</h3>
                <p className="panel-card-subtitle">Live events logged by supervised staff</p>
              </div>
            </div>

            <div className="crm-activity-feed">
              {teamActivities.map((act) => (
                <div key={act.id} className="activity-row">
                  <div className="act-bullet manager-bullet"></div>
                  <div className="act-body">
                    <div className="act-action">
                      <strong>{act.userName}</strong>: {act.action}
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
