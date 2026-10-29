import React, { useState, useEffect, useCallback } from 'react';
import CompanyLayout from '../../components/Layout/CompanyLayout';
import { useAuth } from '../../context/AuthContext';
import { activityApi } from '../../api/activityApi';

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newAction, setNewAction] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await activityApi.getActivities({ page: 0, size: 100 });
      setActivities(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newAction.trim()) return;

    setSubmitting(true);
    try {
      await activityApi.createActivity({
        action: newAction.trim(),
        target: newTarget.trim() || 'Workspace General',
        type: 'task'
      });
      setNewAction('');
      setNewTarget('');
      setShowModal(false);
      await loadActivities();
    } catch (err) {
      alert(err.message || 'Failed to log activity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CompanyLayout
      pageTitle="Work Activities & Audit Trail"
      pageSubtitle={`Chronological log of interactions and CRM task touches for ${user?.companyName} (${activities.length} entries)`}
      actions={
        <button
          type="button"
          className="btn btn-primary font-mono btn-sm"
          onClick={() => setShowModal(true)}
        >
          + Log Activity
        </button>
      }
    >
      <div className="crm-panel-card">
        <div className="panel-card-header">
          <div>
            <h3 className="panel-card-title">Activity Timeline</h3>
            <p className="panel-card-subtitle">Real database audit touches across leads, accounts, and tasks</p>
          </div>
        </div>

        {error && (
          <div className="auth-alert alert-error font-mono m-4">
            <span>{error}</span>
          </div>
        )}

        <div className="crm-activity-feed" style={{ padding: '16px' }}>
          {loading ? (
            <div className="crm-empty-state font-mono">Loading activity stream from database...</div>
          ) : activities.length === 0 ? (
            <div className="crm-empty-state font-mono">No logged activities found for this workspace.</div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="activity-row">
                <div className="act-bullet employee-bullet"></div>
                <div className="act-body">
                  <div className="act-action font-medium">
                    <strong>{act.userName || 'Member'}</strong>: {act.action}
                  </div>
                  <div className="act-meta font-mono">
                    <span>Context: <strong>{act.target || 'General'}</strong></span>
                    <span>&bull;</span>
                    <span>{act.time || 'Recently'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Activity Modal */}
      {showModal && (
        <div className="sa-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h3 className="sa-modal-title">Log New Work Activity</h3>
              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddActivity}>
              <div className="sa-modal-body">
                <div className="form-group mb-3">
                  <label className="form-label">Action Description</label>
                  <textarea
                    rows={3}
                    className="form-input font-mono"
                    placeholder="e.g. Conducted technical demo with operations team..."
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target / Context / Lead</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. Acme Health or APAC Pipeline"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                  />
                </div>
              </div>
              <div className="sa-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary font-mono btn-sm"
                  disabled={submitting}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary font-mono btn-sm" disabled={submitting}>
                  {submitting ? 'Logging...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CompanyLayout>
  );
}
