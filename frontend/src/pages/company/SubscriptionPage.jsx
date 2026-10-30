import React, { useState, useEffect } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { subscriptionApi } from '../../api/subscriptionApi';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Growth');
  const [selectedCycle, setSelectedCycle] = useState('Monthly');
  const [upgrading, setUpgrading] = useState(false);

  const loadSub = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subData, plansData] = await Promise.all([
        subscriptionApi.getCurrentSubscription(),
        subscriptionApi.getPlans().catch(() => [])
      ]);
      setSub(subData);
      setPlans(plansData || []);
      if (subData?.plan) {
        setSelectedPlan(subData.plan);
      }
    } catch (err) {
      setError(err.message || 'Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSub();
  }, []);

  const handleUpgrade = async (e) => {
    e.preventDefault();
    setUpgrading(true);
    try {
      await subscriptionApi.upgradeSubscription({
        plan: selectedPlan,
        billingCycle: selectedCycle
      });
      setUpgradeModal(false);
      await loadSub();
    } catch (err) {
      alert(err.message || 'Failed to update subscription');
    } finally {
      setUpgrading(false);
    }
  };

  const planName = sub?.plan || 'Growth';
  const price = sub?.amount || sub?.price || '₹2,499 / mo';
  const cycle = sub?.billingCycle || 'Monthly';
  const userLimit = sub?.userLimit || sub?.maxUsers || 20;
  const currentUsers = sub?.currentUsers || 1;
  const renewalDate = sub?.renewalDate || 'Next month';

  return (
    <CompanyLayout
      pageTitle="Company Subscription & Licensing"
      pageSubtitle={`Tier management, user quota, and invoicing for ${user?.companyName}`}
    >
      {error && (
        <div className="auth-alert alert-error font-mono mb-4">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="font-mono text-center text-muted p-4">Loading subscription from database...</div>
      ) : (
        <div className="crm-panels-split-2">
          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Active Licensing Tier</h3>
                <p className="panel-card-subtitle">Current contractual billing terms from database</p>
              </div>
              <span className="status-pill status-active font-mono">
                {sub?.status ? sub.status.toUpperCase() : 'ACTIVE'}
              </span>
            </div>

            <div className="company-sub-card">
              <div className="sub-tier-row">
                <span className="sub-plan-badge font-mono">{planName.toUpperCase()} PLAN</span>
                <span className="font-mono text-tertiary font-bold">{price}</span>
              </div>
              <div className="sub-pricing-row">
                <span className="sub-amount font-mono">Billing: {cycle}</span>
              </div>
              <p className="sub-desc text-muted text-sm">
                Next scheduled automated renewal occurs on <strong>{renewalDate}</strong>. Includes isolated customer data storage, automated webhooks, and team role segregation.
              </p>
              <div className="sub-seat-bar">
                <div className="seat-meta font-mono">
                  <span>Seat Utilization:</span>
                  <span>{currentUsers} / {userLimit} Seats Allocated</span>
                </div>
                <div className="seat-progress-track">
                  <div
                    className="seat-progress-fill"
                    style={{ width: `${Math.min(100, (currentUsers / userLimit) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary font-mono btn-sm"
                  onClick={() => setUpgradeModal(true)}
                >
                  Change / Upgrade Plan
                </button>
              </div>
            </div>
          </div>

          <div className="crm-panel-card">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Included Tenant Capabilities</h3>
                <p className="panel-card-subtitle">Features active for this organization</p>
              </div>
            </div>

            <ul className="sa-plan-feature-list" style={{ padding: '16px' }}>
              <li className="sa-plan-feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Role-Based Access Control (Admin, Manager, Staff)</span>
              </li>
              <li className="sa-plan-feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Multi-Tenant Database Partitioning & Isolation</span>
              </li>
              <li className="sa-plan-feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Automated Sales Pipeline & Qualification Deals</span>
              </li>
              <li className="sa-plan-feature-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Audit Activity Tracking & Task Delegation</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      {upgradeModal && (
        <div className="sa-modal-backdrop" onClick={() => setUpgradeModal(false)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Change Subscription Tier</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setUpgradeModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpgrade}>
              <div className="sa-modal-body">
                <div className="form-group mb-3">
                  <label className="form-label">Select Subscription Tier</label>
                  <select
                    className="form-input font-mono"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  >
                    <option value="Starter">Starter (5 Users) — ₹999 / mo</option>
                    <option value="Growth">Growth (20 Users) — ₹2,499 / mo</option>
                    <option value="Scale">Scale (100 Users) — ₹5,999 / mo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Billing Cycle</label>
                  <select
                    className="form-input font-mono"
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                  >
                    <option value="Monthly">Monthly Billing</option>
                    <option value="Annual">Annual Billing (20% Savings)</option>
                  </select>
                </div>
              </div>
              <div className="sa-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary font-mono btn-sm"
                  disabled={upgrading}
                  onClick={() => setUpgradeModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary font-mono btn-sm" disabled={upgrading}>
                  {upgrading ? 'Upgrading...' : 'Confirm Plan Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}
