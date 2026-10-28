import React from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { MOCK_CUSTOMERS, MOCK_LEADS } from '../../data/mockTenantData';

export default function ReportsPage() {
  const { user, role, companyId } = useAuth();

  const tenantCustomers = MOCK_CUSTOMERS.filter((c) => c.companyId === companyId);
  const tenantLeads = MOCK_LEADS.filter((l) => l.companyId === companyId);

  const isManager = role === 'manager';

  return (
    <CompanyLayout
      pageTitle={isManager ? 'Team Performance & Sales Reports' : 'Executive Business Analytics'}
      pageSubtitle={`Aggregated pipeline data and conversion statistics for ${user?.companyName}`}
    >
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Total Contract Value</span>
          </div>
          <div className="stat-number font-mono">₹45,50,000</div>
          <div className="stat-footer font-mono positive">Active accounts revenue</div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Pipeline In-Flight</span>
          </div>
          <div className="stat-number font-mono">₹18,00,000</div>
          <div className="stat-footer font-mono positive">4 weighted opportunities</div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Win Rate</span>
          </div>
          <div className="stat-number font-mono">68.4%</div>
          <div className="stat-footer font-mono positive">+5.1% vs Q3 baseline</div>
        </div>

        <div className="crm-stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Avg Deal Velocity</span>
          </div>
          <div className="stat-number font-mono">18 Days</div>
          <div className="stat-footer font-mono neutral">First lead to close</div>
        </div>
      </div>

      <div className="crm-panel-card mt-6">
        <div className="panel-card-header">
          <div>
            <h3 className="panel-card-title">Commercial Pipeline Stage Breakdown</h3>
            <p className="panel-card-subtitle">Active qualification distributions</p>
          </div>
        </div>

        <div className="crm-table-container">
          <table className="crm-data-table">
            <thead>
              <tr>
                <th>Deal / Account</th>
                <th>Stage</th>
                <th>Probability</th>
                <th>Estimated Value</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {tenantLeads.map((lead) => (
                <tr key={lead.id}>
                  <td className="font-semibold">{lead.company}</td>
                  <td>
                    <span className="lead-stage-pill font-mono">{lead.stage}</span>
                  </td>
                  <td className="font-mono">
                    {lead.stage === 'Proposal Sent'
                      ? '75%'
                      : lead.stage === 'Negotiation'
                      ? '90%'
                      : '45%'}
                  </td>
                  <td className="font-mono text-tertiary font-bold">{lead.estimatedValue}</td>
                  <td className="font-mono text-xs">{lead.assignedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CompanyLayout>
  );
}
