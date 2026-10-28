import React from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { MOCK_COMPANIES } from '../../data/mockUsers';

export default function SubscriptionPage() {
  const { user, companyId } = useAuth();
  const company = MOCK_COMPANIES.find((c) => c.id === companyId) || {
    name: user?.companyName || 'Acme Corporation',
    plan: 'Growth',
    billingCycle: 'Monthly',
    price: '₹2,499 / mo',
    status: 'Active',
    renewalDate: 'Nov 24, 2026',
    maxUsers: 20
  };

  return (
    <CompanyLayout
      pageTitle="Company Subscription & Licensing"
      pageSubtitle={`Tier management, user quota, and invoicing for ${user?.companyName}`}
    >
      <div className="crm-panels-split-2">
        <div className="crm-panel-card">
          <div className="panel-card-header">
            <div>
              <h3 className="panel-card-title">Active Licensing Tier</h3>
              <p className="panel-card-subtitle">Current contractual billing terms</p>
            </div>
            <span className="status-pill status-active font-mono">ACTIVE</span>
          </div>

          <div className="company-sub-card">
            <div className="sub-tier-row">
              <span className="sub-plan-badge font-mono">{company.plan.toUpperCase()} PLAN</span>
              <span className="font-mono text-tertiary font-bold">{company.price}</span>
            </div>
            <div className="sub-pricing-row">
              <span className="sub-amount font-mono">Billing: {company.billingCycle}</span>
            </div>
            <p className="sub-desc text-muted text-sm">
              Next scheduled automated renewal occurs on <strong>{company.renewalDate}</strong>. Includes isolated customer data storage, automated webhooks, and team role segregation.
            </p>
            <div className="sub-seat-bar">
              <div className="seat-meta font-mono">
                <span>Maximum Allowed Users:</span>
                <span>{company.maxUsers} Seats</span>
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-primary font-mono btn-sm"
                onClick={() => alert('Plan Upgrade Dialog (Mock Action)')}
              >
                Upgrade Plan
              </button>
              <button
                type="button"
                className="btn btn-secondary font-mono btn-sm"
                onClick={() => alert('Download Billing Invoice PDF')}
              >
                Download Invoice
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
              <span>Multi-Tenant Database Partitioning</span>
            </li>
            <li className="sa-plan-feature-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Automated Sales Pipeline & Kanban Deals</span>
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
    </CompanyLayout>
  );
}
