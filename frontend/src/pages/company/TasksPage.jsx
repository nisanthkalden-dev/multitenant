import React, { useState } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { MOCK_TASKS } from '../../data/mockTenantData';
import { MOCK_USERS } from '../../data/mockUsers';
import RoleGuard from '../../components/RoleGuard/RoleGuard';

export default function TasksPage() {
  const { user, role, companyId } = useAuth();
  const [tasks, setTasks] = useState(() =>
    MOCK_TASKS.filter((t) => {
      if (t.companyId !== companyId) return false;
      if (role === 'employee') {
        return t.assignedTo === user?.userId;
      }
      return true;
    })
  );

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState('employee');
  const [newRelatedTo, setNewRelatedTo] = useState('');

  const companyStaff = MOCK_USERS.filter((u) => u.companyId === companyId);

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
          : t
      )
    );
  };

  const handleAssignTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: `TASK-${Date.now()}`,
      companyId,
      title: newTitle.trim(),
      dueDate: newDueDate || 'Due this week',
      priority: 'Medium',
      status: 'Pending',
      category: 'General',
      assignedTo: newAssignedTo,
      assignedByName: `${user?.name} (${role === 'company_admin' ? 'Admin' : 'Manager'})`,
      relatedTo: newRelatedTo || 'Operations'
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle('');
    setNewDueDate('');
    setShowAssignModal(false);
  };

  return (
    <CompanyLayout
      pageTitle={role === 'employee' ? 'My Assigned Tasks' : 'Workforce Tasks Management'}
      pageSubtitle={`Operational action items for ${user?.companyName} (${tasks.length} tasks)`}
      actions={
        <RoleGuard allowedRoles={['company_admin', 'manager']}>
          <button
            type="button"
            className="btn btn-primary font-mono btn-sm"
            onClick={() => setShowAssignModal(true)}
          >
            + Assign New Task
          </button>
        </RoleGuard>
      }
    >
      <div className="crm-panel-card">
        <div className="tasks-flow-list">
          {tasks.length === 0 ? (
            <div className="crm-empty-state font-mono">No tasks recorded in this tenant view.</div>
          ) : (
            tasks.map((task) => {
              const isDone = task.status === 'Completed';
              return (
                <div key={task.id} className={`task-row-card ${isDone ? 'done-card' : ''}`}>
                  <div className="task-top">
                    <button
                      type="button"
                      className={`check-box-btn ${isDone ? 'checked' : ''}`}
                      onClick={() => toggleTask(task.id)}
                      title="Click to toggle status"
                    >
                      {isDone && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <span
                      className={`task-status-badge font-mono ${
                        isDone ? 'task-done' : 'task-pending'
                      }`}
                    >
                      {task.status}
                    </span>
                    <span className="task-due font-mono text-xs">{task.dueDate}</span>
                  </div>

                  <div className={`task-title font-medium ${isDone ? 'text-strikethrough' : ''}`}>
                    {task.title}
                  </div>

                  <div className="task-footer font-mono text-xs text-muted">
                    <span>Assigned to: <strong>{task.assignedTo}</strong></span>
                    <span>&bull;</span>
                    <span>Assigned By: {task.assignedByName}</span>
                    <span>&bull;</span>
                    <span>Context: {task.relatedTo}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Role-Protected Task Assignment Modal (Only for Admin & Manager) */}
      {showAssignModal && (
        <div className="sa-modal-backdrop" onClick={() => setShowAssignModal(false)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Assign New Workforce Task</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setShowAssignModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAssignTask}>
              <div className="sa-modal-body">
                <div className="form-group mb-3">
                  <label className="form-label">Task Objective / Title</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Follow-up demo call with client"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Assign To Personnel</label>
                  <select
                    className="form-input font-mono"
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                  >
                    {companyStaff.map((staff) => (
                      <option key={staff.userId} value={staff.userId}>
                        {staff.name} ({staff.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Due Date / Time</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Tomorrow, 4:00 PM"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Related Client / Account</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Apex Global Logistics"
                    value={newRelatedTo}
                    onChange={(e) => setNewRelatedTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="sa-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary font-mono btn-sm"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary font-mono btn-sm">
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}
