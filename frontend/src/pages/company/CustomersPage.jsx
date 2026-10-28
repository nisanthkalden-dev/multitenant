import React, { useState } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { MOCK_CUSTOMERS } from '../../data/mockTenantData';
import RoleGuard from '../../components/RoleGuard/RoleGuard';

export default function CustomersPage() {
  const { user, role, companyId } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('All');

  // Multi-tenant & Role-based data isolation
  // Employee only sees their assigned accounts; Admin & Manager see company accounts
  const baseCustomers = MOCK_CUSTOMERS.filter((c) => {
    if (c.companyId !== companyId) return false;
    if (role === 'employee') {
      return c.assignedTo === user?.userId;
    }
    return true;
  });

  const filtered = baseCustomers.filter((c) => {
    const matchesSearch =
      !searchTerm ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'All' || c.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  return (
    <CompanyLayout
      pageTitle={role === 'employee' ? 'My Assigned Customers' : 'Customer Accounts Directory'}
      pageSubtitle={`Multi-tenant CRM records scoped to ${user?.companyName} (${filtered.length} records)`}
      actions={
        <RoleGuard allowedRoles={['company_admin', 'manager']}>
          <button
            type="button"
            className="btn btn-primary font-mono btn-sm"
            onClick={() => alert('Add Customer Modal (Mock Action)')}
          >
            + New Customer
          </button>
        </RoleGuard>
      }
    >
      <div className="crm-panel-card">
        {/* Filter bar */}
        <div className="crm-filter-toolbar">
          <div className="crm-search-box">
            <input
              type="text"
              placeholder="Search by company, contact person, or industry..."
              className="form-input font-mono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-filter-selects">
            <select
              className="form-input font-mono"
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
            >
              <option value="All">All Tiers</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Mid-Market">Mid-Market</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="crm-table-container">
          <table className="crm-data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Company Name</th>
                <th>Contact</th>
                <th>Email / Phone</th>
                <th>Industry</th>
                <th>Contract Value</th>
                <th>Assigned Rep</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted" style={{ padding: '30px' }}>
                    No customer accounts match your search filters.
                  </td>
                </tr>
              ) : (
                filtered.map((cust) => (
                  <tr key={cust.id}>
                    <td className="font-mono text-xs text-muted">{cust.id}</td>
                    <td className="font-semibold">{cust.name}</td>
                    <td>{cust.contactPerson}</td>
                    <td className="font-mono text-xs">
                      <div>{cust.email}</div>
                      <div className="text-muted">{cust.phone}</div>
                    </td>
                    <td>{cust.industry}</td>
                    <td className="font-mono font-bold text-tertiary">{cust.value}</td>
                    <td className="font-mono text-xs">
                      <span className="pill-metric">{cust.assignedTo}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs font-mono"
                        onClick={() => alert(`Customer Dossier: ${cust.name}`)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CompanyLayout>
  );
}
