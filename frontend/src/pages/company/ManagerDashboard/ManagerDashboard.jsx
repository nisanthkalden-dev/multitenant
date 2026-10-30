import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { dashboardApi } from '../../../api/dashboardApi';
import { taskApi } from '../../../api/taskApi';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskFilter, setTaskFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboard() {
      try {
        setLoading(true);
        const data = await dashboardApi.getManagerDashboard();
        if (isMounted) setDashboardData(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load manager dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDashboard();
    return () => { isMounted = false; };
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      await taskApi.toggleTaskStatus(taskId);
      const updated = await dashboardApi.getManagerDashboard();
      setDashboardData(updated);
    } catch (err) {
      alert(err.message || 'Failed to update task');
    }
  };

  const metrics = dashboardData?.metrics || {
    totalEmployees: 0,
    totalCustomers: 0,
    activeLeads: 0,
    pendingTasks: 0,
    monthlyRevenue: '₹0',
    conversionRate: '0%'
  };

  const recentTasks = dashboardData?.recentTasks || [];
  const recentLeads = dashboardData?.recentLeads || [];
  const recentActivities = dashboardData?.recentActivities || [];

  const filteredTasks =
    taskFilter === 'All'
      ? recentTasks
      : recentTasks.filter((t) => t.status === taskFilter);

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
            Lead coordination and performance tracking for <strong>{dashboardData?.companyName || user?.companyName}</strong>. Monitor team activities, pipeline momentum, and task allocations.
          </p>
        </div>
        <div className="banner-actions">
          <Link to="/company/tasks" className="btn btn-primary font-mono btn-sm">
            + Assign Task
          </Link>
          <Link to="/company/team" className="btn btn-secondary font-mono btn-sm">
            View Team ({metrics.totalEmployees})
          </Link>
        </div>
      </div>

      {loading && (
        <div className="font-mono text-center text-muted p-4">Loading real-time manager metrics...</div>
      )}

      {error && (
        <div className="auth-alert alert-error font-mono mb-4">
          <span>{error}</span>
        </div>
      )}

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
          <div className="stat-number font-mono">{metrics.totalEmployees} Active Staff</div>
          <div className="stat-footer font-mono positive">
            <span>Team members monitored</span>
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
          <div className="stat-number font-mono">{metrics.conversionRate} Win Rate</div>
          <div className="stat-footer font-mono positive">
            <span>Pipeline closed opportunities</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Team Deals</span>
            <div className="stat-icon-wrap" style={{ color: '#38bdf8' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{metrics.activeLeads} In-Flight</div>
          <div className="stat-footer font-mono positive">
            <span>{metrics.monthlyRevenue} Total Target</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Tasks Pending</span>
            <div className="stat-icon-wrap" style={{ color: '#f59e0b' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{metrics.pendingTasks} Action Items</div>
          <div className="stat-footer font-mono neutral">
            <span>Requires team coordination</span>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="crm-two-columns mt-6">
        {/* Left Column: Team Tasks & Pipeline */}
        <div className="crm-column-group">
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Team Operational Tasks</h3>
                <p className="panel-card-subtitle">Assigned follow-ups and client action items</p>
              </div>
              <div className="panel-filter-btns">
                <button
                  type="button"
                  className={`filter-btn ${taskFilter === 'All' ? 'active' : ''}`}
                  onClick={() => setTaskFilter('All')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`filter-btn ${taskFilter === 'Pending' ? 'active' : ''}`}
                  onClick={() => setTaskFilter('Pending')}
                >
                  Pending
                </button>
                <button
                  type="button"
                  className={`filter-btn ${taskFilter === 'Completed' ? 'active' : ''}`}
                  onClick={() => setTaskFilter('Completed')}
                >
                  Done
                </button>
              </div>
            </div>

            <div className="crm-tasks-list">
              {filteredTasks.length === 0 ? (
                <div className="text-center text-muted p-4 font-mono">No tasks found matching filter.</div>
              ) : (
                filteredTasks.map((t) => (
                  <div key={t.id} className="task-item-card">
                    <button
                      type="button"
                      className={`check-box-btn ${t.status === 'Completed' ? 'checked' : ''}`}
                      onClick={() => handleToggleTask(t.id)}
                    >
                      {t.status === 'Completed' && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <div className="task-content">
                      <div className={`task-title ${t.status === 'Completed' ? 'line-through text-muted' : ''}`}>
                        {t.title}
                      </div>
                      <div className="task-meta font-mono text-xs">
                        <span className="task-due text-muted">Due: {t.dueDate}</span>
                        <span className={`task-badge badge-${(t.priority || 'medium').toLowerCase()}`}>
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activities & Pipeline Leads */}
        <div className="crm-column-group">
          {/* Active Deals */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Commercial Deals</h3>
                <p className="panel-card-subtitle">Active opportunities across accounts</p>
              </div>
              <Link to="/company/leads" className="btn btn-secondary btn-xs font-mono">
                Pipeline
              </Link>
            </div>

            <div className="crm-lead-cards-list">
              {recentLeads.length === 0 ? (
                <div className="text-center text-muted p-4 font-mono">No active deals found.</div>
              ) : (
                recentLeads.slice(0, 3).map((lead) => (
                  <div key={lead.id} className="crm-lead-item">
                    <div className="lead-item-header">
                      <span className="lead-company font-semibold">{lead.company}</span>
                      <span className="lead-val font-mono">{lead.value || lead.estimatedValue}</span>
                    </div>
                    <div className="lead-item-title text-muted text-sm">{lead.title}</div>
                    <div className="lead-item-footer font-mono">
                      <span className="lead-stage-pill">{lead.stage}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Team Activity Stream</h3>
                <p className="panel-card-subtitle">Recent sales touches and interactions</p>
              </div>
            </div>

            <div className="crm-activity-feed">
              {recentActivities.length === 0 ? (
                <div className="text-center text-muted p-4 font-mono">No recent activity.</div>
              ) : (
                recentActivities.slice(0, 5).map((act) => (
                  <div key={act.id} className="activity-row">
                    <div className="act-bullet"></div>
                    <div className="act-body">
                      <div className="act-action">
                        <strong>{act.userName || 'Member'}</strong>: {act.action}
                      </div>
                      <div className="act-meta font-mono">
                        <span>{act.target || 'Workspace'}</span> &bull; <span>{act.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
