import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';

export default function UsersPage() {
  const { user, role, companyId } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Managers list for dropdowns
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Password123');
  const [newUserRole, setNewUserRole] = useState('employee');
  const [newUserDept, setNewUserDept] = useState('Direct Sales');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserManagerId, setNewUserManagerId] = useState('');
  const [newUserJoiningDate, setNewUserJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Status toggle confirmation modal
  const [statusModal, setStatusModal] = useState({ isOpen: false, user: null, targetStatus: '' });
  const [statusChanging, setStatusChanging] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userApi.getEmployees({
        page,
        size,
        search,
        role: roleFilter,
        department: departmentFilter,
        status: statusFilter,
        sort: `${sortField},${sortOrder}`
      });

      setUsersList(res.data || []);
      if (res.meta) {
        setTotalPages(res.meta.totalPages || 1);
        setTotalElements(res.meta.totalElements || (res.data ? res.data.length : 0));
      } else {
        setTotalElements(res.data ? res.data.length : 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load employees roster');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, roleFilter, departmentFilter, statusFilter, sortField, sortOrder]);

  const loadManagersAndFilters = useCallback(async () => {
    try {
      const res = await userApi.getEmployees({ size: 100 });
      if (res.data) {
        const mgrs = res.data.filter((u) => u.role === 'manager' || u.role === 'company_admin');
        setManagers(mgrs);

        const depts = Array.from(new Set(res.data.map((u) => u.department).filter(Boolean)));
        setDepartments(depts);
      }
    } catch (e) {
      console.error('Failed to prefetch managers/depts', e);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadManagersAndFilters();
  }, [loadManagersAndFilters]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setModalError('Name and Email are required');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      await userApi.createEmployee({
        name: newUserName.trim(),
        fullName: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword || 'Password123',
        role: newUserRole,
        department: newUserDept,
        phone: newUserPhone,
        managerId: newUserManagerId || null,
        joiningDate: newUserJoiningDate || null,
        status: 'Active'
      });

      setShowAddModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('Password123');
      setNewUserPhone('');
      setNewUserManagerId('');
      setActionSuccess('Employee added successfully to organization.');
      await loadUsers();
      await loadManagersAndFilters();
    } catch (err) {
      setModalError(err.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChangeConfirm = async () => {
    if (!statusModal.user) return;
    setStatusChanging(true);
    try {
      await userApi.updateEmployeeStatus(statusModal.user.userId || statusModal.user.id, statusModal.targetStatus);
      setStatusModal({ isOpen: false, user: null, targetStatus: '' });
      setActionSuccess(`Employee ${statusModal.targetStatus === 'Active' ? 'activated' : 'deactivated'} successfully.`);
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to update employee status');
    } finally {
      setStatusChanging(false);
    }
  };

  const isManagerViewingTeam = role === 'manager';
  const isCompanyAdmin = role === 'company_admin' || role === 'super_admin';

  return (
    <CompanyLayout
      pageTitle={isManagerViewingTeam ? 'Supervised Team Members' : 'Employees & Workforce Directory'}
      pageSubtitle={
        isManagerViewingTeam
          ? `Direct team members assigned to ${user?.name || 'Manager'}`
          : `Full workforce roster and permission tiers for ${user?.companyName || 'Workspace'} (${totalElements} members)`
      }
      actions={
        isCompanyAdmin && (
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
        {actionSuccess && (
          <div className="auth-alert alert-success font-mono m-4">
            <span>{actionSuccess}</span>
          </div>
        )}
        {error && (
          <div className="auth-alert alert-error font-mono m-4">
            <span>{error}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-subtle" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 220px', minWidth: '200px' }}>
            <input
              type="text"
              className="form-input font-mono text-xs w-full"
              placeholder="Search by name, email, phone, ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>

          {/* Role Filter */}
          <div style={{ width: '150px' }}>
            <select
              className="form-input font-mono text-xs w-full"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="All">All Roles</option>
              <option value="COMPANY_ADMIN">Company Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>

          {/* Department Filter */}
          <div style={{ width: '160px' }}>
            <select
              className="form-input font-mono text-xs w-full"
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ width: '140px' }}>
            <select
              className="form-input font-mono text-xs w-full"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Sort Field & Order */}
          <div style={{ width: '160px' }}>
            <select
              className="form-input font-mono text-xs w-full"
              value={`${sortField},${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split(',');
                setSortField(f);
                setSortOrder(o);
                setPage(0);
              }}
            >
              <option value="id,asc">Sort: ID (Asc)</option>
              <option value="id,desc">Sort: ID (Desc)</option>
              <option value="name,asc">Sort: Name (A-Z)</option>
              <option value="name,desc">Sort: Name (Z-A)</option>
              <option value="department,asc">Sort: Department</option>
              <option value="status,asc">Sort: Status</option>
            </select>
          </div>

          {(search || roleFilter !== 'All' || departmentFilter !== 'All' || statusFilter !== 'All') && (
            <button
              type="button"
              className="btn btn-secondary btn-xs font-mono"
              onClick={() => {
                setSearch('');
                setRoleFilter('All');
                setDepartmentFilter('All');
                setStatusFilter('All');
                setPage(0);
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Employee Data Table */}
        <div className="crm-table-container">
          <table className="crm-data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Email Address</th>
                <th>Role Tier</th>
                <th>Department</th>
                <th>Reports To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted p-4 font-mono">
                    Loading workforce roster from database...
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted p-6 font-mono">
                    No employees found matching the specified criteria.
                  </td>
                </tr>
              ) : (
                usersList.map((emp) => (
                  <tr key={emp.userId || emp.id}>
                    <td className="font-mono text-xs text-muted">
                      <Link to={`/company/users/${emp.userId || emp.id}`} className="font-mono text-primary font-bold">
                        {emp.userId}
                      </Link>
                    </td>
                    <td>
                      <div className="table-user-cell">
                        <div className="user-avatar-mini font-mono">{emp.avatar || 'US'}</div>
                        <Link to={`/company/users/${emp.userId || emp.id}`} className="font-semibold text-primary">
                          {emp.name || emp.fullName}
                        </Link>
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
                    <td className="text-xs font-mono">
                      {emp.managerName ? (
                        <span>{emp.managerName}</span>
                      ) : emp.managerId ? (
                        <span>{emp.managerId}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-pill font-mono text-xs ${
                          emp.status === 'Active' ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {emp.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link
                          to={`/company/users/${emp.userId || emp.id}`}
                          className="btn btn-secondary btn-xs font-mono"
                        >
                          View
                        </Link>
                        {isCompanyAdmin && emp.userId !== user?.userId && (
                          <button
                            type="button"
                            className={`btn btn-xs font-mono ${
                              emp.status === 'Active' ? 'btn-danger' : 'btn-success'
                            }`}
                            onClick={() =>
                              setStatusModal({
                                isOpen: true,
                                user: emp,
                                targetStatus: emp.status === 'Active' ? 'Inactive' : 'Active'
                              })
                            }
                          >
                            {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-subtle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-muted font-mono text-xs">
              Showing page {page + 1} of {totalPages} ({totalElements} total employees)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-xs font-mono"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                &larr; Previous
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-xs font-mono"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Modal (Company Admin Only) */}
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
                  <label className="form-label">Assigned Role Tier</label>
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

                <div className="form-group mb-3">
                  <label className="form-label">Assigned Manager</label>
                  <select
                    className="form-input font-mono"
                    value={newUserManagerId}
                    onChange={(e) => setNewUserManagerId(e.target.value)}
                  >
                    <option value="">None / Direct Executive</option>
                    {managers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.name || m.fullName} ({m.userId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Joining Date</label>
                  <input
                    type="date"
                    className="form-input font-mono"
                    value={newUserJoiningDate}
                    onChange={(e) => setNewUserJoiningDate(e.target.value)}
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
                  {submitting ? 'Creating Employee...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Toggle Modal */}
      {statusModal.isOpen && (
        <div className="sa-modal-backdrop" onClick={() => setStatusModal({ isOpen: false, user: null, targetStatus: '' })}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">
                {statusModal.targetStatus === 'Active' ? 'Activate Employee Account' : 'Deactivate Employee Account'}
              </h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setStatusModal({ isOpen: false, user: null, targetStatus: '' })}
              >
                &times;
              </button>
            </div>
            <div className="sa-modal-body">
              <p>
                Are you sure you want to <strong>{statusModal.targetStatus.toLowerCase()}</strong>{' '}
                <strong>{statusModal.user?.name || statusModal.user?.fullName}</strong> ({statusModal.user?.userId})?
              </p>
              {statusModal.targetStatus === 'Inactive' && (
                <p className="text-muted text-xs mt-2">
                  The employee will be unable to log in, but their historical assigned customers, leads, tasks, and activity records will remain preserved.
                </p>
              )}
            </div>
            <div className="sa-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm font-mono"
                disabled={statusChanging}
                onClick={() => setStatusModal({ isOpen: false, user: null, targetStatus: '' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-sm font-mono ${statusModal.targetStatus === 'Active' ? 'btn-success' : 'btn-danger'}`}
                disabled={statusChanging}
                onClick={handleStatusChangeConfirm}
              >
                {statusChanging ? 'Updating...' : `Confirm ${statusModal.targetStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}
