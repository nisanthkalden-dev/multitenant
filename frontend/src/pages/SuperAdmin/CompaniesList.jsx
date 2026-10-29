import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import AdminLayout from '../../components/SuperAdmin/AdminLayout';
import StatusBadge from '../../components/SuperAdmin/StatusBadge';

export default function CompaniesList() {
  const { companies, loading, updateCompanyStatus, deleteCompany } = useSuperAdmin();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Confirmation Modal state for Suspend / Delete
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: null, // 'suspend' | 'activate' | 'delete'
    company: null
  });

  // Filtered and Sorted list using React state only
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((comp) => {
        // Search filter
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          comp.name?.toLowerCase().includes(query) ||
          comp.owner?.name?.toLowerCase().includes(query) ||
          comp.owner?.email?.toLowerCase().includes(query) ||
          comp.domain?.toLowerCase().includes(query);

        // Status filter
        const matchesStatus =
          statusFilter === 'All' || comp.status.toLowerCase() === statusFilter.toLowerCase();

        // Plan filter
        const matchesPlan =
          planFilter === 'All' || comp.plan.toLowerCase() === planFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesPlan;
      })
      .sort((a, b) => {
        if (sortBy === 'Newest') return b.id.localeCompare(a.id);
        if (sortBy === 'Oldest') return a.id.localeCompare(b.id);
        if (sortBy === 'Company Name') return a.name.localeCompare(b.name);
        if (sortBy === 'Highest Users') return b.usersCount - a.usersCount;
        return 0;
      });
  }, [companies, searchQuery, statusFilter, planFilter, sortBy]);

  const handleActionConfirm = () => {
    if (!actionModal.company) return;
    const { company, type } = actionModal;

    if (type === 'suspend') {
      updateCompanyStatus(company.id, 'Suspended');
    } else if (type === 'activate') {
      updateCompanyStatus(company.id, 'Active');
    } else if (type === 'delete') {
      deleteCompany(company.id);
    }

    setActionModal({ isOpen: false, type: null, company: null });
  };

  return (
    <AdminLayout title="Organizations & Companies" breadcrumb={['Companies']}>
      {/* Page Header */}
      <div className="sa-section-header">
        <div>
          <h2 className="sa-section-title">Companies</h2>
          <p className="sa-section-subtitle">
            Manage organizations using the NEXORA CRM platform. ({filteredCompanies.length} visible)
          </p>
        </div>
        <Link to="/super-admin/companies/add" className="btn btn-primary font-mono">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add Company</span>
        </Link>
      </div>

      {/* Toolbar: Search, Filters, and Sorting */}
      <div className="sa-toolbar-card">
        <div className="sa-toolbar-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="sa-search-input font-mono"
            placeholder="Search companies, domains, owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="sa-clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        <div className="sa-toolbar-filters">
          {/* Status Filter */}
          <div className="sa-filter-group">
            <label className="sa-filter-label font-mono">Status:</label>
            <select
              className="sa-select-input font-mono"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Subscription Plan Filter */}
          <div className="sa-filter-group">
            <label className="sa-filter-label font-mono">Plan:</label>
            <select
              className="sa-select-input font-mono"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="All">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Growth">Growth</option>
              <option value="Scale">Scale</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="sa-filter-group">
            <label className="sa-filter-label font-mono">Sort By:</label>
            <select
              className="sa-select-input font-mono"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
              <option value="Company Name">Company Name (A-Z)</option>
              <option value="Highest Users">Highest Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive Companies Table */}
      <div className="sa-card p-0 overflow-hidden">
        {filteredCompanies.length === 0 ? (
          <div className="sa-empty-state">
            <div className="sa-empty-icon">🏢</div>
            <h3 className="sa-empty-title">No companies found</h3>
            <p className="sa-empty-desc">
              Try adjusting your search query or filter settings to view registered organizations.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm font-mono"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setPlanFilter('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop & Laptop Table */}
            <div className="sa-table-responsive sa-desktop-only-table">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Admin / Owner</th>
                    <th>Plan</th>
                    <th>Users</th>
                    <th>Status</th>
                    <th>Registration Date</th>
                    <th>Subscription</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((comp) => (
                    <tr key={comp.id}>
                      <td>
                        <div className="sa-company-cell">
                          <div
                            className="sa-company-logo font-mono"
                            style={{ backgroundColor: `${comp.logoColor}20`, color: comp.logoColor }}
                          >
                            {comp.logo}
                          </div>
                          <div>
                            <Link
                              to={`/super-admin/companies/${comp.id}`}
                              className="sa-company-name font-semibold hover-link"
                            >
                              {comp.name}
                            </Link>
                            <div className="sa-company-sub font-mono">{comp.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="sa-owner-name">{comp.owner?.name || 'Admin'}</div>
                        <div className="sa-owner-email font-mono">{comp.owner?.email || comp.email}</div>
                      </td>
                      <td>
                        <span className="sa-plan-pill font-mono">{comp.plan}</span>
                      </td>
                      <td>
                        <div className="sa-users-bar-wrap">
                          <span className="font-mono">{comp.usersCount} / {comp.userLimit}</span>
                          <div className="sa-mini-progress">
                            <div
                              className="sa-mini-progress-bar"
                              style={{
                                width: `${Math.min(100, (comp.usersCount / comp.userLimit) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={comp.status} />
                      </td>
                      <td>
                        <span className="sa-date-cell font-mono">{comp.joinedDate}</span>
                      </td>
                      <td>
                        <div className="sa-sub-info font-mono">
                          <span className="sa-price-val">{comp.price}</span>
                          <span className="sa-cycle-lbl">{comp.billingCycle}</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="sa-actions-row">
                          <Link
                            to={`/super-admin/companies/${comp.id}`}
                            className="btn btn-secondary btn-xs font-mono"
                            title="View Company Dossier"
                          >
                            View
                          </Link>
                          {comp.status === 'Active' ? (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-xs font-mono"
                              onClick={() =>
                                setActionModal({ isOpen: true, type: 'suspend', company: comp })
                              }
                              title="Suspend Company Workspace"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-outline-success btn-xs font-mono"
                              onClick={() =>
                                setActionModal({ isOpen: true, type: 'activate', company: comp })
                              }
                              title="Reactivate Company"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs font-mono sa-btn-icon"
                            onClick={() =>
                              setActionModal({ isOpen: true, type: 'delete', company: comp })
                            }
                            title="Delete Company"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Friendly Cards View (<= 768px) */}
            <div className="sa-mobile-only-cards">
              {filteredCompanies.map((comp) => (
                <div key={comp.id} className="sa-mobile-entity-card">
                  <div className="sa-mobile-card-top">
                    <div className="sa-company-cell">
                      <div
                        className="sa-company-logo font-mono"
                        style={{ backgroundColor: `${comp.logoColor}20`, color: comp.logoColor }}
                      >
                        {comp.logo}
                      </div>
                      <div>
                        <Link
                          to={`/super-admin/companies/${comp.id}`}
                          className="sa-company-name font-semibold hover-link"
                        >
                          {comp.name}
                        </Link>
                        <div className="sa-company-sub font-mono">{comp.domain}</div>
                      </div>
                    </div>
                    <StatusBadge status={comp.status} />
                  </div>

                  <div className="sa-mobile-card-details font-mono">
                    <div className="sa-mobile-meta-row">
                      <span className="sa-meta-lbl">Admin:</span>
                      <span className="sa-meta-val">{comp.owner?.name || 'Admin'}</span>
                    </div>
                    <div className="sa-mobile-meta-row">
                      <span className="sa-meta-lbl">Plan:</span>
                      <span className="sa-plan-pill">{comp.plan}</span>
                    </div>
                    <div className="sa-mobile-meta-row">
                      <span className="sa-meta-lbl">Seats:</span>
                      <span className="sa-meta-val">{comp.usersCount} / {comp.userLimit}</span>
                    </div>
                    <div className="sa-mobile-meta-row">
                      <span className="sa-meta-lbl">Billing:</span>
                      <span className="sa-meta-val text-tertiary">{comp.price}</span>
                    </div>
                    <div className="sa-mobile-meta-row">
                      <span className="sa-meta-lbl">Registered:</span>
                      <span className="sa-meta-val sa-date-cell">{comp.joinedDate}</span>
                    </div>
                  </div>

                  <div className="sa-mobile-card-footer">
                    <Link
                      to={`/super-admin/companies/${comp.id}`}
                      className="btn btn-secondary btn-xs font-mono"
                    >
                      Dossier
                    </Link>
                    {comp.status === 'Active' ? (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-xs font-mono"
                        onClick={() =>
                          setActionModal({ isOpen: true, type: 'suspend', company: comp })
                        }
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline-success btn-xs font-mono"
                        onClick={() =>
                          setActionModal({ isOpen: true, type: 'activate', company: comp })
                        }
                      >
                        Activate
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs font-mono sa-btn-icon"
                      onClick={() =>
                        setActionModal({ isOpen: true, type: 'delete', company: comp })
                      }
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {actionModal.isOpen && (
        <div className="sa-modal-backdrop" onClick={() => setActionModal({ isOpen: false, type: null, company: null })}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">
                {actionModal.type === 'suspend' && 'Suspend Company Access'}
                {actionModal.type === 'activate' && 'Reactivate Company Workspace'}
                {actionModal.type === 'delete' && 'Delete Company Record'}
              </h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setActionModal({ isOpen: false, type: null, company: null })}
              >
                &times;
              </button>
            </div>
            <div className="sa-modal-body">
              <p>
                {actionModal.type === 'suspend' && (
                  <>
                    Are you sure you want to suspend <strong>{actionModal.company?.name}</strong>? All organization users will be temporarily locked from logging in until re-enabled.
                  </>
                )}
                {actionModal.type === 'activate' && (
                  <>
                    Reactivate <strong>{actionModal.company?.name}</strong>? Tenant users will immediately regain access to CRM leads and pipelines.
                  </>
                )}
                {actionModal.type === 'delete' && (
                  <>
                    Are you sure you want to remove <strong>{actionModal.company?.name}</strong> from the local platform registry? This is a frontend demo interaction.
                  </>
                )}
              </p>
            </div>
            <div className="sa-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm font-mono"
                onClick={() => setActionModal({ isOpen: false, type: null, company: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-sm font-mono ${
                  actionModal.type === 'delete' || actionModal.type === 'suspend'
                    ? 'btn-danger'
                    : 'btn-primary'
                }`}
                onClick={handleActionConfirm}
              >
                {actionModal.type === 'suspend' && 'Confirm Suspension'}
                {actionModal.type === 'activate' && 'Confirm Activation'}
                {actionModal.type === 'delete' && 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
