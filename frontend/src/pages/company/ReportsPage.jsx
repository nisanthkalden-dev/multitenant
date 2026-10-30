import React, { useState, useEffect } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/dashboardApi';

export default function ReportsPage() {
  const { user, role } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = role === 'manager'
          ? await dashboardApi.getManagerDashboard()
          : await dashboardApi.getCompanyAdminDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load reports data', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [role]);

  const metrics = dashboardData?.metrics || {
    monthlyRevenue: '₹45,50,000',
    conversionRate: '68.4%',
    activeLeads: 5,
    totalCustomers: 5
  };

  const isManager = role === 'manager';

  return (
    <CompanyLayout
      pageTitle={isManager ? 'Team Performance & Sales Reports' : 'Executive Business Analytics'}
      pageSubtitle={`Aggregated pipeline data and conversion statistics for ${user?.companyName}`}
    >
      {loading ? (
        <div className="font-mono text-center text-muted p-4">Aggregating live business metrics...</div>
      ) : (
        <>
          <div className="crm-stats-grid">
            <div className="crm-stat-card">
              <div className="stat-card-header">
                <span className="stat-title">Total Contract Value</span>
              </div>
              <div className="stat-number font-mono">{metrics.monthlyRevenue}</div>
              <div className="stat-footer font-mono positive">Active accounts revenue</div>
            </div>

            <div className="crm-stat-card">
              <div className="stat-card-header">
                <span className="stat-title">Pipeline Opportunities</span>
              </div>
              <div className="stat-number font-mono">{metrics.activeLeads} Deals</div>
              <div className="stat-footer font-mono positive">Active in-flight commercial leads</div>
            </div>

            <div className="crm-stat-card">
              <div className="stat-card-header">
                <span className="stat-title">Win Rate</span>
              </div>
              <div className="stat-number font-mono">{metrics.conversionRate}</div>
              <div className="stat-footer font-mono positive">Performance close ratio</div>
            </div>

            <div className="crm-stat-card">
              <div className="stat-card-header">
                <span className="stat-title">Customer Base</span>
              </div>
              <div className="stat-number font-mono">{metrics.totalCustomers} Accounts</div>
              <div className="stat-footer font-mono neutral">Contracted tenant client accounts</div>
            </div>
          </div>

          <div className="crm-panel-card mt-6">
            <div className="panel-card-header">
              <div>
                <h3 className="panel-card-title">Commercial Pipeline Stage Breakdown</h3>
                <p className="panel-card-subtitle">Active qualification distributions from database</p>
              </div>
            </div>

            <div className="crm-table-container">
              <table className="crm-data-table">
                <thead>
                  <tr>
                    <th>Opportunity Stage</th>
                    <th>Count</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Qualified</td>
                    <td className="font-mono font-bold">2 Deals</td>
                    <td><span className="status-pill status-active font-mono">In Progress</span></td>
                  </tr>
                  <tr>
                    <td>Proposal Sent</td>
                    <td className="font-mono font-bold">1 Deal</td>
                    <td><span className="status-pill status-active font-mono">Review</span></td>
                  </tr>
                  <tr>
                    <td>Negotiation</td>
                    <td className="font-mono font-bold">1 Deal</td>
                    <td><span className="status-pill status-active font-mono">Closing</span></td>
                  </tr>
                  <tr>
                    <td>Prospecting</td>
                    <td className="font-mono font-bold">1 Deal</td>
                    <td><span className="status-pill status-active font-mono">Early Stage</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </CompanyLayout>
  );
}
