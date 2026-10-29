import React, { useState, useEffect, useCallback } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { customerApi } from '../../api/customerApi';
import RoleGuard from '../../components/RoleGuard/RoleGuard';

export default function CustomersPage() {
  const { user, role } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('All');

  // Customer Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, customer: null });
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    industry: 'Technology',
    tier: 'Enterprise',
    contractValue: '₹5,00,000'
  });

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerApi.getCustomers({
        search: searchTerm,
        tier: filterTier,
        page: 0,
        size: 100
      });
      setCustomers(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterTier]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      industry: 'Technology',
      tier: 'Enterprise',
      contractValue: '₹5,00,000'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (cust) => {
    setIsEditing(true);
    setEditingId(cust.id);
    setFormData({
      name: cust.name,
      contactPerson: cust.contactPerson || '',
      email: cust.email || '',
      phone: cust.phone || '',
      industry: cust.industry || 'Technology',
      tier: cust.tier || 'Enterprise',
      contractValue: cust.value || cust.contractValue || ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Company name is required');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (isEditing) {
        await customerApi.updateCustomer(editingId, formData);
      } else {
        await customerApi.createCustomer(formData);
      }
      setModalOpen(false);
      await loadCustomers();
    } catch (err) {
      setFormError(err.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.customer) return;
    setDeleting(true);
    try {
      await customerApi.deleteCustomer(deleteModal.customer.id);
      setDeleteModal({ isOpen: false, customer: null });
      await loadCustomers();
    } catch (err) {
      alert(err.message || 'Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <CompanyLayout
      pageTitle={role === 'employee' ? 'My Assigned Customers' : 'Customer Accounts Directory'}
      pageSubtitle={`Multi-tenant CRM records scoped to ${user?.companyName} (${customers.length} records)`}
      actions={
        <RoleGuard allowedRoles={['company_admin', 'manager']}>
          <button
            type="button"
            className="btn btn-primary font-mono btn-sm"
            onClick={handleOpenAddModal}
          >
            + New Customer
          </button>
        </RoleGuard>
      }
    >
      <div className="crm-panel-card">
        {/* Filter bar */}
        <div className="crm-filter-toolbar">
          <div className="crm-search-box">
            <input
              type="text"
              placeholder="Search by company, contact person, or industry..."
              className="form-input font-mono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-filter-selects">
            <select
              className="form-input font-mono"
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
            >
              <option value="All">All Tiers</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Mid-Market">Mid-Market</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="auth-alert alert-error font-mono m-4">
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        <div className="crm-table-container">
          <table className="crm-data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Company Name</th>
                <th>Contact</th>
                <th>Email / Phone</th>
                <th>Industry</th>
                <th>Contract Value</th>
                <th>Assigned Rep</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted p-4 font-mono">
                    Loading customer accounts from database...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted" style={{ padding: '30px' }}>
                    No customer accounts match your search filters.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id}>
                    <td className="font-mono text-xs text-muted">{cust.id}</td>
                    <td className="font-semibold">{cust.name}</td>
                    <td>{cust.contactPerson || '—'}</td>
                    <td className="font-mono text-xs">
                      <div>{cust.email || '—'}</div>
                      <div className="text-muted">{cust.phone || '—'}</div>
                    </td>
                    <td>{cust.industry || '—'}</td>
                    <td className="font-mono font-bold text-tertiary">
                      {cust.value || cust.contractValue || '—'}
                    </td>
                    <td className="font-mono text-xs">
                      <span className="pill-metric">{cust.assignedTo || 'Unassigned'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <RoleGuard allowedRoles={['company_admin', 'manager']}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs font-mono"
                            onClick={() => handleOpenEditModal(cust)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-xs font-mono"
                            onClick={() => setDeleteModal({ isOpen: true, customer: cust })}
                          >
                            Delete
                          </button>
                        </RoleGuard>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="sa-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">
                {isEditing ? `Edit Customer: ${formData.name}` : 'Create New Customer Account'}
              </h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="sa-modal-body">
                {formError && (
                  <div className="auth-alert alert-error font-mono mb-3">
                    <span>{formError}</span>
                  </div>
                )}
                <div className="form-group mb-3">
                  <label className="form-label">Company / Account Name</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Acme Health Corp"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Alex Henderson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Corporate Email</label>
                  <input
                    type="email"
                    className="form-input font-mono"
                    placeholder="alex@acmehealth.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Industry</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="Healthcare / Technology"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Contract Tier</label>
                  <select
                    className="form-input font-mono"
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  >
                    <option value="Enterprise">Enterprise</option>
                    <option value="Mid-Market">Mid-Market</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Contract Value</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="₹10,00,000"
                    value={formData.contractValue}
                    onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                  />
                </div>
              </div>
              <div className="sa-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary font-mono btn-sm"
                  disabled={saving}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary font-mono btn-sm" disabled={saving}>
                  {saving ? 'Saving...' : (isEditing ? 'Update Customer' : 'Create Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="sa-modal-backdrop" onClick={() => setDeleteModal({ isOpen: false, customer: null })}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Delete Customer Account</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setDeleteModal({ isOpen: false, customer: null })}
              >
                &times;
              </button>
            </div>
            <div className="sa-modal-body">
              <p>
                Are you sure you want to delete <strong>{deleteModal.customer?.name}</strong>? This action cannot be undone and will delete the customer permanently from the database.
              </p>
            </div>
            <div className="sa-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm font-mono"
                disabled={deleting}
                onClick={() => setDeleteModal({ isOpen: false, customer: null })}
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
