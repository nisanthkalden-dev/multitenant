import React, { useState, useMemo } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import AdminLayout from '../../components/SuperAdmin/AdminLayout';
import StatCard from '../../components/SuperAdmin/StatCard';
import StatusBadge from '../../components/SuperAdmin/StatusBadge';

export default function SubscriptionsPage() {
  const {
    subscriptions,
    plans,
    updateSubscriptionAction,
    deleteSubscriptionAction,
    createPlanAction,
    updatePlanAction,
    deletePlanAction,
    loading
  } = useSuperAdmin();

  // Local interaction state
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Plan Management Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planModalMode, setPlanModalMode] = useState('create'); // 'create' | 'edit'
  const [planFormData, setPlanFormData] = useState({
    id: '',
    name: '',
    monthlyPrice: '',
    annualPrice: '',
    userLimit: 20,
    subtitle: '',
    features: '',
    popular: false
  });
  const [planSaving, setPlanSaving] = useState(false);
  const [planError, setPlanError] = useState('');
  const [planSuccess, setPlanSuccess] = useState('');

  // Delete Plan Modal State
  const [deleteTargetPlan, setDeleteTargetPlan] = useState(null);
  const [deletePlanLoading, setDeletePlanLoading] = useState(false);
  const [deletePlanError, setDeletePlanError] = useState('');
  const [deletePlanSuccess, setDeletePlanSuccess] = useState('');

  // Edit / Details Modal state
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [editFormData, setEditFormData] = useState({
    plan: '',
    price: '',
    billingCycle: 'Monthly',
    status: 'Active',
    renewalDate: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Delete Confirmation Modal state
  const [deleteTargetSub, setDeleteTargetSub] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Calculate real overview counts directly from MySQL data
  const totalSubs = subscriptions.filter((s) => s.plan !== 'No subscription').length;
  // An active subscription should belong to an active (non-suspended) company
  const activeSubs = subscriptions.filter(
    (s) =>
      s.plan !== 'No subscription' &&
      s.status?.toLowerCase() === 'active' &&
      s.companyStatus?.toLowerCase() !== 'suspended'
  ).length;
  const cancelledSubs = subscriptions.filter(
    (s) =>
      s.plan !== 'No subscription' &&
      (s.status?.toLowerCase() === 'suspended' ||
        s.status?.toLowerCase() === 'cancelled' ||
        s.companyStatus?.toLowerCase() === 'suspended')
  ).length;

  // Real MRR calculated from active subscriptions of non-suspended companies
  const calculatedMrrNumber = useMemo(() => {
    return subscriptions
      .filter(
        (s) =>
          s.plan !== 'No subscription' &&
          s.status?.toLowerCase() === 'active' &&
          s.companyStatus?.toLowerCase() !== 'suspended'
      )
      .reduce((sum, s) => {
        const rawAmt = s.price !== undefined && s.price !== null
          ? String(s.price)
          : (s.amount ? s.amount.replace(/[^0-9]/g, '') : '');
        if (!rawAmt) return sum;
        const val = parseInt(rawAmt, 10);
        if (isNaN(val)) return sum;
        return sum + (s.billingCycle?.toLowerCase() === 'annual' ? Math.round(val / 12) : val);
      }, 0);
  }, [subscriptions]);

  const totalMrrDisplay = calculatedMrrNumber > 0
    ? `₹${calculatedMrrNumber.toLocaleString('en-IN')}`
    : '₹0';

  // Helper to extract clean numeric price
  const extractNumericPrice = (sub) => {
    if (sub.price !== undefined && sub.price !== null && sub.price !== '') {
      return String(sub.price);
    }
    if (!sub.amount || sub.amount === '—') return '';
    return sub.amount.replace(/[^0-9]/g, '');
  };

  // Helper to format price for display: strictly ₹<amount>, NOT ₹<amount> / mo
  const formatDisplayPrice = (sub) => {
    if (sub.plan === 'No subscription' || !sub.amount || sub.amount === '—') {
      return '—';
    }
    const num = extractNumericPrice(sub);
    if (!num) return '₹0';
    return `₹${parseInt(num, 10).toLocaleString('en-IN')}`;
  };

  // Filter subscriptions table
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sub.companyName?.toLowerCase().includes(q) ||
        sub.companyId?.toLowerCase().includes(q) ||
        sub.plan?.toLowerCase().includes(q) ||
        sub.id?.toLowerCase().includes(q);

      const targetStatus = statusFilter.toLowerCase();
      const subStatus = sub.status?.toLowerCase();
      const compStatus = sub.companyStatus?.toLowerCase();

      const matchesStatus =
        statusFilter === 'All' ||
        subStatus === targetStatus ||
        compStatus === targetStatus ||
        (targetStatus === 'suspended' && (subStatus === 'suspended' || compStatus === 'suspended')) ||
        (targetStatus === 'active' && subStatus === 'active' && compStatus !== 'suspended');

      const matchesPlan =
        planFilter === 'All' || sub.plan?.toLowerCase() === planFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [subscriptions, searchQuery, statusFilter, planFilter]);

  const handleOpenEdit = (sub) => {
    setSelectedSubscription(sub);
    setEditFormData({
      plan: sub.plan === 'No subscription' ? 'Growth' : (sub.plan || 'Growth'),
      price: extractNumericPrice(sub) || '2499',
      billingCycle: sub.billingCycle === '—' ? 'Monthly' : (sub.billingCycle || 'Monthly'),
      status: sub.status === '—' ? 'Active' : (sub.status || 'Active'),
      renewalDate: sub.renewalDate || ''
    });
    setActionSuccess('');
    setActionError('');
  };

  const handleSaveSubscription = async (e) => {
    e.preventDefault();
    if (!selectedSubscription) return;

    // Frontend price validation
    const parsedPrice = parseFloat(editFormData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setActionError('Price must be a valid non-negative number');
      return;
    }

    setIsSaving(true);
    setActionSuccess('');
    setActionError('');

    try {
      const payload = {
        plan: editFormData.plan,
        price: parsedPrice,
        billingCycle: editFormData.billingCycle,
        status: editFormData.status,
        renewalDate: editFormData.renewalDate
      };

      await updateSubscriptionAction(selectedSubscription.id, payload);
      setActionSuccess('Subscription updated successfully in MySQL!');
      setTimeout(() => {
        setSelectedSubscription(null);
      }, 700);
    } catch (err) {
      setActionError(err.message || 'Failed to update subscription in backend');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (sub) => {
    setDeleteTargetSub(sub);
    setDeleteError('');
    setDeleteSuccess('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetSub) return;
    setIsDeleting(true);
    setDeleteError('');
    setDeleteSuccess('');

    try {
      await deleteSubscriptionAction(deleteTargetSub.id);
      setDeleteSuccess('Subscription record deleted successfully from MySQL!');
      setTimeout(() => {
        setDeleteTargetSub(null);
      }, 700);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete subscription in backend');
    } finally {
      setIsDeleting(false);
    }
  };

  // ==========================================
  // Plan Action Handlers
  // ==========================================
  const handleOpenAddPlan = () => {
    setPlanModalMode('create');
    setPlanFormData({
      id: '',
      name: '',
      monthlyPrice: '',
      annualPrice: '',
      userLimit: 20,
      subtitle: '',
      features: 'Team Members\nWorkspace Access\nCRM Pipelines\nActivity Logs',
      popular: false
    });
    setPlanError('');
    setPlanSuccess('');
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan) => {
    setPlanModalMode('edit');
    setPlanFormData({
      id: plan.id,
      name: plan.name || '',
      monthlyPrice: plan.monthlyPrice !== undefined ? String(plan.monthlyPrice) : '',
      annualPrice: plan.annualPrice !== undefined ? String(plan.annualPrice) : '',
      userLimit: plan.userLimit || 20,
      subtitle: plan.subtitle || '',
      features: Array.isArray(plan.features) ? plan.features.join('\n') : (plan.features || ''),
      popular: Boolean(plan.popular)
    });
    setPlanError('');
    setPlanSuccess('');
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!planFormData.name || !planFormData.monthlyPrice) {
      setPlanError('Plan name and monthly price are required.');
      return;
    }

    setPlanSaving(true);
    setPlanError('');
    setPlanSuccess('');

    try {
      const payload = {
        id: planFormData.id || undefined,
        name: planFormData.name.trim(),
        monthlyPrice: parseFloat(planFormData.monthlyPrice),
        annualPrice: planFormData.annualPrice
          ? parseFloat(planFormData.annualPrice)
          : parseFloat(planFormData.monthlyPrice) * 12,
        userLimit: parseInt(planFormData.userLimit, 10) || 20,
        userLimitText: `${parseInt(planFormData.userLimit, 10) || 20} Team Members`,
        subtitle: planFormData.subtitle.trim(),
        features: planFormData.features
          ? planFormData.features.split('\n').map(s => s.trim()).filter(Boolean)
          : [],
        popular: Boolean(planFormData.popular)
      };

      if (planModalMode === 'create') {
        await createPlanAction(payload);
        setPlanSuccess('Plan created and saved to MySQL!');
      } else {
        await updatePlanAction(planFormData.id, payload);
        setPlanSuccess('Plan updated and saved in MySQL!');
      }

      setTimeout(() => {
        setIsPlanModalOpen(false);
      }, 700);
    } catch (err) {
      setPlanError(err.message || 'Failed to save plan in database');
    } finally {
      setPlanSaving(false);
    }
  };

  const handleOpenDeletePlan = (plan) => {
    setDeleteTargetPlan(plan);
    setDeletePlanError('');
    setDeletePlanSuccess('');
  };

  const handleConfirmDeletePlan = async () => {
    if (!deleteTargetPlan) return;
    setDeletePlanLoading(true);
    setDeletePlanError('');
    setDeletePlanSuccess('');

    try {
      await deletePlanAction(deleteTargetPlan.id);
      setDeletePlanSuccess('Plan deleted successfully from MySQL!');
      setTimeout(() => {
        setDeleteTargetPlan(null);
      }, 700);
    } catch (err) {
      setDeletePlanError(err.message || 'Cannot delete plan: in use by existing subscriptions or companies.');
    } finally {
      setDeletePlanLoading(false);
    }
  };

  return (
    <AdminLayout title="Subscription Governance" breadcrumb={['Subscriptions']}>
      {/* 1. Real Subscription Overview Stat Cards */}
      <div className="sa-stats-grid">
        <StatCard
          title="Total Subscriptions"
          value={totalSubs}
          growth={totalSubs > 0 ? `${totalSubs} live records` : 'No subscriptions'}
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
          growth={totalSubs > 0 ? `${Math.round((activeSubs / totalSubs) * 100)}% active` : '0%'}
          trend="positive"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          }
        />
        <StatCard
          title="Cancelled / Suspended"
          value={cancelledSubs}
          growth={cancelledSubs > 0 ? `${cancelledSubs} accounts` : 'Clean status'}
          trend={cancelledSubs > 0 ? 'negative' : 'neutral'}
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
          value={totalMrrDisplay}
          growth={calculatedMrrNumber > 0 ? 'Real database calculation' : 'No active revenue'}
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
          {/* Controls: Add Plan + Billing Cycle Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn btn-primary btn-sm font-mono flex items-center gap-1"
              onClick={handleOpenAddPlan}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Plan</span>
            </button>
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
        </div>

        <div className="sa-card-body">
          <div className="sa-plans-grid">
            {plans.map((plan) => {
              const activeCountForPlan = subscriptions.filter(
                (s) => s.plan?.toLowerCase() === plan.name?.toLowerCase() && s.status?.toLowerCase() === 'active'
              ).length;

              return (
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
                    <div className="flex items-center justify-between">
                      <h3 className="sa-plan-name">{plan.name}</h3>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs font-mono"
                          onClick={() => handleOpenEditPlan(plan)}
                          title="Edit plan"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-xs font-mono"
                          onClick={() => handleOpenDeletePlan(plan)}
                          title="Delete plan"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="sa-plan-desc">{plan.subtitle}</p>
                  </div>

                  <div className="sa-plan-pricing-box">
                    <div className="sa-plan-price font-mono">
                      {billingCycle === 'annual'
                        ? `₹${Math.round(plan.annualPrice / 12).toLocaleString('en-IN')}`
                        : (plan.priceDisplay ? plan.priceDisplay.replace(/\s*\/\s*(mo|yr|month|year|monthly)/i, '') : `₹${plan.monthlyPrice}`)}/month
                    </div>
                    <div className="sa-plan-user-limit font-mono">{plan.userLimitText || `${plan.userLimit} Team Members`}</div>
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
                  <ul className="sa-plan-feature-list">
                    {plan.features?.map((feat, idx) => (
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
                      <span>{activeCountForPlan} Active Subscriptions</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Real Subscriptions Table & Mobile Cards */}
      <div className="sa-card p-0 overflow-hidden sa-subs-container">
        <div className="sa-card-header sa-subs-header">
          <div>
            <h3 className="sa-card-title">Live Subscriptions</h3>
            <p className="sa-card-subtitle">
              Active and historical subscriber billing records in MySQL ({filteredSubscriptions.length})
            </p>
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
              <option value="Pending">Pending</option>
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

        {loading ? (
          <div className="sa-empty-state">
            <div className="spinner-dot"></div>
            <p className="sa-empty-desc font-mono mt-3">Loading subscriptions from database...</p>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="sa-empty-state">
            <div className="sa-empty-icon">💳</div>
            <h3 className="sa-empty-title">No subscriptions found</h3>
            <p className="sa-empty-desc">
              No subscription records currently exist in the database matching your filters.
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
                    <th>Price</th>
                    <th>Company Status</th>
                    <th>Subscription Status</th>
                    <th>Start Date</th>
                    <th>Renewal Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <div className="sa-sub-company-name font-semibold">{sub.companyName || sub.companyId}</div>
                        <div className="sa-sub-id font-mono">{sub.id}</div>
                      </td>
                      <td>
                        <span className={`sa-plan-pill font-mono ${sub.plan === 'No subscription' ? 'opacity-70' : ''}`}>
                          {sub.plan}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono">{sub.billingCycle}</span>
                      </td>
                      <td>
                        <span className="font-mono font-semibold text-tertiary">
                          {formatDisplayPrice(sub)}
                        </span>
                      </td>
                      <td>
                        {sub.companyStatus ? (
                          <StatusBadge status={sub.companyStatus} />
                        ) : (
                          <span className="text-muted font-mono text-xs">—</span>
                        )}
                      </td>
                      <td>
                        {sub.status !== '—' ? (
                          <StatusBadge status={sub.status} />
                        ) : (
                          <span className="text-muted font-mono text-xs">—</span>
                        )}
                      </td>
                      <td>
                        <span className="font-mono sa-date-cell">{sub.startDate || '—'}</span>
                      </td>
                      <td>
                        <span className="font-mono sa-date-cell">{sub.renewalDate || '—'}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs font-mono flex items-center gap-1"
                            onClick={() => handleOpenEdit(sub)}
                            title="Edit subscription"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          {sub.plan !== 'No subscription' && (
                            <button
                              type="button"
                              className="btn btn-danger btn-xs font-mono flex items-center gap-1"
                              onClick={() => handleOpenDelete(sub)}
                              title="Delete subscription"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              Delete
                            </button>
                          )}
                        </div>
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
                      <h4 className="sa-sub-card-title">{sub.companyName || sub.companyId}</h4>
                      <span className="sa-sub-id font-mono">{sub.id}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {sub.status !== '—' && <StatusBadge status={sub.status} />}
                      {sub.companyStatus && (
                        <span className="text-xs text-muted font-mono">
                          Co: <StatusBadge status={sub.companyStatus} />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sa-sub-card-grid font-mono">
                    <div className="sa-sub-meta-item">
                      <span className="sa-sub-meta-lbl">Plan:</span>
                      <span className="sa-plan-pill">{sub.plan}</span>
                    </div>
                    <div className="sa-sub-meta-item">
                      <span className="sa-sub-meta-lbl">Price:</span>
                      <span className="font-semibold text-tertiary">
                        {formatDisplayPrice(sub)}
                      </span>
                    </div>
                    <div className="sa-sub-meta-item">
                      <span className="sa-sub-meta-lbl">Cycle:</span>
                      <span>{sub.billingCycle}</span>
                    </div>
                    <div className="sa-sub-meta-item">
                      <span className="sa-sub-meta-lbl">Renewal:</span>
                      <span className="sa-date-cell">{sub.renewalDate || '—'}</span>
                    </div>
                  </div>

                  <div className="sa-sub-card-bottom">
                    <span className="sa-sub-start-date font-mono">
                      Started: {sub.startDate || '—'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs font-mono"
                        onClick={() => handleOpenEdit(sub)}
                      >
                        Edit
                      </button>
                      {sub.plan !== 'No subscription' && (
                        <button
                          type="button"
                          className="btn btn-danger btn-xs font-mono"
                          onClick={() => handleOpenDelete(sub)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit / Manage Subscription Modal Connected to Backend */}
      {selectedSubscription && (
        <div className="sa-modal-backdrop" onClick={() => setSelectedSubscription(null)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">
                Edit Subscription: {selectedSubscription.companyName || selectedSubscription.id}
              </h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setSelectedSubscription(null)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveSubscription}>
              <div className="sa-modal-body">
                {actionSuccess && (
                  <div className="auth-alert alert-success font-mono mb-3">
                    <span>{actionSuccess}</span>
                  </div>
                )}
                {actionError && (
                  <div className="auth-alert alert-error font-mono mb-3">
                    <span>{actionError}</span>
                  </div>
                )}

                <div className="form-group mb-3">
                  <label className="form-label">Subscription ID</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={selectedSubscription.id}
                    disabled
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Plan</label>
                  <select
                    className="form-input font-mono"
                    value={editFormData.plan}
                    onChange={(e) => setEditFormData({ ...editFormData, plan: e.target.value })}
                  >
                    <option value="Starter">Starter</option>
                    <option value="Growth">Growth</option>
                    <option value="Scale">Scale</option>
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Price (₹)</label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-tertiary">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      className="form-input font-mono"
                      value={editFormData.price}
                      placeholder="e.g. 299"
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    />
                  </div>
                  <span className="text-muted font-mono text-xs mt-1 block">
                    Stored as numeric decimal value in database (displayed as ₹{editFormData.price || '0'})
                  </span>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Billing Cycle</label>
                  <select
                    className="form-input font-mono"
                    value={editFormData.billingCycle}
                    onChange={(e) => setEditFormData({ ...editFormData, billingCycle: e.target.value })}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Subscription Status</label>
                  <select
                    className="form-input font-mono"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Renewal / Expiry Date</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={editFormData.renewalDate}
                    placeholder="e.g. Nov 24, 2026"
                    onChange={(e) => setEditFormData({ ...editFormData, renewalDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Features Included</label>
                <textarea
                  className="form-input font-mono"
                  rows="4"
                  defaultValue={(selectedPlanModal.features || []).join('\n')}
                />
              <div className="sa-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm font-mono"
                  onClick={() => setSelectedSubscription(null)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm font-mono"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving to Database...' : 'Save Subscription Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetSub && (
        <div className="sa-modal-backdrop" onClick={() => !isDeleting && setDeleteTargetSub(null)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Delete Subscription</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => !isDeleting && setDeleteTargetSub(null)}
              >
                &times;
              </button>
            </div>
            <div className="sa-modal-body">
              {deleteSuccess && (
                <div className="auth-alert alert-success font-mono mb-3">
                  <span>{deleteSuccess}</span>
                </div>
              )}
              {deleteError && (
                <div className="auth-alert alert-error font-mono mb-3">
                  <span>{deleteError}</span>
                </div>
              )}
              <p className="mb-3">
                Are you sure you want to delete this subscription?
              </p>
              <div className="sa-modal-details-box p-3 border rounded bg-slate-900 font-mono text-sm">
                <div><strong>Company:</strong> {deleteTargetSub.companyName || deleteTargetSub.companyId}</div>
                <div><strong>Plan:</strong> {deleteTargetSub.plan}</div>
                <div><strong>Price:</strong> {formatDisplayPrice(deleteTargetSub)}</div>
                <div><strong>Subscription ID:</strong> {deleteTargetSub.id}</div>
              </div>
              <p className="text-muted font-mono text-xs mt-3">
                Notice: Deleting this subscription will remove only the subscription record. The company, admin, employees, and tenant workspace data will remain completely intact.
              </p>
            </div>
            <div className="sa-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm font-mono"
                onClick={() => setDeleteTargetSub(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm font-mono"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Create / Edit Modal */}
      {isPlanModalOpen && (
        <div className="sa-modal-backdrop" onClick={() => !planSaving && setIsPlanModalOpen(false)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">
                {planModalMode === 'create' ? 'Create New Subscription Plan' : `Edit Plan: ${planFormData.name}`}
              </h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => !planSaving && setIsPlanModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSavePlan}>
              <div className="sa-modal-body">
                {planSuccess && (
                  <div className="auth-alert alert-success font-mono mb-3">
                    <span>{planSuccess}</span>
                  </div>
                )}
                {planError && (
                  <div className="auth-alert alert-error font-mono mb-3">
                    <span>{planError}</span>
                  </div>
                )}

                <div className="form-group mb-3">
                  <label className="form-label">Plan Name</label>
                  <input
                    type="text"
                    required
                    className="form-input font-mono"
                    placeholder="e.g. Starter, Professional, Enterprise"
                    value={planFormData.name}
                    onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Monthly Price (₹)</label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-tertiary">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      className="form-input font-mono"
                      placeholder="e.g. 299"
                      value={planFormData.monthlyPrice}
                      onChange={(e) => setPlanFormData({ ...planFormData, monthlyPrice: e.target.value })}
                    />
                  </div>
                  <span className="text-muted font-mono text-xs mt-1 block">
                    Actual MySQL database price. Change from ₹999 to ₹299 to update globally.
                  </span>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Annual Price (₹) (Optional - Defaults to Monthly × 12)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="form-input font-mono"
                    placeholder="e.g. 3000"
                    value={planFormData.annualPrice}
                    onChange={(e) => setPlanFormData({ ...planFormData, annualPrice: e.target.value })}
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Maximum Users Limit</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-input font-mono"
                    placeholder="e.g. 5, 20, 50"
                    value={planFormData.userLimit}
                    onChange={(e) => setPlanFormData({ ...planFormData, userLimit: e.target.value })}
                  />
                  <span className="text-muted font-mono text-xs mt-1 block">
                    Enforced by backend when company users/seats are added.
                  </span>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Plan Subtitle</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. For growing teams expanding sales operations"
                    value={planFormData.subtitle}
                    onChange={(e) => setPlanFormData({ ...planFormData, subtitle: e.target.value })}
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Features Included (One feature per line)</label>
                  <textarea
                    rows="4"
                    className="form-input font-mono"
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    value={planFormData.features}
                    onChange={(e) => setPlanFormData({ ...planFormData, features: e.target.value })}
                  />
                </div>

                <div className="form-group mb-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="planPopularCheckbox"
                    checked={planFormData.popular}
                    onChange={(e) => setPlanFormData({ ...planFormData, popular: e.target.checked })}
                  />
                  <label htmlFor="planPopularCheckbox" className="font-mono text-sm cursor-pointer select-none">
                    Mark as Popular Tier
                  </label>
                </div>
              </div>

              <div className="sa-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm font-mono"
                  onClick={() => setIsPlanModalOpen(false)}
                  disabled={planSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm font-mono"
                  disabled={planSaving}
                >
                  {planSaving ? 'Saving to Database...' : (planModalMode === 'create' ? 'Create Plan in MySQL' : 'Save Plan Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Plan Confirmation Modal */}
      {deleteTargetPlan && (
        <div className="sa-modal-backdrop" onClick={() => !deletePlanLoading && setDeleteTargetPlan(null)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Delete Plan</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => !deletePlanLoading && setDeleteTargetPlan(null)}
              >
                &times;
              </button>
            </div>
            <div className="sa-modal-body">
              {deletePlanSuccess && (
                <div className="auth-alert alert-success font-mono mb-3">
                  <span>{deletePlanSuccess}</span>
                </div>
              )}
              {deletePlanError && (
                <div className="auth-alert alert-error font-mono mb-3">
                  <span>{deletePlanError}</span>
                </div>
              )}
              <p className="mb-3">
                Are you sure you want to delete this plan?
              </p>
              <div className="sa-modal-details-box p-3 border rounded bg-slate-900 font-mono text-sm">
                <div><strong>Plan Name:</strong> {deleteTargetPlan.name}</div>
                <div><strong>Monthly Price:</strong> ₹{deleteTargetPlan.monthlyPrice}</div>
                <div><strong>User Limit:</strong> {deleteTargetPlan.userLimit} Users</div>
                <div><strong>Plan ID:</strong> {deleteTargetPlan.id}</div>
              </div>
              <p className="text-muted font-mono text-xs mt-3">
                Safety Guarantee: The backend prevents deletion if any companies or subscriptions currently use this plan.
              </p>
            </div>
            <div className="sa-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm font-mono"
                onClick={() => setDeleteTargetPlan(null)}
                disabled={deletePlanLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm font-mono"
                onClick={handleConfirmDeletePlan}
                disabled={deletePlanLoading}
              >
                {deletePlanLoading ? 'Checking & Deleting...' : 'Confirm Delete Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
