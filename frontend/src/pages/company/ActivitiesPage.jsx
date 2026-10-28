import React from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { MOCK_ACTIVITIES } from '../../data/mockTenantData';

export default function ActivitiesPage() {
  const { user, companyId } = useAuth();
  const currentUserId = user?.userId;

  // Employee only sees their own work activities
  const myActivities = MOCK_ACTIVITIES.filter(
    (a) => a.companyId === companyId && a.userId === currentUserId
  );

  return (
    <CompanyLayout
      pageTitle="My Work Activities & Audit Trail"
      pageSubtitle={`Chronological work log of sales interactions and task updates by ${user?.name}`}
    >
      <div className="crm-panel-card">
        <div className="panel-card-header">
          <div>
            <h3 className="panel-card-title">Activity Timeline</h3>
            <p className="panel-card-subtitle">Logged touches across leads, accounts, and tasks</p>
          </div>
        </div>

        <div className="crm-activity-feed" style={{ padding: '16px' }}>
          {myActivities.length === 0 ? (
            <div className="crm-empty-state font-mono">No logged activities found for your profile.</div>
          ) : (
            myActivities.map((act) => (
              <div key={act.id} className="activity-row">
                <div className="act-bullet employee-bullet"></div>
                <div className="act-body">
                  <div className="act-action font-medium">{act.action}</div>
                  <div className="act-meta font-mono">
                    <span>Context: <strong>{act.target}</strong></span>
                    <span>&bull;</span>
                    <span>{act.time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </CompanyLayout>
  );
}
