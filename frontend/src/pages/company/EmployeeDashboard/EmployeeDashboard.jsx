import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { MOCK_CUSTOMERS, MOCK_LEADS, MOCK_TASKS, MOCK_ACTIVITIES } from '../../../data/mockTenantData';

export default function EmployeeDashboard() {
  const { user, companyId } = useAuth();
  const currentUserId = user?.userId;

  // STRICT EMPLOYEE ROLE ISOLATION:
  // Only accounts & tasks assigned specifically to this individual employee!
  const myCustomers = MOCK_CUSTOMERS.filter(
    (c) => c.companyId === companyId && c.assignedTo === currentUserId
  );

  const myLeads = MOCK_LEADS.filter(
    (l) => l.companyId === companyId && l.assignedTo === currentUserId
  );

  const [tasksState, setTasksState] = useState(() =>
    MOCK_TASKS.filter(
      (t) => t.companyId === companyId && t.assignedTo === currentUserId
    )
  );

  const [activitiesState, setActivitiesState] = useState(() =>
    MOCK_ACTIVITIES.filter(
      (a) => a.companyId === companyId && a.userId === currentUserId
    )
  );

  const [newActivityText, setNewActivityText] = useState('');
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);

  // Toggle task completed state
  const handleToggleTask = (taskId) => {
    setTasksState((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
          : t
      )
    );
  };

  // Add personal work activity
  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivityText.trim()) return;

    const newAct = {
      id: `ACT-${Date.now()}`,
      companyId,
      userId: currentUserId,
      userName: user?.name || 'You',
      userRole: 'Employee',
      action: newActivityText.trim(),
      target: 'My Daily Work Log',
      time: 'Just now',
      type: 'task'
    };

    setActivitiesState((prev) => [newAct, ...prev]);
    setNewActivityText('');
    setShowAddActivityModal(false);
  };

  const pendingTasks = tasksState.filter((t) => t.status === 'Pending');
  const completedTasks = tasksState.filter((t) => t.status === 'Completed');

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
            Personal workbench for <strong>{user?.companyName}</strong>. You have <strong>{pendingTasks.length} pending tasks</strong> and <strong>{myLeads.length} active leads</strong> requiring client contact today.
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

      {/* Personal KPI Stat Cards */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">My Tasks Due</span>
            <div className="stat-icon-wrap" style={{ color: '#f59e0b' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{pendingTasks.length} Pending</div>
          <div className="stat-footer font-mono neutral">
            <span>{completedTasks.length} completed this cycle</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">My Assigned Customers</span>
            <div className="stat-icon-wrap" style={{ color: '#10b981' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{myCustomers.length} Accounts</div>
          <div className="stat-footer font-mono positive">
            <span>Direct point of contact</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">My Pipeline Leads</span>
            <div className="stat-icon-wrap" style={{ color: '#38bdf8' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{myLeads.length} Deals</div>
          <div className="stat-footer font-mono positive">
            <span>Est. ₹15.2L personal quota</span>
          </div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">My Activities Today</span>
            <div className="stat-icon-wrap" style={{ color: 'var(--tertiary)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
          </div>
          <div className="stat-number font-mono">{activitiesState.length} Actions</div>
          <div className="stat-footer font-mono positive">
            <span>Logged in workspace feed</span>
          </div>
        </div>
      </div>

      {/* Main Focus: My Tasks Checklist & My Assigned Leads */}
      <div className="crm-panels-split-2">
        {/* Left: My Tasks Checklist */}
        <div className="crm-column-group">
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">My Actionable Tasks</h3>
                <p className="panel-card-subtitle">Click checkbox to mark work items completed</p>
              </div>
              <span className="font-mono text-xs text-muted">
                {completedTasks.length} / {tasksState.length} Done
              </span>
            </div>

            <div className="employee-tasks-checklist">
              {tasksState.length === 0 ? (
                <div className="crm-empty-state">No pending tasks assigned.</div>
              ) : (
                tasksState.map((task) => {
                  const isDone = task.status === 'Completed';
                  return (
                    <div
                      key={task.id}
                      className={`task-check-row ${isDone ? 'done' : ''}`}
                    >
                      <button
                        type="button"
                        className={`check-box-btn ${isDone ? 'checked' : ''}`}
                        onClick={() => handleToggleTask(task.id)}
                        aria-label={`Mark task ${task.title} as ${isDone ? 'pending' : 'completed'}`}
                      >
                        {isDone && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>

                      <div className="task-content">
                        <div className={`task-text font-medium ${isDone ? 'text-strikethrough' : ''}`}>
                          {task.title}
                        </div>
                        <div className="task-info font-mono text-xs text-muted">
                          <span className="task-due-tag">{task.dueDate}</span>
                          <span>&bull;</span>
                          <span>Related: {task.relatedTo}</span>
                          <span>&bull;</span>
                          <span>From: {task.assignedByName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* My Assigned Customers Table */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">My Assigned Customer Directory</h3>
                <p className="panel-card-subtitle">Clients where you are the designated account owner</p>
              </div>
              <Link to="/company/customers" className="btn btn-secondary btn-xs font-mono">
                View All
              </Link>
            </div>

            <div className="crm-table-container">
              <table className="crm-data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact Person</th>
                    <th>Email</th>
                    <th>Contract Value</th>
                    <th>Last Touch</th>
                  </tr>
                </thead>
                <tbody>
                  {myCustomers.map((cust) => (
                    <tr key={cust.id}>
                      <td className="font-semibold">{cust.name}</td>
                      <td>{cust.contactPerson}</td>
                      <td className="font-mono text-xs text-muted">{cust.email}</td>
                      <td className="font-mono">{cust.value}</td>
                      <td className="font-mono text-xs">{cust.lastContact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: My Leads & My Personal Activity Stream */}
        <div className="crm-column-group">
          {/* My Leads Pipeline */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">My Pipeline Leads</h3>
                <p className="panel-card-subtitle">Personal commercial opportunities</p>
              </div>
              <Link to="/company/leads" className="btn btn-secondary btn-xs font-mono">
                Deals Desk
              </Link>
            </div>

            <div className="crm-lead-cards-list">
              {myLeads.length === 0 ? (
                <div className="crm-empty-state">No leads assigned.</div>
              ) : (
                myLeads.map((lead) => (
                  <div key={lead.id} className="crm-lead-item employee-lead-item">
                    <div className="lead-item-header">
                      <span className="lead-company font-semibold">{lead.company}</span>
                      <span className="lead-val font-mono">{lead.estimatedValue}</span>
                    </div>
                    <div className="lead-item-title text-muted text-sm">{lead.title}</div>
                    <div className="lead-item-footer font-mono">
                      <span className="lead-stage-pill">{lead.stage}</span>
                      <span className="lead-contact">Contact: {lead.contactName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Work Activity Log */}
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">My Activity Log</h3>
                <p className="panel-card-subtitle">Recorded customer touches & sales operations</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-xs font-mono"
                onClick={() => setShowAddActivityModal(true)}
              >
                + Log Note
              </button>
            </div>

            <div className="crm-activity-feed">
              {activitiesState.map((act) => (
                <div key={act.id} className="activity-row">
                  <div className="act-bullet employee-bullet"></div>
                  <div className="act-body">
                    <div className="act-action">{act.action}</div>
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
                    rows="3"
                    className="form-input font-mono"
                    placeholder="e.g. Conducted product demo with Apex team or sent revised pricing sheet."
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
                  onClick={() => setShowAddActivityModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary font-mono btn-sm">
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
