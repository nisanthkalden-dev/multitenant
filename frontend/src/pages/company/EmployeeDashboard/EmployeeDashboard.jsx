import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { dashboardApi } from '../../../api/dashboardApi';
import { taskApi } from '../../../api/taskApi';
import { activityApi } from '../../../api/activityApi';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newActivityText, setNewActivityText] = useState('');
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [submittingAct, setSubmittingAct] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getEmployeeDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load employee workbench');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      await taskApi.toggleTaskStatus(taskId);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update task');
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivityText.trim()) return;
    setSubmittingAct(true);

    try {
      await activityApi.createActivity({
        action: newActivityText.trim(),
        target: 'Personal Daily Workbench',
        type: 'task'
      });
      setNewActivityText('');
      setShowAddActivityModal(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to record activity');
    } finally {
      setSubmittingAct(false);
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

  const myTasks = dashboardData?.recentTasks || [];
  const myLeads = dashboardData?.recentLeads || [];
  const myCustomers = dashboardData?.recentCustomers || [];
  const myActivities = dashboardData?.recentActivities || [];

  const pendingTasks = myTasks.filter((t) => t.status === 'Pending');
  const completedTasks = myTasks.filter((t) => t.status === 'Completed');

  return (
    <div className="role-dashboard-container employee-dashboard">
      {/* Employee Greeting Banner */}
      <div className="crm-banner-card employee-banner">
        <div className="banner-content">
          <div className="banner-badge font-mono">
            <span>MY WORKSPACE DESK</span>
          </div>
          <h2 className="banner-title">Welcome back, {user?.name || 'Staff Member'}</h2>
          <p className="banner-subtitle">
            Personal workbench for <strong>{dashboardData?.companyName || user?.companyName}</strong>. You have <strong>{metrics.pendingTasks} pending tasks</strong> and <strong>{metrics.activeLeads} active leads</strong> requiring client contact today.
          </p>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="btn btn-primary font-mono btn-sm"
            onClick={() => setShowAddActivityModal(true)}
          >
            + Log Activity
          </button>
          <Link to="/company/tasks" className="btn btn-secondary font-mono btn-sm">
            My Tasks ({pendingTasks.length})
          </Link>
        </div>
      </div>

      {loading && (
        <div className="font-mono text-center text-muted p-4">Loading your personal CRM desk...</div>
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
            <span className="stat-title">My Assigned Accounts</span>
            <div className="stat-icon-wrap" style={{ color: 'var(--tertiary)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{metrics.totalCustomers} Accounts</div>
          <div className="stat-footer font-mono positive">
            <span>Direct point of contact</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">My Active Pipeline</span>
            <div className="stat-icon-wrap" style={{ color: '#38bdf8' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{metrics.activeLeads} Opportunities</div>
          <div className="stat-footer font-mono positive">
            <span>{metrics.monthlyRevenue} Deal Value</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Open Action Tasks</span>
            <div className="stat-icon-wrap" style={{ color: '#f59e0b' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{pendingTasks.length} Pending</div>
          <div className="stat-footer font-mono neutral">
            <span>{completedTasks.length} Done this week</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Task Completion</span>
            <div className="stat-icon-wrap" style={{ color: '#10b981' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">
            {myTasks.length > 0 ? Math.round((completedTasks.length / myTasks.length) * 100) : 100}%
          </div>
          <div className="stat-footer font-mono positive">
            <span>Workforce productivity</span>
          </div>
        </div>
      </div>

      {/* Two Columns */}
      <div className="crm-two-columns mt-6">
        {/* Left Column: My Tasks Checklist */}
        <div className="crm-column-group">
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">My Tasks Checklist</h3>
                <p className="panel-card-subtitle">Assigned directly to you</p>
              </div>
              <Link to="/company/tasks" className="btn btn-secondary btn-xs font-mono">
                All Tasks
              </Link>
            </div>

            <div className="tasks-flow-list">
              {myTasks.length === 0 ? (
                <div className="text-center text-muted p-4 font-mono">You have no tasks assigned currently.</div>
              ) : (
                myTasks.map((t) => (
                  <div key={t.id} className={`task-row-card ${t.status === 'Completed' ? 'done-card' : ''}`}>
                    <div className="task-top">
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
                      <span className={`task-status-badge font-mono ${t.status === 'Completed' ? 'status-done' : 'status-open'}`}>
                        {t.status}
                      </span>
                      <span className={`task-priority-tag font-mono priority-${(t.priority || 'medium').toLowerCase()}`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="task-title-text">{t.title}</div>
                    <div className="task-meta-row font-mono text-xs">
                      <span>Due: {t.dueDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Inbound Deals & Personal Log */}
        <div className="crm-column-group">
          {/* Assigned Pipeline */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">My Pipeline Leads</h3>
                <p className="panel-card-subtitle">Inbound prospects under your management</p>
              </div>
              <Link to="/company/leads" className="btn btn-secondary btn-xs font-mono">
                Pipeline
              </Link>
            </div>

            <div className="crm-lead-cards-list">
              {myLeads.length === 0 ? (
                <div className="text-center text-muted p-4 font-mono">No active leads assigned to you.</div>
              ) : (
                myLeads.slice(0, 3).map((lead) => (
                  <div key={lead.id} className="crm-lead-item">
                    <div className="lead-item-header">
                      <span className="lead-company font-semibold">{lead.company}</span>
                      <span className="lead-val font-mono">{lead.value || lead.estimatedValue}</span>
                    </div>
                    <div className="lead-item-title text-muted text-sm">{lead.title}</div>
                    <div className="lead-item-footer font-mono">
                      <span className="lead-stage-pill">{lead.stage}</span>
                      <span className="lead-source">Contact: {lead.contactName || 'Lead Rep'}</span>
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
                <h3 className="panel-card-title">My Recent Activity Log</h3>
                <p className="panel-card-subtitle">Touches and client interactions</p>
              </div>
            </div>

            <div className="crm-activity-feed">
              {myActivities.length === 0 ? (
                <div className="text-center text-muted p-4 font-mono">No recent activity logged.</div>
              ) : (
                myActivities.slice(0, 4).map((act) => (
                  <div key={act.id} className="activity-row">
                    <div className="act-bullet employee-bullet"></div>
                    <div className="act-body">
                      <div className="act-action">{act.action}</div>
                      <div className="act-meta font-mono">
                        <span>Context: {act.target || 'Workspace'}</span> &bull; <span>{act.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      {showAddActivityModal && (
        <div className="sa-modal-backdrop" onClick={() => setShowAddActivityModal(false)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Log Work Activity</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setShowAddActivityModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddActivity}>
              <div className="sa-modal-body">
                <div className="form-group">
                  <label className="form-label">Activity Description</label>
                  <textarea
                    rows={4}
                    className="form-input font-mono"
                    placeholder="e.g. Conducted client qualification discovery session with Director of Sales..."
                    value={newActivityText}
                    onChange={(e) => setNewActivityText(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="sa-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary font-mono btn-sm"
                  disabled={submittingAct}
                  onClick={() => setShowAddActivityModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary font-mono btn-sm" disabled={submittingAct}>
                  {submittingAct ? 'Logging...' : 'Log Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
