import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface User {
  id: number;
  name: string;
  role: string;
}

const MOCK_USERS: User[] = [
  { id: 1, name: '', role: '' },
  { id: 2, name: '', role: '' },
  { id: 3, name: '', role: '' },
  { id: 4, name: '', role: '' },
];

const SETTINGS_OPTIONS = [
  '',
  '',
  '',
];

export default function Settings() {
  const navigate = useNavigate();
  const { openSidebar } = useApp();
  const [usersExpanded, setUsersExpanded] = useState(false);

  return (
    <div className="set-page">
      {/* Header */}
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

      {/* Coordinator profile row */}
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
            <span className="set-profile-name"></span>
            <span className="set-profile-dot">•</span>
            <span className="set-profile-role"></span>
          </div>
          <button className="set-message-btn" onClick={() => navigate('/chat')}>
            Message
          </button>
        </div>

        {/* Users dropdown toggle */}
        <button
          className={`set-users-toggle ${usersExpanded ? 'set-users-toggle--open' : ''}`}
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

        {/* Expanded: user list with Report buttons */}
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
                <span className="set-user-dot">•</span>
                <span className="set-user-role">{user.role}</span>
                <button className="set-report-btn">Report</button>
              </div>
            ))}
          </div>
        )}

        {/* Collapsed: settings options list */}
        {!usersExpanded && (
          <div className="set-options-list">
            {SETTINGS_OPTIONS.map((opt, i) => (
              <button key={i} className="set-option-row">
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Leave event */}
        <button className="set-leave-btn">Leave the event</button>
      </div>
    </div>
  );
}
