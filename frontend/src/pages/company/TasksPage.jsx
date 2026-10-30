import React, { useState, useEffect, useCallback } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { taskApi } from '../../api/taskApi';
import { userApi } from '../../api/userApi';
import RoleGuard from '../../components/RoleGuard/RoleGuard';

export default function TasksPage() {
  const { user, role, companyId } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Assign Task Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newAssignedTo, setNewAssignedTo] = useState('employee');
  const [newRelatedTo, setNewRelatedTo] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, task: null });
  const [deleting, setDeleting] = useState(false);

  // Staff list for assigning
  const [companyStaff, setCompanyStaff] = useState([]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await taskApi.getTasks({
        search: searchTerm,
        status: statusFilter,
        page: 0,
        size: 100
      });
      setTasks(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    async function loadUsers() {
      if (companyId) {
        try {
          const res = await userApi.getCompanyUsers(companyId, { page: 0, size: 50 });
          setCompanyStaff(res.data || []);
          if (res.data?.length > 0) {
            setNewAssignedTo(res.data[0].userId);
          }
        } catch {
          // fallback if role not permitted
        }
      }
    }
    loadUsers();
  }, [companyId]);

  const toggleTask = async (taskId) => {
    try {
      await taskApi.toggleTaskStatus(taskId);
      await loadTasks();
    } catch (err) {
      alert(err.message || 'Failed to toggle task');
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setModalError('Task title is required');
      return;
    }

    setAssigning(true);
    setModalError('');

    try {
      await taskApi.createTask({
        title: newTitle.trim(),
        dueDate: newDueDate || 'Due this week',
        priority: newPriority,
        category: 'General',
        assignedTo: newAssignedTo,
        relatedTo: newRelatedTo || 'Operations'
      });
      setNewTitle('');
      setNewDueDate('');
      setShowAssignModal(false);
      await loadTasks();
    } catch (err) {
      setModalError(err.message || 'Failed to create task');
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.task) return;
    setDeleting(true);
    try {
      await taskApi.deleteTask(deleteModal.task.id);
      setDeleteModal({ isOpen: false, task: null });
      await loadTasks();
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
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
        {/* Filters */}
        <div className="crm-filter-toolbar">
          <div className="crm-search-box">
            <input
              type="text"
              placeholder="Search tasks by title, assignee, or category..."
              className="form-input font-mono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-filter-selects">
            <select
              className="form-input font-mono"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="auth-alert alert-error font-mono m-4">
            <span>{error}</span>
          </div>
        )}

        <div className="tasks-flow-list">
          {loading ? (
            <div className="crm-empty-state font-mono">Loading tasks from database...</div>
          ) : tasks.length === 0 ? (
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
                        isDone ? 'status-done' : 'status-open'
                      }`}
                    >
                      {task.status}
                    </span>
                    <span
                      className={`task-priority-tag font-mono priority-${(
                        task.priority || 'medium'
                      ).toLowerCase()}`}
                    >
                      {task.priority}
                    </span>
                    <span className="task-category-tag font-mono">{task.category || 'General'}</span>
                  </div>

                  <h3 className={`task-title-text ${isDone ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>

                  <div className="task-meta-row font-mono text-xs">
                    <span className="task-due text-muted">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginRight: '4px' }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {task.dueDate}
                    </span>
                    <span>&bull;</span>
                    <span className="task-assigned">
                      Assigned to: <strong>{task.assignedTo || 'Unassigned'}</strong>
                    </span>
                    <span>&bull;</span>
                    <span className="task-related text-muted">Context: {task.relatedTo || 'Operations'}</span>
                  </div>

                  <RoleGuard allowedRoles={['company_admin', 'manager']}>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-xs font-mono"
                        onClick={() => setDeleteModal({ isOpen: true, task })}
                      >
                        Delete
                      </button>
                    </div>
                  </RoleGuard>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Assign Task Modal */}
      {showAssignModal && (
        <div className="sa-modal-backdrop" onClick={() => setShowAssignModal(false)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Assign Operational Task</h3>
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
                {modalError && (
                  <div className="auth-alert alert-error font-mono mb-3">
                    <span>{modalError}</span>
                  </div>
                )}
                <div className="form-group mb-3">
                  <label className="form-label">Task Directive</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Schedule commercial follow-up call..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Due Date / Deadline</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Today, 4:00 PM"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-input font-mono"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Assignee (Employee)</label>
                  <select
                    className="form-input font-mono"
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                  >
                    {companyStaff.map((u) => (
                      <option key={u.userId} value={u.userId}>
                        {u.name || u.fullName} ({u.userId}) - {u.role}
                      </option>
                    ))}
                    {companyStaff.length === 0 && (
                      <option value="employee">Default Staff (employee)</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Related Context / Customer</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Acme Health or Regional Sales"
                    value={newRelatedTo}
                    onChange={(e) => setNewRelatedTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="sa-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary font-mono btn-sm"
                  disabled={assigning}
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary font-mono btn-sm" disabled={assigning}>
                  {assigning ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="sa-modal-backdrop" onClick={() => setDeleteModal({ isOpen: false, task: null })}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Delete Task</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setDeleteModal({ isOpen: false, task: null })}
              >
                &times;
              </button>
            </div>
            <div className="sa-modal-body">
              <p>
                Are you sure you want to delete task <strong>{deleteModal.task?.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="sa-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm font-mono"
                disabled={deleting}
                onClick={() => setDeleteModal({ isOpen: false, task: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm font-mono"
                disabled={deleting}
                onClick={handleDeleteConfirm}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}
