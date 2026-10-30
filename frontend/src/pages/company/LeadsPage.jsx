import React, { useState, useEffect, useCallback } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { leadApi } from '../../api/leadApi';
import RoleGuard from '../../components/RoleGuard/RoleGuard';

export default function LeadsPage() {
  const { user, role } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  // Modal states for Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, lead: null });
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    estimatedValue: '₹5,00,000',
    stage: 'Prospecting',
    source: 'Website'
  });

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await leadApi.getLeads({
        search: searchTerm,
        stage: stageFilter,
        page: 0,
        size: 100
      });
      setLeads(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, stageFilter]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      estimatedValue: '₹5,00,000',
      stage: 'Prospecting',
      source: 'Inbound'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (lead) => {
    setIsEditing(true);
    setEditingId(lead.id);
    setFormData({
      title: lead.title,
      companyName: lead.company || lead.companyName || '',
      contactName: lead.contactName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      estimatedValue: lead.estimatedValue || lead.value || '',
      stage: lead.stage || 'Prospecting',
      source: lead.source || 'Inbound'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.companyName.trim()) {
      setFormError('Opportunity title and Company name are required');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (isEditing) {
        await leadApi.updateLead(editingId, formData);
      } else {
        await leadApi.createLead(formData);
      }
      setModalOpen(false);
      await loadLeads();
    } catch (err) {
      setFormError(err.message || 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.lead) return;
    setDeleting(true);
    try {
      await leadApi.deleteLead(deleteModal.lead.id);
      setDeleteModal({ isOpen: false, lead: null });
      await loadLeads();
    } catch (err) {
      alert(err.message || 'Failed to delete lead');
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickStageChange = async (lead, newStage) => {
    try {
      await leadApi.updateLead(lead.id, {
        ...lead,
        companyName: lead.company || lead.companyName,
        stage: newStage
      });
      await loadLeads();
    } catch (err) {
      alert(err.message || 'Failed to update stage');
    }
  };

  return (
    <CompanyLayout
      pageTitle={role === 'employee' ? 'My Assigned Deals & Leads' : 'Commercial Deals Pipeline'}
      pageSubtitle={`Inbound opportunities and qualification pipeline for ${user?.companyName} (${leads.length} records)`}
      actions={
        <RoleGuard allowedRoles={['company_admin', 'manager']}>
          <button
            type="button"
            className="btn btn-primary font-mono btn-sm"
            onClick={handleOpenCreateModal}
          >
            + Create Deal / Lead
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
              placeholder="Search leads by title, account, or contact..."
              className="form-input font-mono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-filter-selects">
            <select
              className="form-input font-mono"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="All">All Stages</option>
              <option value="Prospecting">Prospecting</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Negotiation">Negotiation</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="auth-alert alert-error font-mono m-4">
            <span>{error}</span>
          </div>
        )}

        {/* Leads Grid/Cards */}
        <div className="crm-leads-grid-view">
          {loading ? (
            <div className="crm-empty-state font-mono">Loading deals pipeline from database...</div>
          ) : leads.length === 0 ? (
            <div className="crm-empty-state font-mono">No leads match the specified criteria.</div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="crm-lead-card-detailed">
                <div className="lead-card-head">
                  <div>
                    <span className="lead-id-tag font-mono">{lead.id}</span>
                    <h3 className="lead-card-company">{lead.company || lead.companyName}</h3>
                  </div>
                  <span className="lead-card-val font-mono">{lead.estimatedValue || lead.value}</span>
                </div>

                <p className="lead-card-title text-sm">{lead.title}</p>

                <div className="lead-card-meta font-mono text-xs">
                  <div>Contact: <strong>{lead.contactName || '—'}</strong></div>
                  <div>Email: {lead.email || '—'}</div>
                  <div>Phone: {lead.phone || '—'}</div>
                </div>

                <div className="lead-card-foot">
                  <select
                    className="lead-stage-pill font-mono"
                    style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'inherit', padding: '2px 6px', borderRadius: '4px' }}
                    value={lead.stage}
                    onChange={(e) => handleQuickStageChange(lead, e.target.value)}
                  >
                    <option value="Prospecting">Prospecting</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                  </select>
                  <span className="lead-assigned-pill font-mono">
                    {lead.assignedTo || 'Unassigned'}
                  </span>
                </div>

                <RoleGuard allowedRoles={['company_admin', 'manager']}>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs font-mono"
                      onClick={() => handleOpenEditModal(lead)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-xs font-mono"
                      onClick={() => setDeleteModal({ isOpen: true, lead })}
                    >
                      Delete
                    </button>
                  </div>
                </RoleGuard>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="sa-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">
                {isEditing ? `Edit Deal / Lead: ${formData.title}` : 'Create Commercial Deal / Lead'}
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
                  <label className="form-label">Deal / Opportunity Title</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Enterprise Multi-Site Expansion"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Vanguard Logistics"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Priya Sharma"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input font-mono"
                    placeholder="priya@vanguard.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Estimated Value</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="₹15,00,000"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Pipeline Stage</label>
                  <select
                    className="form-input font-mono"
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  >
                    <option value="Prospecting">Prospecting</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                  </select>
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
                  {saving ? 'Saving...' : (isEditing ? 'Update Deal' : 'Create Deal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="sa-modal-backdrop" onClick={() => setDeleteModal({ isOpen: false, lead: null })}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Delete Commercial Lead</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setDeleteModal({ isOpen: false, lead: null })}
              >
                &times;
              </button>
            </div>
            <div className="sa-modal-body">
              <p>
                Are you sure you want to delete lead <strong>{deleteModal.lead?.title}</strong>? This action will permanently remove the record from the database.
              </p>
            </div>
            <div className="sa-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm font-mono"
                disabled={deleting}
                onClick={() => setDeleteModal({ isOpen: false, lead: null })}
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
