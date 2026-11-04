import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/dashboardApi';
import { leadApi } from '../../api/leadApi';

export default function ReportsPage() {
  const { user, role } = useAuth();
  const [revenueReport, setRevenueReport] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [leadsList, setLeadsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states for the customer breakdown table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Settled' | 'Partially Paid' | 'Pending'
  const [tierFilter, setTierFilter] = useState('All');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [revData, dashData, leadsRes] = await Promise.all([
        dashboardApi.getCompanyRevenueReport(),
        role === 'manager'
          ? dashboardApi.getManagerDashboard()
          : dashboardApi.getCompanyAdminDashboard(),
        leadApi.getLeads({ page: 0, size: 100 })
      ]);
      setRevenueReport(revData);
      setDashboardData(dashData);
      setLeadsList(leadsRes?.data || []);
    } catch (err) {
      console.error('Failed to load reports and revenue data', err);
      setError(err.message || 'Failed to aggregate revenue and performance records');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered customer revenue breakdown
  const filteredBreakdowns = useMemo(() => {
    if (!revenueReport?.customerBreakdowns) return [];
    return revenueReport.customerBreakdowns.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.industry?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchTier = tierFilter === 'All' || item.tier === tierFilter;

      return matchSearch && matchStatus && matchTier;
    });
  }, [revenueReport, searchTerm, statusFilter, tierFilter]);

  // Pipeline stage counts from real leads
  const stageCounts = useMemo(() => {
    const counts = {};
    leadsList.forEach((lead) => {
      const stage = lead.stage || 'Prospecting';
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return Object.entries(counts).map(([stage, count]) => ({
      stage,
      count
    }));
  }, [leadsList]);

  const totalContractRevenue = revenueReport?.formattedTotalRevenue || '₹0';
  const totalPaidAmount = revenueReport?.formattedPaidAmount || '₹0';
  const totalRemainingBalance = revenueReport?.formattedRemainingBalance || '₹0';
  const settlementRate = revenueReport?.settlementPercentage || 0.0;

  return (
    <CompanyLayout
      pageTitle="Financial Reports & Revenue Analytics"
      pageSubtitle={`Commercial ledger settlement, collection velocity, and contract receivables for ${user?.companyName || 'your organization'}`}
      actions={
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary font-mono btn-sm"
            onClick={loadData}
            disabled={loading}
          >
            ↻ Refresh Data
          </button>
          <Link to="/company/customers" className="btn btn-primary font-mono btn-sm">
            + Manage Customers
          </Link>
        </div>
      }
    >
      {error && (
        <div className="auth-alert alert-error font-mono mb-4">
          <span>{error}</span>
          <button type="button" onClick={loadData} className="btn btn-xs btn-secondary ml-2">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="crm-panel-card text-center p-5 font-mono text-muted">
          Aggregating verified ledger balances and contract payments from database...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* TOP EXECUTIVE BANNER SUMMARY */}
          <div className="crm-banner-card admin-banner" style={{ margin: 0, padding: '22px 28px' }}>
            <div className="banner-content">
              <div className="banner-badge font-mono">
                <span>COMMERCIAL REVENUE LEDGER</span>
              </div>
              <h2 className="banner-title" style={{ fontSize: '1.4rem', margin: '4px 0 6px 0' }}>
                Financial Portfolio: {totalContractRevenue}
              </h2>
              <p className="banner-subtitle" style={{ maxWidth: '750px', margin: 0, fontSize: '0.86rem' }}>
                Total contracted value across <strong>{revenueReport?.totalCustomersCount || 0}</strong> client accounts.
                Collected cash: <strong style={{ color: 'var(--tertiary)' }}>{totalPaidAmount}</strong> ({settlementRate}% cleared) with <strong style={{ color: 'var(--secondary)' }}>{totalRemainingBalance}</strong> currently outstanding.
              </p>
            </div>
            <div className="banner-actions" style={{ minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ width: '100%', textAlign: 'right' }}>
                <span className="font-mono text-xs text-muted">Overall Collection Velocity</span>
                <div className="font-mono font-bold text-lg" style={{ color: 'var(--tertiary)' }}>{settlementRate}%</div>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(settlementRate, 100)}%`,
                    background: 'linear-gradient(90deg, var(--secondary), var(--tertiary))',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* PRIMARY 4-STAT FINANCIAL KPI GRID */}
          <div className="crm-stats-grid" style={{ margin: 0 }}>
            {/* Card 1: Total Contracted Revenue */}
            <div className="crm-stat-card" style={{ borderTop: '3px solid var(--secondary)' }}>
              <div className="stat-card-header">
                <span className="stat-title font-mono uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  Total Contract Value
                </span>
                <div className="stat-icon-wrap" style={{ color: 'var(--secondary)', background: 'rgba(34, 97, 146, 0.15)', padding: '6px', borderRadius: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
              </div>
              <div className="stat-number font-mono" style={{ fontSize: '1.75rem' }}>{totalContractRevenue}</div>
              <div className="stat-footer font-mono text-muted" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Clients: {revenueReport?.totalCustomersCount || 0} accounts</span>
                <span className="status-pill font-mono text-xs" style={{ padding: '1px 6px', background: 'var(--bg-subtle-box)' }}>Gross</span>
              </div>
            </div>

            {/* Card 2: Verified Collected Cash */}
            <div className="crm-stat-card" style={{ borderTop: '3px solid var(--tertiary)' }}>
              <div className="stat-card-header">
                <span className="stat-title font-mono uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  Collected (Paid In Cash)
                </span>
                <div className="stat-icon-wrap" style={{ color: 'var(--tertiary)', background: 'rgba(239, 133, 87, 0.15)', padding: '6px', borderRadius: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <div className="stat-number font-mono" style={{ fontSize: '1.75rem', color: 'var(--tertiary)' }}>{totalPaidAmount}</div>
              <div className="stat-footer font-mono text-muted" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Settlement: <strong>{settlementRate}%</strong></span>
                <span className="status-pill status-active font-mono text-xs" style={{ padding: '1px 6px' }}>Received</span>
              </div>
            </div>

            {/* Card 3: Receivables Outstanding */}
            <div className="crm-stat-card" style={{ borderTop: '3px solid var(--secondary)' }}>
              <div className="stat-card-header">
                <span className="stat-title font-mono uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  Balance to Settle
                </span>
                <div className="stat-icon-wrap" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '6px', borderRadius: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
              </div>
              <div className="stat-number font-mono" style={{ fontSize: '1.75rem', color: '#f59e0b' }}>{totalRemainingBalance}</div>
              <div className="stat-footer font-mono text-muted" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Due: {revenueReport?.pendingSettlementCustomersCount || 0} accounts</span>
                <span className="status-pill font-mono text-xs" style={{ padding: '1px 6px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>Pending</span>
              </div>
            </div>

            {/* Card 4: Ledger Receipts Count */}
            <div className="crm-stat-card" style={{ borderTop: '3px solid var(--tertiary)' }}>
              <div className="stat-card-header">
                <span className="stat-title font-mono uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                  Recorded Receipts
                </span>
                <div className="stat-icon-wrap" style={{ color: 'var(--tertiary)', background: 'rgba(235, 94, 40, 0.12)', padding: '6px', borderRadius: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
              </div>
              <div className="stat-number font-mono" style={{ fontSize: '1.75rem' }}>{revenueReport?.totalPaymentsCount || 0}</div>
              <div className="stat-footer font-mono text-muted" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Settled: {revenueReport?.fullySettledCustomersCount || 0} 100%</span>
                <span className="status-pill font-mono text-xs" style={{ padding: '1px 6px', background: 'var(--bg-subtle-box)' }}>Audited</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Client Account Financial Settlement Ledger */}
          <div className="crm-panel-card">
            <div className="panel-card-header" style={{ padding: '18px 24px' }}>
              <div>
                <h3 className="panel-card-title">Client Account Financial Settlement Ledger</h3>
                <p className="panel-card-subtitle">
                  Detailed audit of contract values, cash collected, and balance due per account
                </p>
              </div>

              {/* Filter Controls Toolbar */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="crm-search-box" style={{ minWidth: '220px' }}>
                  <input
                    type="text"
                    className="form-input font-mono text-xs"
                    placeholder="Search by customer name or rep..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="crm-filter-selects" style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="form-input font-mono text-xs"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ minWidth: '130px' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Settled">Settled</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <select
                    className="form-input font-mono text-xs"
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    style={{ minWidth: '120px' }}
                  >
                    <option value="All">All Tiers</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Mid-Market">Mid-Market</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="crm-table-container">
              <table className="crm-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>Account ID</th>
                    <th style={{ minWidth: '200px' }}>Company / Client</th>
                    <th style={{ width: '120px' }}>Tier</th>
                    <th style={{ textAlign: 'right', minWidth: '130px' }}>Contract Value</th>
                    <th style={{ textAlign: 'right', minWidth: '130px' }}>Paid Amount</th>
                    <th style={{ textAlign: 'right', minWidth: '130px' }}>Balance Due</th>
                    <th style={{ minWidth: '160px' }}>Settlement %</th>
                    <th style={{ textAlign: 'center', width: '130px' }}>Ledger Status</th>
                    <th style={{ textAlign: 'right', width: '120px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBreakdowns.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center text-muted p-5 font-mono">
                        No client records match the current ledger filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBreakdowns.map((item) => (
                      <tr key={item.customerId}>
                        <td className="font-mono text-xs text-muted font-semibold">#{item.customerId}</td>
                        <td>
                          <div className="font-semibold text-primary">{item.customerName}</div>
                          <div className="font-mono text-xs text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                            {item.contactPerson || item.industry || '—'}
                          </div>
                        </td>
                        <td>
                          <span className="status-pill font-mono text-xs" style={{ background: 'var(--bg-subtle-box)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                            {item.tier || 'Standard'}
                          </span>
                        </td>
                        <td className="font-mono font-bold text-primary" style={{ textAlign: 'right' }}>
                          {item.formattedContractValue}
                        </td>
                        <td className="font-mono font-bold" style={{ textAlign: 'right', color: 'var(--tertiary)' }}>
                          {item.formattedPaidAmount}
                        </td>
                        <td className="font-mono font-bold" style={{ textAlign: 'right', color: item.remainingBalance > 0 ? 'var(--secondary)' : 'var(--tertiary)' }}>
                          {item.formattedRemainingBalance}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '7px', background: 'var(--bg-subtle-box)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${Math.min(item.settlementPercentage, 100)}%`,
                                  background: item.status === 'Settled' ? 'var(--tertiary)' : 'var(--secondary)',
                                  borderRadius: '4px'
                                }}
                              />
                            </div>
                            <span className="font-mono text-xs font-semibold" style={{ minWidth: '40px', textAlign: 'right' }}>
                              {item.settlementPercentage}%
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className="status-pill font-mono text-xs"
                            style={{
                              display: 'inline-block',
                              minWidth: '95px',
                              textAlign: 'center',
                              color: item.status === 'Settled' ? 'var(--tertiary)' : item.status === 'Partially Paid' ? 'var(--secondary)' : 'var(--text-muted)',
                              background: item.status === 'Settled' ? 'rgba(239, 133, 87, 0.12)' : item.status === 'Partially Paid' ? 'rgba(34, 97, 146, 0.15)' : 'var(--bg-subtle-box)',
                              border: item.status === 'Settled' ? '1px solid rgba(239, 133, 87, 0.35)' : item.status === 'Partially Paid' ? '1px solid rgba(34, 97, 146, 0.35)' : '1px solid var(--border-color)'
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link
                            to={`/company/customers/${item.customerId}`}
                            className="btn btn-secondary btn-xs font-mono"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                          >
                            View & Pay &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: Two-column layout for Pipeline Funnel & Operational Metrics */}
          <div className="crm-two-columns">
            {/* Left: Pipeline Funnel Stage Breakdown */}
            <div className="crm-panel-card">
              <div className="panel-card-header" style={{ padding: '18px 24px' }}>
                <div>
                  <h3 className="panel-card-title">Commercial Pipeline Stage Breakdown</h3>
                  <p className="panel-card-subtitle">
                    Distribution of active pipeline deals across sales qualification stages
                  </p>
                </div>
                <span className="status-pill font-mono text-xs" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  {leadsList.length} Active Deals
                </span>
              </div>

              <div className="crm-table-container">
                <table className="crm-data-table">
                  <thead>
                    <tr>
                      <th>Pipeline Stage</th>
                      <th style={{ textAlign: 'center', width: '140px' }}>Deals In Funnel</th>
                      <th style={{ textAlign: 'right', width: '130px' }}>Stage Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stageCounts.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center text-muted p-4 font-mono">
                          No active pipeline opportunities found.
                        </td>
                      </tr>
                    ) : (
                      stageCounts.map((s) => (
                        <tr key={s.stage}>
                          <td>
                            <span className="font-semibold">{s.stage}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="font-mono font-bold text-primary">
                              {s.count} {s.count === 1 ? 'Opportunity' : 'Opportunities'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span
                              className="status-pill font-mono text-xs"
                              style={{
                                background: s.stage === 'Closed Won' ? 'rgba(239, 133, 87, 0.15)' : 'rgba(34, 97, 146, 0.15)',
                                color: s.stage === 'Closed Won' ? 'var(--tertiary)' : 'var(--secondary)',
                                border: s.stage === 'Closed Won' ? '1px solid rgba(239, 133, 87, 0.35)' : '1px solid rgba(34, 97, 146, 0.35)'
                              }}
                            >
                              {s.stage === 'Closed Won' ? 'Won' : 'In Pipeline'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Revenue Health & Settlement Summary */}
            <div className="crm-panel-card">
              <div className="panel-card-header" style={{ padding: '18px 24px' }}>
                <div>
                  <h3 className="panel-card-title">Ledger Settlement Health</h3>
                  <p className="panel-card-subtitle">
                    Executive summary of account collections
                  </p>
                </div>
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div className="font-semibold">Fully Settled Accounts</div>
                    <div className="font-mono text-xs text-muted">100% of contract received</div>
                  </div>
                  <div className="font-mono font-bold text-lg" style={{ color: 'var(--tertiary)' }}>
                    {revenueReport?.fullySettledCustomersCount || 0} Accounts
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div className="font-semibold">Partially Settled / Due</div>
                    <div className="font-mono text-xs text-muted">Awaiting full payment closure</div>
                  </div>
                  <div className="font-mono font-bold text-lg" style={{ color: 'var(--secondary)' }}>
                    {revenueReport?.pendingSettlementCustomersCount || 0} Accounts
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div className="font-semibold">Total Verified Payment Receipts</div>
                    <div className="font-mono text-xs text-muted">Transactions saved in ledger</div>
                  </div>
                  <div className="font-mono font-bold text-lg text-primary">
                    {revenueReport?.totalPaymentsCount || 0} Transactions
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="font-semibold">Overall Clearance Ratio</div>
                    <div className="font-mono text-xs text-muted">Cash collected vs. total contracts</div>
                  </div>
                  <div className="font-mono font-bold text-lg" style={{ color: 'var(--tertiary)' }}>
                    {settlementRate}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}
