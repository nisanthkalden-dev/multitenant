import React, { useState, useMemo } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import AdminLayout from '../../components/SuperAdmin/AdminLayout';
import StatCard from '../../components/SuperAdmin/StatCard';
import StatusBadge from '../../components/SuperAdmin/StatusBadge';

export default function SubscriptionsPage() {
  const { subscriptions, plans } = useSuperAdmin();

  // Local interaction state
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Plan / Details Modal state
  const [selectedPlanModal, setSelectedPlanModal] = useState(null);

  // Calculate overview counts
  const totalSubs = subscriptions.length;
  const activeSubs = subscriptions.filter((s) => s.status === 'Active').length;
  const expiringSoon = 3;
  const cancelledSubs = subscriptions.filter((s) => s.status === 'Suspended' || s.status === 'Cancelled').length;
  const totalMrr = '₹8,42,500';

  // Filter subscriptions table
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sub.companyName.toLowerCase().includes(q) ||
        sub.plan.toLowerCase().includes(q) ||
        sub.id.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'All' || sub.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesPlan =
        planFilter === 'All' || sub.plan.toLowerCase() === planFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [subscriptions, searchQuery, statusFilter, planFilter]);

  return (
    <AdminLayout title="Subscription Governance" breadcrumb={['Subscriptions']}>
      {/* 1. Subscription Overview Stat Cards */}
      <div className="sa-stats-grid">
        <StatCard
          title="Total Subscriptions"
          value={totalSubs}
          growth="+12 vs last month"
          trend="positive"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          }
        />
        <StatCard
          title="Active Subscriptions"
          value={activeSubs}
          growth="87.5% retention"
          trend="positive"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          }
        />
        <StatCard
          title="Expiring Soon"
          value={expiringSoon}
          growth="Renewals due < 7 days"
          trend="neutral"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          }
        />
        <StatCard
          title="Cancelled / Suspended"
          value={cancelledSubs}
          growth="Payment overdue"
          trend="negative"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          }
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={totalMrr}
          growth="+14.8% growth"
          trend="positive"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          }
        />
      </div>

      {/* 2. Subscription Plans Section */}
      <div className="sa-card mb-6">
        <div className="sa-card-header">
          <div>
            <h2 className="sa-card-title">Platform Tier Offerings</h2>
            <p className="sa-card-subtitle">
              Configured packaging and license boundaries offered to multi-tenant customers
            </p>
          </div>
          {/* Billing Cycle Toggle */}
          <div className="sa-billing-toggle-wrap">
            <button
              type="button"
              className={`sa-billing-toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              className={`sa-billing-toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual Billing <span className="sa-save-badge font-mono">SAVE 20%</span>
            </button>
          </div>
        </div>

        <div className="sa-card-body">
          <div className="sa-plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`sa-plan-tier-card ${plan.popular ? 'popular' : ''}`}
              >
                {plan.popular && (
                  <div className="sa-plan-popular-pill font-mono">
                    ★ Most Popular
                  </div>
                )}
                <div className="sa-plan-top">
                  <h3 className="sa-plan-name">{plan.name}</h3>
                  <p className="sa-plan-desc">{plan.subtitle}</p>
                </div>

                <div className="sa-plan-pricing-box">
                  <div className="sa-plan-price font-mono">
                    {billingCycle === 'annual'
                      ? `₹${(plan.annualPrice / 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                      : plan.priceDisplay}
                    <span className="sa-plan-period font-mono"> / mo</span>
                  </div>
                  <div className="sa-plan-user-limit font-mono">{plan.userLimitText}</div>
                </div>

                <ul className="sa-plan-feature-list">
                  {(plan.features || []).map((feat, idx) => (
                    <li key={idx} className="sa-plan-feature-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="sa-plan-card-footer">
                  <div className="sa-plan-stats font-mono">
                    <span>{plan.stats?.activeCompanies ?? '—'} Companies</span>
                    <span>{plan.stats?.mrrContribution ?? '—'} MRR</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-full font-mono mt-3"
                    onClick={() => setSelectedPlanModal(plan)}
                  >
                    Configure Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Recent Subscriptions Table & Mobile Cards */}
      <div className="sa-card p-0 overflow-hidden sa-subs-container">
        <div className="sa-card-header sa-subs-header">
          <div>
            <h3 className="sa-card-title">Recent Subscriptions</h3>
            <p className="sa-card-subtitle">Active and historical subscriber billing records ({filteredSubscriptions.length})</p>
          </div>

          <div className="sa-table-header-filters">
            <div className="sa-filter-search-box">
              <input
                type="text"
                className="sa-search-input font-mono"
                placeholder="Search subscriber..."
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

            <select
              className="sa-select-input font-mono"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>

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
        </div>

        {filteredSubscriptions.length === 0 ? (
          <div className="sa-empty-state">
            <div className="sa-empty-icon">💳</div>
            <h3 className="sa-empty-title">No subscriptions match</h3>
            <p className="sa-empty-desc">
              Try adjusting your search query or filters to view billing records.
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
            {/* Desktop & Laptop Table View */}
            <div className="sa-table-responsive sa-subs-desktop-table">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Plan</th>
                    <th>Billing Cycle</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>Renewal Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <div className="sa-sub-company-name font-semibold">{sub.companyName}</div>
                        <div className="sa-sub-id font-mono">{sub.id}</div>
                      </td>
                      <td>
                        <span className="sa-plan-pill font-mono">{sub.plan}</span>
                      </td>
                      <td>
                        <span className="font-mono">{sub.billingCycle}</span>
                      </td>
                      <td>
                        <span className="font-mono font-semibold">{sub.amount}</span>
                      </td>
                      <td>
                        <StatusBadge status={sub.status} />
                      </td>
                      <td>
                        <span className="font-mono sa-date-cell">{sub.startDate}</span>
                      </td>
                      <td>
                        <span className="font-mono sa-date-cell">{sub.renewalDate}</span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs font-mono"
                          onClick={() =>
                            alert(
                              `Subscription Record: ${sub.id}\nCompany: ${sub.companyName}\nPlan: ${sub.plan}\nAmount: ${sub.amount}\nAuto-Renew: ${sub.autoRenew ? 'Enabled' : 'Disabled'}`
                            )
                          }
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Adaptive Cards View (Under 768px) */}
            <div className="sa-subs-mobile-list">
              {filteredSubscriptions.map((sub) => (
                <div key={sub.id} className="sa-sub-card">
                  <div className="sa-sub-card-top">
                    <div>
                      <h4 className="sa-sub-card-title">{sub.companyName}</h4>
                      <span className="sa-sub-id font-mono">{sub.id}</span>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>

                  <div className="sa-sub-card-grid font-mono">
                    <div className="sa-sub-meta-item">
                      <span className="sa-sub-meta-lbl">Plan:</span>
                      <span className="sa-plan-pill">{sub.plan}</span>
                    </div>
                    <div className="sa-sub-meta-item">
                      <span className="sa-sub-meta-lbl">Amount:</span>
                      <span className="font-semibold text-tertiary">{sub.amount}</span>
                    </div>
                    <div className="sa-sub-meta-item">
                      <span className="sa-sub-meta-lbl">Cycle:</span>
                      <span>{sub.billingCycle}</span>
                    </div>
                    <div className="sa-sub-meta-item">
                      <span className="sa-sub-meta-lbl">Renewal:</span>
                      <span className="sa-date-cell">{sub.renewalDate}</span>
                    </div>
                  </div>

                  <div className="sa-sub-card-bottom">
                    <span className="sa-sub-start-date font-mono">
                      Started: {sub.startDate}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs font-mono"
                      onClick={() =>
                        alert(
                          `Subscription Record: ${sub.id}\nCompany: ${sub.companyName}\nPlan: ${sub.plan}\nAmount: ${sub.amount}\nAuto-Renew: ${sub.autoRenew ? 'Enabled' : 'Disabled'}`
                        )
                      }
                    >
                      Details &bull;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Plan Modal (Frontend interaction only) */}
      {selectedPlanModal && (
        <div className="sa-modal-backdrop" onClick={() => setSelectedPlanModal(null)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Configure {selectedPlanModal.name} Plan</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setSelectedPlanModal(null)}
              >
                &times;
              </button>
            </div>
            <div className="sa-modal-body">
              <div className="form-group mb-3">
                <label className="form-label">Plan Name</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  defaultValue={selectedPlanModal.name}
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Monthly Rate (₹)</label>
                <input
                  type="number"
                  className="form-input font-mono"
                  defaultValue={selectedPlanModal.monthlyPrice}
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Seat Limit</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  defaultValue={selectedPlanModal.userLimitText}
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Features Included</label>
                <textarea
                  className="form-input font-mono"
                  rows="4"
                  defaultValue={(selectedPlanModal.features || []).join('\n')}
                />
              </div>
            </div>
            <div className="sa-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm font-mono"
                onClick={() => setSelectedPlanModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm font-mono"
                onClick={() => {
                  alert('Plan configurations updated in local React state.');
                  setSelectedPlanModal(null);
                }}
              >
                Save Plan Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
