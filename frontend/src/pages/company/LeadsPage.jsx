import React, { useState } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { MOCK_LEADS } from '../../data/mockTenantData';
import RoleGuard from '../../components/RoleGuard/RoleGuard';

export default function LeadsPage() {
  const { user, role, companyId } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  // Role isolation: Employee only views their assigned leads
  const baseLeads = MOCK_LEADS.filter((l) => {
    if (l.companyId !== companyId) return false;
    if (role === 'employee') {
      return l.assignedTo === user?.userId;
    }
    return true;
  });

  const filtered = baseLeads.filter((l) => {
    const matchesSearch =
      !searchTerm ||
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'All' || l.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <CompanyLayout
      pageTitle={role === 'employee' ? 'My Assigned Deals & Leads' : 'Commercial Deals Pipeline'}
      pageSubtitle={`Inbound opportunities and qualification pipeline for ${user?.companyName}`}
      actions={
        <RoleGuard allowedRoles={['company_admin', 'manager']}>
          <button
            type="button"
            className="btn btn-primary font-mono btn-sm"
            onClick={() => alert('New Lead Creation Modal (Mock Action)')}
          >
            + Create Deal / Lead
          </button>
        </RoleGuard>
      }
    >
      <div className="crm-panel-card">
        {/* Filters */}
        <div className="crm-filter-toolbar">
          <div className="crm-search-box">
            <input
              type="text"
              placeholder="Search leads by title, account, or contact..."
              className="form-input font-mono"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="crm-filter-selects">
            <select
              className="form-input font-mono"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="All">All Stages</option>
              <option value="Prospecting">Prospecting</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Negotiation">Negotiation</option>
            </select>
          </div>
        </div>

        {/* Leads Grid/Cards */}
        <div className="crm-leads-grid-view">
          {filtered.length === 0 ? (
            <div className="crm-empty-state font-mono">No leads match the specified criteria.</div>
          ) : (
            filtered.map((lead) => (
              <div key={lead.id} className="crm-lead-card-detailed">
                <div className="lead-card-head">
                  <div>
                    <span className="lead-id-tag font-mono">{lead.id}</span>
                    <h3 className="lead-card-company">{lead.company}</h3>
                  </div>
                  <span className="lead-card-val font-mono">{lead.estimatedValue}</span>
                </div>

                <p className="lead-card-title text-sm">{lead.title}</p>

                <div className="lead-card-meta font-mono text-xs">
                  <div>Contact: <strong>{lead.contactName}</strong></div>
                  <div>Email: {lead.email}</div>
                  <div>Phone: {lead.phone}</div>
                </div>

                <div className="lead-card-foot">
                  <span className="lead-stage-pill font-mono">{lead.stage}</span>
                  <span className="lead-assigned-pill font-mono">
                    Owner: {lead.assignedTo}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </CompanyLayout>
  );
}
