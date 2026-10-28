import React, { useState } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { MOCK_USERS } from '../../data/mockUsers';

export default function UsersPage() {
  const { user, role, companyId } = useAuth();
  const [usersList, setUsersList] = useState(() =>
    MOCK_USERS.filter((u) => u.companyId === companyId)
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('employee');
  const [newUserDept, setNewUserDept] = useState('Direct Sales');

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const initials = newUserName
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    const created = {
      userId: `EMP-${Date.now().toString().slice(-4)}`,
      name: newUserName.trim(),
      fullName: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      companyId,
      companyName: user?.companyName,
      avatar: initials || 'EM',
      department: newUserDept,
      status: 'Active'
    };

    setUsersList((prev) => [...prev, created]);
    setNewUserName('');
    setNewUserEmail('');
    setShowAddModal(false);
  };

  const isManagerViewingTeam = role === 'manager';

  return (
    <CompanyLayout
      pageTitle={isManagerViewingTeam ? 'Supervised Team Members' : 'Employees & Workforce Directory'}
      pageSubtitle={
        isManagerViewingTeam
          ? `Direct team members assigned to ${user?.name}`
          : `Full workforce roster and permission tiers for ${user?.companyName}`
      }
      actions={
        role === 'company_admin' && (
          <button
            type="button"
            className="btn btn-primary font-mono btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            + Add Employee
          </button>
        )
      }
    >
      <div className="crm-panel-card">
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
              {usersList.map((emp) => (
                <tr key={emp.userId}>
                  <td className="font-mono text-xs text-muted">{emp.userId}</td>
                  <td>
                    <div className="table-user-cell">
                      <div className="user-avatar-mini font-mono">{emp.avatar}</div>
                      <span className="font-semibold">{emp.name}</span>
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
                  <td>{emp.department}</td>
                  <td>
                    <span className="status-pill status-active font-mono">{emp.status || 'Active'}</span>
                  </td>
                  {role === 'company_admin' && (
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs font-mono"
                          onClick={() => alert(`Edit credentials for ${emp.name}`)}
                        >
                          Edit
                        </button>
                        {emp.userId !== user?.userId && (
                          <button
                            type="button"
                            className="btn btn-danger btn-xs font-mono"
                            onClick={() => {
                              if (confirm(`Remove user ${emp.name}?`)) {
                                setUsersList((prev) => prev.filter((u) => u.userId !== emp.userId));
                              }
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
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

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Sales, Customer Success, BD"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                  />
                </div>
              </div>

              <div className="sa-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary font-mono btn-sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary font-mono btn-sm">
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}
