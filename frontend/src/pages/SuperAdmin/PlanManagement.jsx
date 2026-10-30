import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import AdminLayout from '../../components/SuperAdmin/AdminLayout';

export default function PlanManagementPage() {
  const {
    plans,
    subscriptions,
    createPlanAction,
    updatePlanAction,
    deletePlanAction,
    loading
  } = useSuperAdmin();

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

  const handleOpenAddPlan = () => {
    setPlanModalMode('create');
    setPlanFormData({
      id: '',
      name: '',
      monthlyPrice: '',
      annualPrice: '',
      userLimit: 20,
      subtitle: '',
      features: '',
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
      monthlyPrice: plan.monthlyPrice !== undefined && plan.monthlyPrice !== null ? String(plan.monthlyPrice) : '',
      annualPrice: plan.annualPrice !== undefined && plan.annualPrice !== null ? String(plan.annualPrice) : '',
      userLimit: plan.userLimit || 20,
      subtitle: plan.subtitle || '',
      features: Array.isArray(plan.features) ? plan.features.join('\n') : (plan.features || ''),
      popular: Boolean(plan.popular || plan.isPopular)
    });
    setPlanError('');
    setPlanSuccess('');
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!planFormData.name.trim()) {
      setPlanError('Plan name is required');
      return;
    }
    if (!planFormData.monthlyPrice || isNaN(parseFloat(planFormData.monthlyPrice))) {
      setPlanError('Valid monthly price is required');
      return;
    }

    setPlanSaving(true);
    setPlanError('');
    setPlanSuccess('');

    try {
      const parsedMonthly = parseFloat(planFormData.monthlyPrice);
      const parsedAnnual = planFormData.annualPrice && !isNaN(parseFloat(planFormData.annualPrice))
        ? parseFloat(planFormData.annualPrice)
        : parsedMonthly * 12;

      const payload = {
        name: planFormData.name.trim(),
        monthlyPrice: parsedMonthly,
        annualPrice: parsedAnnual,
        userLimit: parseInt(planFormData.userLimit, 10) || 20,
        subtitle: planFormData.subtitle.trim(),
        features: planFormData.features
          ? planFormData.features.split('\n').map((f) => f.trim()).filter(Boolean)
          : [],
        popular: Boolean(planFormData.popular)
      };

      if (planModalMode === 'create') {
        await createPlanAction(payload);
        setPlanSuccess('New subscription plan created successfully!');
      } else {
        await updatePlanAction(planFormData.id, payload);
        setPlanSuccess('Subscription plan updated successfully!');
      }

      setTimeout(() => {
        setIsPlanModalOpen(false);
      }, 700);
    } catch (err) {
      setPlanError(err.message || 'Failed to save subscription plan.');
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

    // Safety pre-check: verify if plan is referenced by active subscriptions
    const matchingSubs = subscriptions.filter(
      (s) => s.plan?.toLowerCase() === deleteTargetPlan.name?.toLowerCase()
    );
    if (matchingSubs.length > 0) {
      setDeletePlanError(
        `Cannot delete plan "${deleteTargetPlan.name}": currently referenced by ${matchingSubs.length} active subscription record(s).`
      );
      return;
    }

    setDeletePlanLoading(true);
    setDeletePlanError('');
    setDeletePlanSuccess('');

    try {
      await deletePlanAction(deleteTargetPlan.id);
      setDeletePlanSuccess('Plan deleted successfully!');
      setTimeout(() => {
        setDeleteTargetPlan(null);
      }, 700);
    } catch (err) {
      setDeletePlanError('Cannot delete plan: in use by existing subscriptions or companies.');
    } finally {
      setDeletePlanLoading(false);
    }
  };

  return (
    <AdminLayout title="Subscription Settings" breadcrumb={['Subscriptions', 'Subscription Settings']}>
      <div className="sa-pm-page-container">
        {/* Navigation and Actions Row */}
        <div className="sa-pm-header-row">
          <div className="sa-pm-header-left">
            <Link to="/super-admin/subscriptions" className="sa-pm-back-btn font-mono">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Subscriptions</span>
            </Link>
            <h1 className="sa-pm-page-title">Subscription Settings</h1>

          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm font-mono flex items-center gap-2"
            onClick={handleOpenAddPlan}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>&nbsp;Add Plan</span>
          </button>
        </div>

        {/* Main Table Card */}
        <div className="sa-pm-card">
          <div className="sa-pm-card-header">
            <div>
              <h2 className="sa-pm-card-title">Plan Management</h2>
              <p className="sa-pm-card-subtitle">
                Active packaging tiers offered to multi-tenant subscriber companies
              </p>
            </div>
          </div>

          <div className="sa-table-responsive">
            <table className="sa-table sa-pm-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Billing</th>
                  <th>Seat Limit</th>
                  <th>Status</th>
                  <th>Active Subscribers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center p-6 text-muted font-mono">
                      {loading ? 'Loading subscription plans from database...' : 'No subscription plans configured in MySQL.'}
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => {
                    const activeSubCount = subscriptions.filter(
                      (s) => s.plan?.toLowerCase() === plan.name?.toLowerCase() && s.status?.toLowerCase() === 'active'
                    ).length;

                    return (
                      <tr key={plan.id}>
                        <td>
                          <div className="font-semibold text-primary flex items-center gap-2">
                            <span>{plan.name}</span>
                            {plan.popular && (
                              <span className="sa-save-badge font-mono" style={{ fontSize: '0.65rem' }}>
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="text-muted font-mono text-xs">{plan.subtitle || plan.id}</div>
                        </td>
                        <td>
                          <div>
                            <span className="font-mono font-semibold text-tertiary">
                              ₹{plan.monthlyPrice !== undefined && plan.monthlyPrice !== null
                                ? Number(plan.monthlyPrice).toLocaleString('en-IN')
                                : '—'}
                            </span>
                            <span className="text-xs text-muted font-mono"> / month</span>
                          </div>

                        </td>
                        <td>
                          <span className="sa-plan-pill font-mono">Monthly</span>
                        </td>
                        <td>
                          <span className="font-mono">{plan.userLimitText || `${plan.userLimit || 20} Users`}</span>
                        </td>
                        <td>
                          <span className="badge badge-success font-mono">
                            Active
                          </span>
                        </td>
                        <td>
                          <span className="font-mono font-medium">
                            {activeSubCount} {activeSubCount === 1 ? 'Subscriber' : 'Subscribers'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="btn btn-secondary btn-xs font-mono"
                              onClick={() => handleOpenEditPlan(plan)}
                              title="Edit Plan details & pricing"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-xs font-mono"
                              onClick={() => handleOpenDeletePlan(plan)}
                              title="Delete this Plan if unused"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
                  {planSaving ? 'Saving...' : (planModalMode === 'create' ? 'Create Plan' : 'Save Plan Changes')}
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
