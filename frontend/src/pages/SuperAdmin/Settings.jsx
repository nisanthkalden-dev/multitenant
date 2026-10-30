import React, { useState, useRef } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { useTheme } from '../../context/ThemeContext';
import { userApi } from '../../api/userApi';
import AdminLayout from '../../components/SuperAdmin/AdminLayout';

export default function SuperAdminSettings() {
  const { theme: currentTheme, setTheme: setGlobalTheme } = useTheme();
  const {
    generalSettings,
    setGeneralSettings,
    profileSettings,
    setProfileSettings,
    securitySettings,
    setSecuritySettings,
    notificationSettings,
    setNotificationSettings,
    saveSettingsAction,
    removeLogoAction,
    refreshAll
  } = useSuperAdmin();

  const [activeTab, setActiveTab] = useState('general');
  const [saveFeedback, setSaveFeedback] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [isRemovingLogo, setIsRemovingLogo] = useState(false);
  const [showConfirmRemoveAvatar, setShowConfirmRemoveAvatar] = useState(false);
  const [showConfirmRemoveLogo, setShowConfirmRemoveLogo] = useState(false);

  // Local form states
  const [generalForm, setGeneralForm] = useState({ ...generalSettings });
  const [profileForm, setProfileForm] = useState({ ...profileSettings });

  // Sync when context settings load
  React.useEffect(() => {
    setGeneralForm({ ...generalSettings });
  }, [generalSettings]);

  React.useEffect(() => {
    setProfileForm({ ...profileSettings });
  }, [profileSettings]);

  const [securityPassword, setSecurityPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const generalFileInputRef = useRef(null);
  const profileFileInputRef = useRef(null);

  const handleGeneralImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setGeneralForm((prev) => ({ ...prev, logoUrl: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileForm((prev) => ({ ...prev, avatarUrl: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const showSaveSuccess = (msg) => {
    setSaveFeedback(msg);
    setSaveError('');
    setTimeout(() => setSaveFeedback(''), 4000);
  };

  const showSaveError = (msg) => {
    setSaveError(msg);
    setSaveFeedback('');
    setTimeout(() => setSaveError(''), 5000);
  };

  const handleGeneralSave = async (e) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    setSaveError('');
    try {
      if (saveSettingsAction) {
        await saveSettingsAction(generalForm);
      } else {
        setGeneralSettings(generalForm);
      }
      showSaveSuccess('General platform settings saved successfully to MySQL database!');
    } catch (err) {
      showSaveError(err.message || 'Failed to save settings to database');
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setSaveError('');
    try {
      const payload = {
        name: profileForm.fullName,
        fullName: profileForm.fullName,
        email: profileForm.email,
        phone: profileForm.phone,
        avatar: profileForm.avatarUrl
      };
      await userApi.updateProfile(payload);
      setProfileSettings(profileForm);

      // Update session storage so avatar persists across refreshes and logout/login
      try {
        const rawSession = localStorage.getItem('nexora_auth_session');
        if (rawSession) {
          const session = JSON.parse(rawSession);
          if (session.user) {
            session.user.name = profileForm.fullName;
            session.user.fullName = profileForm.fullName;
            session.user.email = profileForm.email;
            session.user.phone = profileForm.phone;
            session.user.avatar = profileForm.avatarUrl || 'SA';
          }
          localStorage.setItem('nexora_auth_session', JSON.stringify(session));
        }
      } catch (ignored) {}

      if (refreshAll) {
        await refreshAll();
      }
      showSaveSuccess('Super Admin profile and photo updated and saved in MySQL database!');
    } catch (err) {
      showSaveError(err.message || 'Failed to update profile in database');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleConfirmRemoveAvatar = async () => {
    setIsRemovingAvatar(true);
    setSaveError('');
    try {
      const updatedUser = await userApi.removeAvatar();
      setProfileForm((prev) => ({ ...prev, avatarUrl: null }));
      setProfileSettings((prev) => ({ ...prev, avatarUrl: null }));
      if (profileFileInputRef.current) profileFileInputRef.current.value = '';

      // Clear avatar from localStorage session
      try {
        const rawSession = localStorage.getItem('nexora_auth_session');
        if (rawSession) {
          const session = JSON.parse(rawSession);
          if (session.user) {
            session.user.avatar = null;
          }
          localStorage.setItem('nexora_auth_session', JSON.stringify(session));
        }
      } catch (ignored) {}

      if (refreshAll) {
        await refreshAll();
      }
      setShowConfirmRemoveAvatar(false);
      showSaveSuccess('Profile picture removed successfully from MySQL database!');
    } catch (err) {
      showSaveError(err.message || 'Failed to remove profile picture');
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const handleConfirmRemoveLogo = async () => {
    setIsRemovingLogo(true);
    setSaveError('');
    try {
      if (removeLogoAction) {
        await removeLogoAction();
      }
      setGeneralForm((prev) => ({ ...prev, logoUrl: null }));
      setGeneralSettings((prev) => ({ ...prev, logoUrl: null }));
      if (generalFileInputRef.current) generalFileInputRef.current.value = '';

      if (refreshAll) {
        await refreshAll();
      }
      setShowConfirmRemoveLogo(false);
      showSaveSuccess('Platform brand logo removed successfully from MySQL database!');
    } catch (err) {
      showSaveError(err.message || 'Failed to remove brand logo');
    } finally {
      setIsRemovingLogo(false);
    }
  };

  const [passwordError, setPasswordError] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!securityPassword.currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (!securityPassword.newPassword) {
      setPasswordError('New password is required.');
      return;
    }

    if (securityPassword.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (securityPassword.newPassword !== securityPassword.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (securityPassword.newPassword === securityPassword.currentPassword) {
      setPasswordError('New password cannot be the same as the current password.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      await userApi.changePassword({
        currentPassword: securityPassword.currentPassword,
        oldPassword: securityPassword.currentPassword,
        newPassword: securityPassword.newPassword
      });
      setSecurityPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSaveSuccess('Password updated successfully');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const toggleNotification = (key) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AdminLayout title="Platform Governance & Settings" breadcrumb={['Settings']}>
      {/* Settings Navigation Tabs */}
      <div className="sa-settings-tabs" role="tablist">
        <button
          type="button"
          className={`sa-settings-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span>General</span>
        </button>

        <button
          type="button"
          className={`sa-settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Super Admin Profile</span>
        </button>

        <button
          type="button"
          className={`sa-settings-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Security</span>
        </button>

        <button
          type="button"
          className={`sa-settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span>Notifications</span>
        </button>

        {/* <button
          type="button"
          className={`sa-settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          <span>Platform Preferences</span>
        </button> */}
      </div>

      {/* Floating Save Feedback */}
      {saveFeedback && (
        <div className="auth-alert alert-success font-mono mb-4" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{saveFeedback}</span>
        </div>
      )}
      {saveError && (
        <div className="auth-alert alert-error font-mono mb-4" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{saveError}</span>
        </div>
      )}

      {/* 1. General Settings Panel */}
      {activeTab === 'general' && (
        <div className="sa-card">
          <div className="sa-card-header">
            <div>
              <h2 className="sa-card-title">General Platform Settings</h2>
              <p className="sa-card-subtitle">Global brand metadata and localization defaults</p>
            </div>
          </div>
          <div className="sa-card-body">
            <form onSubmit={handleGeneralSave}>
              {/* Platform Logo / Image UI */}
              <div className="sa-profile-photo-row mb-6">
                <div className="sa-general-logo-preview font-mono">
                  {generalForm.logoUrl ? (
                    <img
                      src={generalForm.logoUrl}
                      alt="Platform Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                    />
                  ) : (
                    <span>{generalForm.platformName ? generalForm.platformName.slice(0, 2).toUpperCase() : 'NX'}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Platform Brand Logo</h4>
                  <p className="text-muted text-sm mb-3">JPG, GIF, SVG or PNG. Recommended size: square or 1:1, max 2MB.</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="file"
                      ref={generalFileInputRef}
                      onChange={handleGeneralImageChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs font-mono"
                      onClick={() => generalFileInputRef.current && generalFileInputRef.current.click()}
                    >
                      {generalForm.logoUrl ? 'Change Image' : 'Upload Image'}
                    </button>
                    {generalForm.logoUrl && (
                      <button
                        type="button"
                        className="btn btn-danger btn-xs font-mono"
                        onClick={() => setShowConfirmRemoveLogo(true)}
                        disabled={isRemovingLogo}
                      >
                        {isRemovingLogo ? 'Removing...' : 'Remove Image'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="sa-form-grid-2">
                <div className="form-group">
                  <label className="form-label">Platform Name</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={generalForm.platformName}
                    onChange={(e) => setGeneralForm({ ...generalForm, platformName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Platform Support Email</label>
                  <input
                    type="email"
                    className="form-input font-mono"
                    value={generalForm.platformEmail}
                    onChange={(e) => setGeneralForm({ ...generalForm, platformEmail: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Support Phone</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={generalForm.supportPhone}
                    onChange={(e) => setGeneralForm({ ...generalForm, supportPhone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Default Currency</label>
                  <select
                    className="form-input font-mono"
                    value={generalForm.defaultCurrency}
                    onChange={(e) => setGeneralForm({ ...generalForm, defaultCurrency: e.target.value })}
                  >
                    <option value="INR - ₹">INR - ₹ (Indian Rupee)</option>
                    <option value="USD - $">USD - $ (US Dollar)</option>
                    <option value="EUR - €">EUR - € (Euro)</option>
                    <option value="GBP - £">GBP - £ (British Pound)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Default Timezone</label>
                  <select
                    className="form-input font-mono"
                    value={generalForm.defaultTimezone}
                    onChange={(e) => setGeneralForm({ ...generalForm, defaultTimezone: e.target.value })}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date Format</label>
                  <select
                    className="form-input font-mono"
                    value={generalForm.dateFormat}
                    onChange={(e) => setGeneralForm({ ...generalForm, dateFormat: e.target.value })}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 24/10/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/24/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                  </select>
                </div>
              </div>

              <div className="sa-form-footer mt-6">
                <button
                  type="button"
                  className="btn btn-secondary font-mono"
                  onClick={() => setGeneralForm({ ...generalSettings })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary font-mono"
                  disabled={isSavingGeneral}
                >
                  {isSavingGeneral ? 'Saving to Database...' : 'Save General Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Super Admin Profile Panel */}
      {activeTab === 'profile' && (
        <div className="sa-card">
          <div className="sa-card-header">
            <div>
              <h2 className="sa-card-title">Super Admin Profile</h2>
              <p className="sa-card-subtitle">Master operator credentials and contact points</p>
            </div>
          </div>
          <div className="sa-card-body">
            <form onSubmit={handleProfileSave}>
              {/* Profile Photo UI */}
              <div className="sa-profile-photo-row mb-6">
                <div className="sa-profile-avatar-preview font-mono">
                  {profileForm.avatarUrl ? (
                    <img
                      src={profileForm.avatarUrl}
                      alt="Super Admin Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <span>
                      {profileForm.fullName
                        ? profileForm.fullName
                            .split(' ')
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase() || 'SA'
                        : 'SA'}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Profile Avatar</h4>
                  <p className="text-muted text-sm mb-3">JPG, GIF or PNG. Max size of 2MB.</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="file"
                      ref={profileFileInputRef}
                      onChange={handleProfileImageChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs font-mono"
                      onClick={() => profileFileInputRef.current && profileFileInputRef.current.click()}
                    >
                      {profileForm.avatarUrl ? 'Change Photo' : 'Upload New Photo'}
                    </button>
                    {profileForm.avatarUrl && (
                      <button
                        type="button"
                        className="btn btn-danger btn-xs font-mono"
                        onClick={() => setShowConfirmRemoveAvatar(true)}
                        disabled={isRemovingAvatar}
                      >
                        {isRemovingAvatar ? 'Removing...' : 'Remove Photo'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="sa-form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input font-mono"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">User ID</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    disabled
                    value={profileForm.userId}
                  />
                  <span className="text-xs text-muted font-mono mt-1">Super Admin primary identifier (immutable)</span>
                </div>
              </div>

              <div className="sa-form-footer mt-6">
                <button
                  type="submit"
                  className="btn btn-primary font-mono"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? 'Saving to Database...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Security Settings Panel */}
      {activeTab === 'security' && (
        <div className="sa-card-stack sa-security-panel">
          {/* Change Password Card */}
          <div className="sa-card mb-6 sa-security-card">
            <div className="sa-card-header">
              <div>
                <h2 className="sa-card-title">Change Password</h2>
                <p className="sa-card-subtitle">Update root master security passphrase</p>
              </div>
            </div>
            <div className="sa-card-body">
              <form onSubmit={handlePasswordSave}>
                <div className="sa-security-pw-grid">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-input font-mono"
                      placeholder="••••••••••••"
                      value={securityPassword.currentPassword}
                      onChange={(e) =>
                        setSecurityPassword({ ...securityPassword, currentPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input font-mono"
                      placeholder="••••••••••••"
                      value={securityPassword.newPassword}
                      onChange={(e) =>
                        setSecurityPassword({ ...securityPassword, newPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input font-mono"
                      placeholder="••••••••••••"
                      value={securityPassword.confirmPassword}
                      onChange={(e) =>
                        setSecurityPassword({ ...securityPassword, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                {passwordError && (
                  <div className="alert alert-error font-mono mb-4" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {passwordError}
                  </div>
                )}
                <div className="sa-form-footer sa-security-pw-footer mt-5">
                  <button type="submit" disabled={passwordSubmitting} className="btn btn-primary font-mono sa-btn-security">
                    {passwordSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Two-Factor Authentication Card */}
          {/* <div className="sa-card mb-6 sa-security-card">
            <div className="sa-card-header sa-2fa-header">
              <div className="sa-2fa-title-group">
                <div className="sa-2fa-icon-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="sa-card-title">Two-Factor Authentication (2FA)</h3>
                  <p className="sa-card-subtitle">Require TOTP code verification on Super Admin login</p>
                </div>
              </div>
              <div className="sa-2fa-toggle-wrap">
                <span className="sa-2fa-state-text font-mono">
                  {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <label className="sa-toggle-switch">
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorEnabled}
                    onChange={() =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        twoFactorEnabled: !prev.twoFactorEnabled
                      }))
                    }
                  />
                  <span className="sa-toggle-slider"></span>
                </label>
              </div>
            </div>
            <div className="sa-card-body">
              <div className="sa-2fa-info-box">
                <p className="text-sm text-muted">
                  {securitySettings.twoFactorEnabled
                    ? 'Two-Factor Authentication is currently active for master account superadmin.'
                    : 'Two-Factor Authentication is disabled. We strongly recommend enabling TOTP authenticator protection.'}
                </p>
                {securitySettings.twoFactorEnabled && (
                  <div className="sa-2fa-active-badge font-mono">
                    <span className="status-indicator-dot"></span>
                    <span>TOTP Authenticator Protected</span>
                  </div>
                )}
              </div>
            </div>
          </div> */}

          {/* Login Activity Card */}
          {/* <div className="sa-card p-0 overflow-hidden sa-security-card"> */}
            {/* <div className="sa-card-header p-4" style={{ borderBottom: '1px solid var(--border-color)',padding:'20px' }}>
              <div>
                <h3 className="sa-card-title">Active Login Sessions</h3>
                <p className="sa-card-subtitle">Devices and geographic locations authorized on this platform</p>
              </div>
            </div> */}

            {/* Desktop & Laptop Table View */}
            {/* <div className="sa-table-responsive sa-desktop-only-table">
              <table className="sa-table sa-security-table">
                <thead>
                  <tr>
                    <th style={{ width: '38%' }}>Device & Browser</th>
                    <th style={{ width: '26%' }}>Location</th>
                    <th style={{ width: '20%' }}>Last Active</th>
                    <th className="text-right" style={{ width: '16%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {securitySettings.loginActivity.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <div className="sa-device-cell">
                          <span className="sa-device-icon-box">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                              <line x1="8" y1="21" x2="16" y2="21"></line>
                              <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                          </span>
                          <span className="sa-device-name font-semibold">{session.device}</span>
                        </div>
                      </td>
                      <td>
                        <div className="sa-location-wrapper font-mono">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>{session.location}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono sa-date-cell">{session.lastActive}</span>
                      </td>
                      <td className="text-right">
                        {session.current ? (
                          <span className="sa-status-badge sa-badge-active font-mono">Current Session</span>
                        ) : (
                          <span className="sa-status-badge sa-badge-trial font-mono">Authorized</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> */}

            {/* Mobile / Tablet Responsive Sessions List */}
            {/* <div className="sa-mobile-only-cards sa-security-sessions-mobile">
              {securitySettings.loginActivity.map((session) => (
                <div key={session.id} className="sa-mobile-entity-card sa-session-card">
                  <div className="sa-mobile-card-top">
                    <div className="sa-device-cell">
                      <span className="sa-device-icon">💻</span>
                      <div>
                        <div className="font-semibold text-sm">{session.device}</div>
                        <div className="sa-meta-lbl font-mono">{session.location}</div>
                      </div>
                    </div>
                    {session.current ? (
                      <span className="sa-status-badge sa-badge-active font-mono">Current</span>
                    ) : (
                      <span className="sa-status-badge sa-badge-trial font-mono">Active</span>
                    )}
                  </div>

                  <div className="sa-session-card-bottom font-mono">
                    <span className="sa-meta-lbl">Last Active:</span>
                    <span className="sa-meta-val sa-date-cell">{session.lastActive}</span>
                  </div>
                </div>
              ))}
            </div> */}
          {/* </div> */}
        </div>
      )}

      {/* 4. Notification Settings Panel */}
      {activeTab === 'notifications' && (
        <div className="sa-card-stack">
          {/* Email Notifications */}
          <div className="sa-card mb-6">
            <div className="sa-card-header">
              <div>
                <h2 className="sa-card-title">Email Notification Alerts</h2>
                <p className="sa-card-subtitle">Trigger automated emails to platform operations</p>
              </div>
            </div>
            <div className="sa-card-body">
              <div className="sa-toggle-list">
                <div className="sa-toggle-row">
                  <div>
                    <div className="sa-toggle-title">New company registration</div>
                    <div className="sa-toggle-desc">Receive immediate alerts when a new tenant registers</div>
                  </div>
                  <label className="sa-toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailCompanyRegistration}
                      onChange={() => toggleNotification('emailCompanyRegistration')}
                    />
                    <span className="sa-toggle-slider"></span>
                  </label>
                </div>

                <div className="sa-toggle-row">
                  <div>
                    <div className="sa-toggle-title">Subscription expiration warnings</div>
                    <div className="sa-toggle-desc">Notify when a customer subscription or license is 7 days from expiry</div>
                  </div>
                  <label className="sa-toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailSubscriptionExpiration}
                      onChange={() => toggleNotification('emailSubscriptionExpiration')}
                    />
                    <span className="sa-toggle-slider"></span>
                  </label>
                </div>

                <div className="sa-toggle-row">
                  <div>
                    <div className="sa-toggle-title">Payment notifications</div>
                    <div className="sa-toggle-desc">Receive transaction receipts and invoice renewals</div>
                  </div>
                  <label className="sa-toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailPaymentNotification}
                      onChange={() => toggleNotification('emailPaymentNotification')}
                    />
                    <span className="sa-toggle-slider"></span>
                  </label>
                </div>

                <div className="sa-toggle-row">
                  <div>
                    <div className="sa-toggle-title">Critical system alerts</div>
                    <div className="sa-toggle-desc">Database CPU thresholds, disk space, and downtime pings</div>
                  </div>
                  <label className="sa-toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailSystemAlerts}
                      onChange={() => toggleNotification('emailSystemAlerts')}
                    />
                    <span className="sa-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Notifications */}
          <div className="sa-card">
            <div className="sa-card-header">
              <div>
                <h3 className="sa-card-title">Super Admin In-App Alerts</h3>
                <p className="sa-card-subtitle">Workspace bell notifications and badges</p>
              </div>
            </div>
            <div className="sa-card-body">
              <div className="sa-toggle-list">
                <div className="sa-toggle-row">
                  <div>
                    <div className="sa-toggle-title">New user registrations</div>
                    <div className="sa-toggle-desc">Notify when individual employees join company workspaces</div>
                  </div>
                  <label className="sa-toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.adminUserRegistration}
                      onChange={() => toggleNotification('adminUserRegistration')}
                    />
                    <span className="sa-toggle-slider"></span>
                  </label>
                </div>

                <div className="sa-toggle-row">
                  <div>
                    <div className="sa-toggle-title">Company suspensions</div>
                    <div className="sa-toggle-desc">Trigger high-priority alerts upon manual or automated lockout</div>
                  </div>
                  <label className="sa-toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.adminCompanySuspension}
                      onChange={() => toggleNotification('adminCompanySuspension')}
                    />
                    <span className="sa-toggle-slider"></span>
                  </label>
                </div>

                <div className="sa-toggle-row">
                  <div>
                    <div className="sa-toggle-title">Platform announcements</div>
                    <div className="sa-toggle-desc">Broadcast updates and scheduled maintenance windows</div>
                  </div>
                  <label className="sa-toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.adminPlatformAnnouncements}
                      onChange={() => toggleNotification('adminPlatformAnnouncements')}
                    />
                    <span className="sa-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Platform Preferences Panel */}
      {/* {activeTab === 'preferences' && (
        <div className="sa-card">
          <div className="sa-card-header">
            <div>
              <h2 className="sa-card-title">Platform Preferences</h2>
              <p className="sa-card-subtitle">User experience and presentation customizations</p>
            </div>
          </div>
          <div className="sa-card-body">
            <div className="sa-form-grid-2">
              <div className="form-group">
                <label className="form-label">Theme Mode</label>
                <select
                  className="form-input font-mono"
                  value={currentTheme === 'light' ? 'Light' : 'Dark'}
                  onChange={(e) => {
                    const selected = e.target.value;
                    const newTheme = selected === 'Light' ? 'light' : 'dark';
                    setGlobalTheme(newTheme);
                    setPlatformPreferences({ ...platformPreferences, theme: selected });
                  }}
                >
                  <option value="Dark">Dark Mode</option>
                  <option value="Light">Light Mode</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Portal Language</label>
                <select
                  className="form-input font-mono"
                  value={platformPreferences.language}
                  onChange={(e) =>
                    setPlatformPreferences({ ...platformPreferences, language: e.target.value })
                  }
                >
                  <option value="English">English (United States / India)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Default Dashboard View</label>
                <select
                  className="form-input font-mono"
                  value={platformPreferences.defaultDashboardView}
                  onChange={(e) =>
                    setPlatformPreferences({
                      ...platformPreferences,
                      defaultDashboardView: e.target.value
                    })
                  }
                >
                  <option value="Overview">Overview Metrics & KPI Cards</option>
                  <option value="Analytics">Full Revenue & Subscription Analytics</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sidebar Layout Mode</label>
                <div className="sa-toggle-row mt-2" style={{ border: 'none', padding: 0 }}>
                  <span className="text-sm">Collapsed Sidebar by Default</span>
                  <label className="sa-toggle-switch">
                    <input
                      type="checkbox"
                      checked={platformPreferences.collapsedSidebar}
                      onChange={() =>
                        setPlatformPreferences((prev) => ({
                          ...prev,
                          collapsedSidebar: !prev.collapsedSidebar
                        }))
                      }
                    />
                    <span className="sa-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sa-form-footer mt-6">
              <button
                type="button"
                className="btn btn-primary font-mono"
                onClick={() => showSaveSuccess('Platform preferences')}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      {/* Confirmation Modal for Profile Avatar Removal */}
      {showConfirmRemoveAvatar && (
        <div className="sa-modal-backdrop" onClick={() => !isRemovingAvatar && setShowConfirmRemoveAvatar(false)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="sa-modal-header">
              <h3 className="font-semibold text-lg text-danger flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Remove Profile Picture
              </h3>
              <button
                type="button"
                className="sa-modal-close"
                onClick={() => !isRemovingAvatar && setShowConfirmRemoveAvatar(false)}
              >
                ✕
              </button>
            </div>
            <div className="sa-modal-body py-4">
              <p className="text-sm text-secondary">
                Are you sure you want to remove your profile picture? Your profile will revert to the default placeholder.
              </p>
            </div>
            <div className="sa-modal-footer flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                className="btn btn-secondary font-mono text-sm"
                onClick={() => setShowConfirmRemoveAvatar(false)}
                disabled={isRemovingAvatar}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger font-mono text-sm flex items-center gap-2"
                onClick={handleConfirmRemoveAvatar}
                disabled={isRemovingAvatar}
              >
                {isRemovingAvatar ? 'Removing...' : 'Yes, Remove Picture'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Brand Logo Removal */}
      {showConfirmRemoveLogo && (
        <div className="sa-modal-backdrop" onClick={() => !isRemovingLogo && setShowConfirmRemoveLogo(false)}>
          <div className="sa-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="sa-modal-header">
              <h3 className="font-semibold text-lg text-danger flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Remove Platform Brand Logo
              </h3>
              <button
                type="button"
                className="sa-modal-close"
                onClick={() => !isRemovingLogo && setShowConfirmRemoveLogo(false)}
              >
                ✕
              </button>
            </div>
            <div className="sa-modal-body py-4">
              <p className="text-sm text-secondary">
                Are you sure you want to remove the platform brand logo? The platform will revert to the default monogram display.
              </p>
            </div>
            <div className="sa-modal-footer flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                className="btn btn-secondary font-mono text-sm"
                onClick={() => setShowConfirmRemoveLogo(false)}
                disabled={isRemovingLogo}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger font-mono text-sm flex items-center gap-2"
                onClick={handleConfirmRemoveLogo}
                disabled={isRemovingLogo}
              >
                {isRemovingLogo ? 'Removing...' : 'Yes, Remove Logo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
