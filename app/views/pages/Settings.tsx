import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';

interface User {
  id: number;
  name: string;
  role: string;
}

type ToggleKey =
  | 'pushNotifications'
  | 'locationSharing'
  | 'emergencyAlerts';

interface SettingsState {
  pushNotifications: boolean;
  locationSharing: boolean;
  emergencyAlerts: boolean;
  availability: 'available' | 'busy' | 'offline';
}

const MOCK_USERS: User[] = [
  { id: 1, name: 'Coordinator', role: 'System manager' },
  { id: 2, name: 'Volunteer team', role: 'Responder' },
  { id: 3, name: 'Support desk', role: 'Service' },
  { id: 4, name: 'Incident lead', role: 'Admin' },
];

const DEFAULT_SETTINGS: SettingsState = {
  pushNotifications: true,
  locationSharing: false,
  emergencyAlerts: true,
  availability: 'available',
};

const STORAGE_KEY = 'plymouth-crisis-settings';

function loadSettings(): SettingsState {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(saved),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function getCurrentUserId() {
  try {
    const user = JSON.parse(window.localStorage.getItem('plymouth-user') ?? 'null');
    return Number(user?.id || user?.userId || 2);
  } catch {
    return 2;
  }
}

function getStoredUserRole() {
  try {
    const user = JSON.parse(window.localStorage.getItem('plymouth-user') ?? 'null');
    return String(user?.role || '');
  } catch {
    return '';
  }
}

export default function Settings() {
  const navigate = useNavigate();
<<<<<<< Updated upstream
=======
  const { openSidebar, role } = useApp();
>>>>>>> Stashed changes
  const [usersExpanded, setUsersExpanded] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const [saveStatus, setSaveStatus] = useState('');
  const currentRole = getStoredUserRole() || role;
  const canViewUsers = currentRole === 'admin' || currentRole === 'system_manager';

  useEffect(() => {
    const userId = getCurrentUserId();

    fetch(`/api/settings?userId=${userId}`)
      .then(response => response.ok ? response.json() : null)
      .then(payload => {
        if (!payload?.settings) {
          return;
        }

        const loadedSettings = {
          ...DEFAULT_SETTINGS,
          ...payload.settings,
        };

        setSettings(loadedSettings);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedSettings));
      })
      .catch(() => {
        setSaveStatus('Using local settings');
      });
  }, []);

  const saveSettings = (nextSettings: SettingsState) => {
    const userId = getCurrentUserId();
    setSettings(nextSettings);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
    setSaveStatus('Saving...');

    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        ...nextSettings,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Settings were not saved to the database.');
        }

        return response.json();
      })
      .then(() => setSaveStatus('Saved to database'))
      .catch(() => setSaveStatus('Saved locally'));
  };

  const toggleSetting = (key: ToggleKey) => {
    const nextSettings = {
      ...settings,
      [key]: !settings[key],
    };

    saveSettings(nextSettings);
  };

  const renderSwitch = (key: ToggleKey, label: string, detail: string) => (
    <div className="set-setting-row">
      <div className="set-setting-copy">
        <span className="set-setting-title">{label}</span>
        <span className="set-setting-detail">{detail}</span>
      </div>
      <button
        className={`set-switch ${settings[key] ? 'set-switch--on' : ''}`}
        type="button"
        role="switch"
        aria-checked={settings[key]}
        aria-label={label}
        onClick={() => toggleSetting(key)}
      >
        <span className="set-switch-knob" />
      </button>
    </div>
  );

  return (
    <div className="set-page">
<<<<<<< Updated upstream
      <AppHeader title="Settings" />
=======
      <div className="pf-header">
        <button className="pf-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="pf-tab">Settings</div>
        <button className="ah-hamburger" onClick={openSidebar} aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
      </div>
>>>>>>> Stashed changes

      <div className="set-body">
        <div className="set-profile-row">
          <div className="set-pfp" aria-label="Profile picture">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="set-profile-info">
            <span className="set-profile-name">Volunteer account</span>
            <span className="set-profile-dot">-</span>
            <span className="set-profile-role">Settings</span>
          </div>
        </div>

        {canViewUsers && (
          <>
            <button
              className={`set-users-toggle ${usersExpanded ? 'set-users-toggle--open' : ''}`}
              type="button"
              onClick={() => setUsersExpanded(v => !v)}
            >
              <span>View list of all users</span>
              <svg
                className={`set-chevron ${usersExpanded ? 'set-chevron--rotated' : ''}`}
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {usersExpanded && (
              <div className="set-user-list">
                {MOCK_USERS.map(user => (
                  <div key={user.id} className="set-user-row">
                    <div className="set-user-pfp" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <span className="set-user-name">{user.name}</span>
                    <span className="set-user-dot">-</span>
                    <span className="set-user-role">{user.role}</span>
                    <button className="set-report-btn" type="button">Report</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <section className="set-section" aria-labelledby="settings-services">
          <div className="set-section-header">
            <h2 id="settings-services">Services</h2>
          </div>
          {renderSwitch('pushNotifications', 'Push notifications', 'Receive urgent updates from coordinators.')}
          {renderSwitch('locationSharing', 'Location services', 'Share location during active response work.')}
        </section>

        <section className="set-section" aria-labelledby="settings-account">
          <div className="set-section-header">
            <h2 id="settings-account">Account</h2>
          </div>

          <label className="set-setting-row" htmlFor="availability-status">
            <div className="set-setting-copy">
              <span className="set-setting-title">Availability status</span>
              <span className="set-setting-detail">Choose how your team sees your status.</span>
            </div>
            <select
              id="availability-status"
              className="set-select"
              value={settings.availability}
              onChange={event => saveSettings({
                ...settings,
                availability: event.target.value as SettingsState['availability'],
              })}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </label>

          {renderSwitch('emergencyAlerts', 'Emergency alerts', 'Keep critical alerts active.')}
        </section>

        {saveStatus && <p className="set-save-status" role="status">{saveStatus}</p>}

        <button className="set-leave-btn" type="button">Leave the event</button>
      </div>
    </div>
  );
}
