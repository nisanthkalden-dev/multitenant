import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import AdminLayout from '../../components/SuperAdmin/AdminLayout';
import StatCard from '../../components/SuperAdmin/StatCard';
import StatusBadge from '../../components/SuperAdmin/StatusBadge';

export default function SuperAdminDashboard() {
  const {
    stats,
    companies,
    revenueMonthlyData,
    revenueMonthlyData6M,
    revenueMonthlyData1Y,
    subscriptionDistribution,
    activities,
    refreshDashboard
  } = useSuperAdmin();

  const [revenuePeriod, setRevenuePeriod] = useState('6M');

  const handlePeriodChange = (period) => {
    setRevenuePeriod(period);
    if (refreshDashboard) {
      refreshDashboard(period);
    }
  };

  // Select active revenue dataset based on chosen period (6M or 1Y)
  const activeRevenueData = useMemo(() => {
    if (revenuePeriod === '1Y') {
      return revenueMonthlyData1Y && revenueMonthlyData1Y.length > 0
        ? revenueMonthlyData1Y
        : revenueMonthlyData;
    }
    return revenueMonthlyData6M && revenueMonthlyData6M.length > 0
      ? revenueMonthlyData6M
      : revenueMonthlyData;
  }, [revenuePeriod, revenueMonthlyData, revenueMonthlyData6M, revenueMonthlyData1Y]);

  // Preview the first 5 recent companies
  const recentCompanies = companies.slice(0, 5);

  // Dynamic SVG Chart calculation for actual database-derived revenue
  const chartHeight = 160;
  const chartWidth = 500;

  const maxRevenue = useMemo(() => {
    if (!activeRevenueData || activeRevenueData.length === 0) return 10000;
    const maxVal = Math.max(...activeRevenueData.map((d) => Number(d.revenue) || 0));
    return maxVal > 0 ? Math.ceil(maxVal * 1.25) : 10000;
  }, [activeRevenueData]);


  const points = useMemo(() => {
    if (!activeRevenueData || activeRevenueData.length === 0) return [];
    const count = activeRevenueData.length;
    return activeRevenueData.map((d, index) => {
      const x = count > 1
        ? (index / (count - 1)) * (chartWidth - 60) + 30
        : chartWidth / 2;
      const y = chartHeight - ((Number(d.revenue) || 0) / maxRevenue) * (chartHeight - 30) - 15;
      return { x, y, ...d };
    });
  }, [activeRevenueData, maxRevenue]);

  const pathD = points.length > 0
    ? points.reduce((acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '')
    : `M 30 ${chartHeight - 15} L ${chartWidth - 30} ${chartHeight - 15}`;

  // SVG Chart calculation for revenue
  const maxRevenue = 900000;
  const chartHeight = 160;
  const chartWidth = 500;
  const safeData = Array.isArray(revenueMonthlyData) ? revenueMonthlyData : [];
  const points = safeData.map((d, index) => {
    const divisor = safeData.length > 1 ? safeData.length - 1 : 1;
    const x = (index / divisor) * (chartWidth - 60) + 30;
    const y = chartHeight - ((d.revenue || 0) / maxRevenue) * (chartHeight - 30) - 15;
    return { x, y, ...d };
  });

  const pathD = points.length > 0
    ? points.reduce(
        (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
        ''
      )
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : '';

  return (
    <AdminLayout title="Platform Command Dashboard" breadcrumb={['Dashboard']}>
      {/* 4 to 6 Statistic Cards */}
      <div className="sa-stats-grid">
        <StatCard
          title="Total Companies"
          value={stats.totalCompanies.value}
          growth={stats.totalCompanies.growth}
          trend={stats.totalCompanies.trend}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18"></path>
              <path d="M5 21V7l8-4v18"></path>
              <path d="M19 21V11l-6-3"></path>
            </svg>
          }
        />
        <StatCard
          title="Active Companies"
          value={stats.activeCompanies.value}
          growth={stats.activeCompanies.growth}
          trend={stats.activeCompanies.trend}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          }
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers.value}
          growth={stats.totalUsers.growth}
          trend={stats.totalUsers.trend}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          }
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions.value}
          growth={stats.activeSubscriptions.growth}
          trend={stats.activeSubscriptions.trend}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          }
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={stats.monthlyRevenue.value}
          growth={stats.monthlyRevenue.growth}
          trend={stats.monthlyRevenue.trend}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          }
        />
      </div>

      {/* Analytics Section: Revenue Line Chart & Subscription Distribution */}
      <div className="sa-analytics-grid">
        {/* Revenue Overview Card */}
        <div className="sa-card sa-chart-card">
          <div className="sa-card-header">
            <div>
              <h2 className="sa-card-title">Revenue Overview</h2>
              <p className="sa-card-subtitle">Monthly platform recurring subscription inflow</p>
            </div>
            <div className="sa-pill-selector">
              <button
                type="button"
                className={`sa-pill-btn ${revenuePeriod === '6M' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('6M')}
              >
                6 Months
              </button>
              <button
                type="button"
                className={`sa-pill-btn ${revenuePeriod === '1Y' ? 'active' : ''}`}
                onClick={() => handlePeriodChange('1Y')}
              >
                1 Year
              </button>
            </div>
          </div>

          <div className="sa-card-body">
            <div className="sa-chart-header-metric font-mono">
              <span className="sa-current-mrr">{stats.monthlyRevenue.value}</span>
              <span className={`sa-mrr-delta ${stats.monthlyRevenue.trend === 'up' ? 'text-success' : (stats.monthlyRevenue.trend === 'down' ? 'text-danger' : '')}`}>
                {stats.monthlyRevenue.growth} vs last month
              </span>
            </div>

            <div className="sa-chart-svg-container">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="sa-line-chart-svg">
                <defs>
                  <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--tertiary)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--tertiary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid lines */}
                {[0.25, 0.5, 0.75, 1].map((ratio, i) => (
                  <line
                    key={i}
                    x1="20"
                    y1={chartHeight * (1 - ratio) + 10}
                    x2={chartWidth - 20}
                    y2={chartHeight * (1 - ratio) + 10}
                    stroke="var(--border-color)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                ))}

                {/* Filled Gradient Area */}
                <path d={areaD} fill="url(#revenueGlow)" />

                {/* Smooth Chart Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--tertiary)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Chart Nodes */}
                {points.map((pt, idx) => (
                  <g key={idx} className="chart-point-group">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill="var(--tertiary)"
                      stroke="var(--bg-card)"
                      strokeWidth="2"
                    />
                    <text
                      x={pt.x}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      className="chart-axis-label font-mono"
                    >
                      {pt.month}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Subscription Distribution Card */}
        <div className="sa-card sa-distribution-card">
          <div className="sa-card-header">
            <div>
              <h2 className="sa-card-title">Subscription Distribution</h2>
              <p className="sa-card-subtitle">
                Active tier allocations across {companies.length} {companies.length === 1 ? 'account' : 'accounts'}
              </p>
            </div>
          </div>

          <div className="sa-card-body">
            {/* Visual multi-segmented bar meter */}
            <div className="sa-distribution-meter-bar">
              {subscriptionDistribution.map((tier) => (
                <div
                  key={tier.plan}
                  className="meter-segment"
                  style={{
                    width: `${tier.percentage}%`,
                    backgroundColor: tier.color
                  }}
                  title={`${tier.plan}: ${tier.count} companies (${tier.percentage}%)`}
                />
              ))}
            </div>

            {/* Plan list details */}
            <div className="sa-distribution-list">
              {subscriptionDistribution.map((tier) => (
                <div key={tier.plan} className="sa-distribution-row">
                  <div className="sa-dist-info">
                    <span className="sa-dist-dot" style={{ backgroundColor: tier.color }}></span>
                    <span className="sa-dist-name">{tier.plan}</span>
                  </div>
                  <div className="sa-dist-metric font-mono">
                    <span className="sa-dist-count">{tier.count} orgs</span>
                    <span className="sa-dist-pct font-mono">({tier.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="sa-distribution-footer-box">
              <span className="font-mono text-tertiary">★ Plan Diversity</span> Active subscriptions distributed across {subscriptionDistribution.filter(t => t.count > 0).length} tier{subscriptionDistribution.filter(t => t.count > 0).length === 1 ? '' : 's'}.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Companies & Live Activity Dual Grid */}
      {/* <div className="sa-tables-grid"> */}
      {/* Recent Companies Card */}
      <div className="sa-card sa-recent-companies-card">
        <div className="sa-card-header">
          <div>
            <h2 className="sa-card-title">Recent Company Registrations</h2>
            <p className="sa-card-subtitle">Latest organizations joined the platform</p>
          </div>
          <Link to="/super-admin/companies" className="btn btn-secondary btn-sm font-mono">
            View All ({companies.length})
          </Link>
        </div>

        <div className="sa-card-body p-0">
          {/* Desktop / Laptop Table */}
          <div className="sa-table-responsive sa-desktop-only-table">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Owner</th>
                  <th>Plan</th>
                  <th>Users</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentCompanies.map((comp) => (
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
                          <div className="sa-company-name font-semibold">{comp.name}</div>
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
                      <span className="font-mono">{comp.usersCount} / {comp.userLimit || 20}</span>
                    </td>
                    <td>
                      <StatusBadge status={comp.status} />
                    </td>
                    <td>
                      <span className="sa-date-cell font-mono">{comp.joinedDate}</span>
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/super-admin/companies/${comp.id}`}
                        className="btn btn-secondary btn-xs font-mono"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Compact Tablet Card Representation */}
          <div className="sa-mobile-only-cards">
            {recentCompanies.map((comp) => (
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
                      <div className="sa-company-name font-semibold">{comp.name}</div>
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
                    <span className="sa-meta-lbl">Users:</span>
                    <span className="sa-meta-val">{comp.usersCount} / {comp.userLimit || 20}</span>
                  </div>
                  <div className="sa-mobile-meta-row">
                    <span className="sa-meta-lbl">Joined:</span>
                    <span className="sa-meta-val sa-date-cell">{comp.joinedDate}</span>
                  </div>
                </div>

                <div className="sa-mobile-card-footer">
                  <Link
                    to={`/super-admin/companies/${comp.id}`}
                    className="btn btn-secondary btn-xs font-mono btn-full text-center"
                  >
                    View Dossier &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live System Activity Feed */}
      {/* <div className="sa-card sa-activity-card">
          <div className="sa-card-header">
            <div>
              <h2 className="sa-card-title">Recent Activities</h2>
              <p className="sa-card-subtitle">Automated audit trail and cluster events</p>
            </div>
          </div>

          <div className="sa-card-body">
            <div className="sa-activity-timeline">
              {activities.map((act) => (
                <div key={act.id} className="sa-activity-item">
                  <div className="sa-activity-indicator" style={{ borderColor: act.iconColor }}>
                    <span className="sa-activity-core-dot" style={{ backgroundColor: act.iconColor }}></span>
                  </div>
                  <div className="sa-activity-content">
                    <div className="sa-activity-title">{act.title}</div>
                    <div className="sa-activity-detail">{act.detail}</div>
                    <div className="sa-activity-time font-mono">{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}
      {/* </div> */}
    </AdminLayout>
  );
}
