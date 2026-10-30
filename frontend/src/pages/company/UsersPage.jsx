import React, { useState, useEffect, useCallback } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';

export default function UsersPage() {
  const { user, role, companyId } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Password123');
  const [newUserRole, setNewUserRole] = useState('employee');
  const [newUserDept, setNewUserDept] = useState('Direct Sales');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [deleting, setDeleting] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await userApi.getCompanyUsers(companyId, { page: 0, size: 100 });
      setUsersList(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load team users');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setModalError('Name and Email are required');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      await userApi.createCompanyUser(companyId, {
        name: newUserName.trim(),
        fullName: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword || 'Password123',
        role: newUserRole,
        department: newUserDept,
        phone: newUserPhone
      });
      setShowAddModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('Password123');
      await loadUsers();
    } catch (err) {
      setModalError(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;
    setDeleting(true);
    try {
      await userApi.deleteCompanyUser(companyId, deleteModal.user.userId || deleteModal.user.id);
      setDeleteModal({ isOpen: false, user: null });
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to deactivate user');
    } finally {
      setDeleting(false);
    }
  };

  const isManagerViewingTeam = role === 'manager';

  return (
    <CompanyLayout
      pageTitle={isManagerViewingTeam ? 'Supervised Team Members' : 'Employees & Workforce Directory'}
      pageSubtitle={
        isManagerViewingTeam
          ? `Direct team members assigned to ${user?.name}`
          : `Full workforce roster and permission tiers for ${user?.companyName} (${usersList.length} members)`
      }
      actions={
        role === 'company_admin' && (
          <button
            type="button"
            className="btn btn-primary font-mono btn-sm"
            onClick={() => {
              setModalError('');
              setShowAddModal(true);
            }}
          >
            + Add Employee
          </button>
        )
      }
    >
      <div className="crm-panel-card">
        {error && (
          <div className="auth-alert alert-error font-mono m-4">
            <span>{error}</span>
          </div>
        )}

        <div className="crm-table-container">
          <table className="crm-data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Employee Name</th>
                <th>Email Address</th>
                <th>Role Tier</th>
                <th>Department</th>
                <th>Status</th>
                {role === 'company_admin' && <th>Administration</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted p-4 font-mono">
                    Loading workforce roster from database...
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted p-4 font-mono">
                    No users found in this organization.
                  </td>
                </tr>
              ) : (
                usersList.map((emp) => (
                  <tr key={emp.userId || emp.id}>
                    <td className="font-mono text-xs text-muted">{emp.userId}</td>
                    <td>
                      <div className="table-user-cell">
                        <div className="user-avatar-mini font-mono">{emp.avatar || 'US'}</div>
                        <span className="font-semibold">{emp.name || emp.fullName}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs">{emp.email}</td>
                    <td>
                      <span
                        className={`font-mono text-xs role-tag ${
                          emp.role === 'company_admin'
                            ? 'role-admin'
                            : emp.role === 'manager'
                            ? 'role-manager'
                            : 'role-emp'
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>
                    <td>{emp.department || 'Workspace'}</td>
                    <td>
                      <span className="status-pill status-active font-mono">{emp.status || 'Active'}</span>
                    </td>
                    {role === 'company_admin' && (
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {emp.userId !== user?.userId && (
                            <button
                              type="button"
                              className="btn btn-danger btn-xs font-mono"
                              onClick={() => setDeleteModal({ isOpen: true, user: emp })}
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal (Admin Only) */}
      {showAddModal && (
        <div className="sa-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Provision New Organization Employee</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddEmployee}>
              <div className="sa-modal-body">
                {modalError && (
                  <div className="auth-alert alert-error font-mono mb-3">
                    <span>{modalError}</span>
                  </div>
                )}
                <div className="form-group mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Rachel Adams"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Corporate Email</label>
                  <input
                    type="email"
                    className="form-input font-mono"
                    placeholder="rachel@acmecorp.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Initial Password</label>
                  <input
                    type="password"
                    className="form-input font-mono"
                    placeholder="Password123"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Assigned Role</label>
                  <select
                    className="form-input font-mono"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                  >
                    <option value="employee">Employee / Staff</option>
                    <option value="manager">Manager</option>
                    <option value="company_admin">Company Admin</option>
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Sales, Customer Success, BD"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="+91 98765 43210"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="sa-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary font-mono btn-sm"
                  disabled={submitting}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary font-mono btn-sm" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Deactivate Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="sa-modal-backdrop" onClick={() => setDeleteModal({ isOpen: false, user: null })}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Deactivate User Account</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setDeleteModal({ isOpen: false, user: null })}
              >
                &times;
              </button>
            </div>
            <div className="sa-modal-body">
              <p>
                Are you sure you want to deactivate <strong>{deleteModal.user?.name || deleteModal.user?.fullName}</strong>? The user will be unable to log in to this organization workspace.
              </p>
            </div>
            <div className="sa-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm font-mono"
                disabled={deleting}
                onClick={() => setDeleteModal({ isOpen: false, user: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm font-mono"
                disabled={deleting}
                onClick={handleDeleteConfirm}
              >
                {deleting ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}
