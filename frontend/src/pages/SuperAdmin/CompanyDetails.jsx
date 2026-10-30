import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { companyApi } from '../../api/companyApi';
import AdminLayout from '../../components/SuperAdmin/AdminLayout';
import StatusBadge from '../../components/SuperAdmin/StatusBadge';

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companies, updateCompanyStatus } = useSuperAdmin();

  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Fallback to context company while specific dossier loads
  const contextCompany = companies.find((c) => c.id === id);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetails() {
      setLoading(true);
      try {
        const data = await companyApi.getCompanyById(id);
        if (isMounted && data) {
          setCompanyDetails(data);
        }
      } catch (err) {
        console.warn('Could not fetch detailed company dossier:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) {
      fetchDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const company = companyDetails || contextCompany;

  if (!company && !loading) {
    return (
      <AdminLayout title="Company Not Found" breadcrumb={['Companies', 'Not Found']}>
        <div className="sa-card text-center" style={{ padding: '60px 20px' }}>
          <div className="sa-empty-icon">🔍</div>
          <h2 className="sa-empty-title">Company dossier not found</h2>
          <p className="sa-empty-desc">
            The requested organization identifier <code className="font-mono">{id}</code> does not exist in records.
          </p>
          <Link to="/super-admin/companies" className="btn btn-primary font-mono mt-4">
            Return to Companies List
          </Link>
        </div>
      </AdminLayout>
    );
  }

  if (!company && loading) {
    return (
      <AdminLayout title="Loading Company..." breadcrumb={['Companies', 'Loading']}>
        <div className="sa-card text-center font-mono" style={{ padding: '60px 20px', color: 'var(--text-muted)' }}>
          Retrieving verified tenant records from secure database...
        </div>
      </AdminLayout>
    );
  }

  const isSuspended = company.status === 'Suspended';

  const toggleStatus = async () => {
    setUpdating(true);
    setUpdateError('');
    try {
      const nextStatus = isSuspended ? 'Active' : 'Suspended';
      await updateCompanyStatus(company.id, nextStatus);
      if (companyDetails) {
        setCompanyDetails({ ...companyDetails, status: nextStatus });
      }
    } catch (err) {
      setUpdateError(err.message || 'Failed to update company status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminLayout
      title={company.name}
      breadcrumb={['Companies', company.name]}
    >
      {/* Back Link */}
      <div className="mb-4">
        <Link to="/super-admin/companies" className="sa-back-link font-mono">
          &larr; Back to Companies Directory
        </Link>
      </div>

      {/* Header Profile Card */}
      <div className="sa-card sa-company-header-card">
        <div className="sa-company-header-main">
          <div
            className="sa-company-avatar-large font-mono"
            style={{ backgroundColor: `${company.logoColor}20`, color: company.logoColor }}
          >
            {company.logo}
          </div>

          <div className="sa-company-header-details">
            <div className="sa-company-title-row">
              <h2 className="sa-details-title">{company.name}</h2>
              <StatusBadge status={company.status} />
              <span className="sa-plan-pill font-mono">{company.plan} Tier</span>
            </div>

            <div className="sa-company-meta-tags font-mono">
              <span className="sa-meta-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                </svg>
                {company.domain}
              </span>
              <span className="sa-meta-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {company.email}
              </span>
              <span className="sa-meta-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                {company.phone}
              </span>
              <span className="sa-meta-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Joined {company.joinedDate}
              </span>
            </div>
          </div>
        </div>

        <div className="sa-company-header-actions">
          {updateError && (
            <span className="text-danger text-xs font-mono mr-2">{updateError}</span>
          )}
          <button
            type="button"
            className={`btn font-mono ${isSuspended ? 'btn-primary' : 'btn-outline-danger'}`}
            disabled={updating}
            onClick={toggleStatus}
          >
            {updating ? 'Updating...' : (isSuspended ? 'Reactivate Tenant' : 'Suspend Tenant')}
          </button>
        </div>
      </div>

      {/* Usage Metrics Section */}
      <div className="sa-metrics-section">
        <h3 className="sa-subheading">Workspace Usage & Capacity</h3>
        <div className="sa-stats-grid">
          <div className="sa-stat-card">
            <span className="sa-stat-title">Total Users</span>
            <div className="sa-stat-value font-mono">
              {company.usersCount ?? 0}{' '}
              {company.userLimit ? (
                <span className="sa-stat-sub font-mono">/ {company.userLimit}</span>
              ) : null}
            </div>
            <div className="sa-stat-growth positive font-mono">
              {company.userLimit
                ? `${Math.round(((company.usersCount || 0) / company.userLimit) * 100)}% capacity allocated`
                : 'Assigned tenant seats'}
            </div>
          </div>

          <div className="sa-stat-card">
            <span className="sa-stat-title">Active Users Today</span>
            <div
              className="sa-stat-value font-mono"
              style={{ fontSize: company.metrics?.activeUsers != null ? '2.2rem' : '1.3rem' }}
            >
              {company.metrics?.activeUsers != null ? company.metrics.activeUsers : 'Not available'}
            </div>
            <div className="sa-stat-growth neutral font-mono">Real-time session presence</div>
          </div>

          <div className="sa-stat-card">
            <span className="sa-stat-title">Storage Usage</span>
            <div
              className="sa-stat-value font-mono"
              style={{ fontSize: company.metrics?.storageUsed ? '1.4rem' : '1.3rem' }}
            >
              {company.metrics?.storageUsed || 'Not available'}
            </div>
            <div className="sa-stat-growth neutral font-mono">Isolated tenant bucket</div>
          </div>

          <div className="sa-stat-card">
            <span className="sa-stat-title">CRM Leads Managed</span>
            <div className="sa-stat-value font-mono">
              {company.metrics?.leads != null ? company.metrics.leads.toLocaleString() : 0}
            </div>
            <div className="sa-stat-growth positive font-mono">Active pipeline entities</div>
          </div>

          <div className="sa-stat-card">
            <span className="sa-stat-title">Total Customers</span>
            <div className="sa-stat-value font-mono">
              {company.metrics?.customers != null ? company.metrics.customers.toLocaleString() : 0}
            </div>
            <div className="sa-stat-growth positive font-mono">Contact directory records</div>
          </div>

          <div className="sa-stat-card">
            <span className="sa-stat-title">Deals Closed</span>
            <div
              className="sa-stat-value font-mono"
              style={{ fontSize: company.metrics?.deals != null ? '2.2rem' : '1.3rem' }}
            >
              {company.metrics?.deals != null ? company.metrics.deals.toLocaleString() : 'Not available'}
            </div>
            <div className="sa-stat-growth neutral font-mono">Won commercial opps</div>
          </div>
        </div>
      </div>

      {/* Grid: Subscription Profile + Administrator Details */}
      <div className="sa-details-dual-grid">
        {/* Subscription Info Card */}
        <div className="sa-card">
          <div className="sa-card-header">
            <div>
              <h3 className="sa-card-title">Subscription & Billing</h3>
              <p className="sa-card-subtitle">Active licensing agreement</p>
            </div>
            <Link to="/super-admin/subscriptions" className="btn btn-secondary btn-xs font-mono">
              Manage Plans
            </Link>
          </div>
          <div className="sa-card-body">
            <div className="sa-dossier-list">
              <div className="sa-dossier-row">
                <span className="sa-dossier-label">Current Plan:</span>
                <span className="sa-dossier-val font-mono font-bold text-tertiary">{company.plan}</span>
              </div>
              <div className="sa-dossier-row">
                <span className="sa-dossier-label">Billing Cycle:</span>
                <span className="sa-dossier-val font-mono">{company.billingCycle}</span>
              </div>
              <div className="sa-dossier-row">
                <span className="sa-dossier-label">Recurring Price:</span>
                <span className="sa-dossier-val font-mono font-semibold">{company.price}</span>
              </div>
              <div className="sa-dossier-row">
                <span className="sa-dossier-label">Start Date:</span>
                <span className="sa-dossier-val font-mono">{company.joinedDate}</span>
              </div>
              <div className="sa-dossier-row">
                <span className="sa-dossier-label">Next Renewal:</span>
                <span className="sa-dossier-val font-mono">{company.renewalDate}</span>
              </div>
              <div className="sa-dossier-row">
                <span className="sa-dossier-label">Subscription Status:</span>
                <span className="sa-dossier-val">
                  <StatusBadge status={company.status} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Administrator Dossier */}
        <div className="sa-card">
          <div className="sa-card-header">
            <div>
              <h3 className="sa-card-title">Primary Administrator</h3>
              <p className="sa-card-subtitle">Workspace owner credentials and points of contact</p>
            </div>
          </div>
          <div className="sa-card-body">
            <div className="sa-owner-profile-box">
              <div className="sa-owner-avatar-big font-mono">
                {company.owner?.avatar || 'AD'}
              </div>
              <div>
                <div className="sa-owner-big-name">{company.owner?.name}</div>
                <div className="sa-owner-big-email font-mono">{company.owner?.email}</div>
                {company.owner?.userId && (
                  <div className="text-xs font-mono text-tertiary mt-1">
                    User ID: <strong>{company.owner.userId}</strong>
                  </div>
                )}
                <div className="sa-badge-crown-tag font-mono mt-1">Primary Tenant Admin</div>
              </div>
            </div>

            <div className="sa-dossier-list mt-4">
              <div className="sa-dossier-row">
                <span className="sa-dossier-label">Workspace Address:</span>
                <span className="sa-dossier-val">{company.address}</span>
              </div>
              <div className="sa-dossier-row">
                <span className="sa-dossier-label">Dedicated Host:</span>
                <span className="sa-dossier-val font-mono">{company.domain}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="sa-card mt-6">
        <div className="sa-card-header">
          <div>
            <h3 className="sa-card-title">Tenant Audit Trail</h3>
            <p className="sa-card-subtitle">Recent administrative events for this organization</p>
          </div>
        </div>
        <div className="sa-card-body">
          <div className="sa-activity-timeline">
            {(company.recentActivity || []).map((item) => (
              <div key={item.id} className="sa-activity-item">
                <div className="sa-activity-indicator" style={{ borderColor: 'var(--tertiary)' }}>
                  <span className="sa-activity-core-dot" style={{ backgroundColor: 'var(--tertiary)' }}></span>
                </div>
                <div className="sa-activity-content">
                  <div className="sa-activity-title">{item.action}</div>
                  <div className="sa-activity-detail">Initiated by {item.user}</div>
                  <div className="sa-activity-time font-mono">{item.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
