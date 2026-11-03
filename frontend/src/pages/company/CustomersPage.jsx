import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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

  // Customer Modal state (For Create Customer)
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    industry: 'Technology',
    tier: 'Enterprise',
    contractValue: '₹5,00,000',
    address: '',
    contractStartDate: '',
    contractEndDate: ''
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
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      industry: 'Technology',
      tier: 'Enterprise',
      contractValue: '₹5,00,000',
      address: '',
      contractStartDate: '',
      contractEndDate: ''
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Company / Account name is required');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      await customerApi.createCustomer(formData);
      setModalOpen(false);
      loadCustomers();
    } catch (err) {
      setFormError(err.message || 'Failed to create customer account');
    } finally {
      setSaving(false);
    }
  };

  // Metrics summary
  const totalCount = customers.length;
  const enterpriseCount = customers.filter(c => (c.tier || '').toLowerCase() === 'enterprise').length;

  return (
    <CompanyLayout
      pageTitle="Customer Accounts Directory"
      pageSubtitle="Manage client relationships, enterprise contracts, and active accounts"
      actions={
        <RoleGuard allowedRoles={['company_admin', 'manager']}>
          <button
            type="button"
            className="btn btn-primary font-mono btn-sm"
            onClick={handleOpenAddModal}
          >
            + Add Customer Account
          </button>
        </RoleGuard>
      }
    >
      {/* Search and Tier Filter Bar */}
      <div className="crm-panel-card mb-4">
        <div className="crm-filter-toolbar">
          <div className="crm-search-box">
            <input
              type="text"
              className="form-input font-mono text-sm"
              placeholder="Search by company, contact person, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-filter-selects" style={{ alignItems: 'center' }}>
            <span className="font-mono text-xs text-muted">Tier:</span>
            {['All', 'Enterprise', 'Mid-Market', 'Standard'].map((tier) => (
              <button
                key={tier}
                type="button"
                className={`btn btn-xs font-mono ${filterTier === tier ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterTier(tier)}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="auth-alert alert-error font-mono mb-4">
          <span>{error}</span>
          <button type="button" onClick={loadCustomers} className="btn btn-xs btn-secondary ml-2">
            Retry
          </button>
        </div>
      )}

      {/* Customers Table */}
      <div className="crm-panel-card">
        <div className="panel-card-header">
          <div>
            <h3 className="panel-card-title">Tenant Customer Accounts</h3>
            <p className="panel-card-subtitle">
              Showing {totalCount} verified accounts &bull; {enterpriseCount} Enterprise contracts
            </p>
          </div>
        </div>

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
                <th style={{ textAlign: 'right' }}>Actions</th>
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
                  <td colSpan="8" className="text-center text-muted" style={{ padding: '36px 20px' }}>
                    No customer accounts match your search filters.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id}>
                    <td className="font-mono text-xs text-muted">#{cust.id}</td>
                    <td>
                      <div className="font-semibold text-primary">{cust.name}</div>
                      {cust.tier && (
                        <span className="font-mono text-xs text-muted" style={{ fontSize: '0.72rem' }}>
                          {cust.tier}
                        </span>
                      )}
                    </td>
                    <td>{cust.contactPerson || '—'}</td>
                    <td className="font-mono text-xs">
                      <div>{cust.email || '—'}</div>
                      <div className="text-muted">{cust.phone || '—'}</div>
                    </td>
                    <td>
                      <span className="status-pill font-mono text-xs" style={{ background: 'var(--bg-subtle-box)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        {cust.industry || 'General'}
                      </span>
                    </td>
                    <td className="font-mono font-bold" style={{ color: 'var(--tertiary)' }}>
                      {cust.value || cust.contractValue || '—'}
                    </td>
                    <td className="font-mono text-xs">
                      <span className="pill-metric">{cust.assignedTo || 'Unassigned'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/company/customers/${cust.id}`}
                        className="btn btn-secondary btn-xs font-mono"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        View Account &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {modalOpen && (
        <div className="sa-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="sa-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Create New Customer Account</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="sa-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                {formError && (
                  <div className="auth-alert alert-error font-mono mb-3">
                    <span>{formError}</span>
                  </div>
                )}
                <div className="form-group mb-3">
                  <label className="form-label">Company / Account Name *</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Acme Health Corp"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="mb-3">
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="e.g. Alex Henderson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Corporate Email</label>
                    <input
                      type="email"
                      className="form-input font-mono"
                      placeholder="alex@acmehealth.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="mb-3">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="Healthcare / Technology"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Office Address</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Tower B, 4th Floor, Tech Park, Bengaluru"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="mb-3">
                  <div className="form-group">
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
                      placeholder="₹8,00,000"
                      value={formData.contractValue}
                      onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Contract Start Date</label>
                    <input
                      type="date"
                      className="form-input font-mono"
                      value={formData.contractStartDate}
                      onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contract End Date</label>
                    <input
                      type="date"
                      className="form-input font-mono"
                      value={formData.contractEndDate}
                      onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                    />
                  </div>
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
                  {saving ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}
