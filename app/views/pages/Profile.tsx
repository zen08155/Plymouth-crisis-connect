import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    surname: '',
    dob: '',
    email: '',
    phone: '',
    password: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div className="pf-page">
      {/* Header */}
      <div className="pf-header">
        <button className="pf-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="pf-tab">PROFILE</div>
      </div>

      {/* Body */}
      <div className="pf-body">
        {/* Form column */}
        <div className="pf-form-col">
          <div className="pf-field">
            <label className="pf-label" htmlFor="pf-name">Name:</label>
            <input
              id="pf-name"
              className="pf-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="given-name"
            />
          </div>

          <div className="pf-field">
            <label className="pf-label" htmlFor="pf-surname">Surname:</label>
            <input
              id="pf-surname"
              className="pf-input"
              type="text"
              name="surname"
              value={form.surname}
              onChange={handleChange}
              autoComplete="family-name"
            />
          </div>

          <div className="pf-field">
            <label className="pf-label" htmlFor="pf-dob">Date of birth:</label>
            <input
              id="pf-dob"
              className="pf-input"
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
            />
          </div>

          <div className="pf-field">
            <label className="pf-label" htmlFor="pf-email">Email:</label>
            <input
              id="pf-email"
              className="pf-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="pf-field">
            <label className="pf-label" htmlFor="pf-phone">Phone number:</label>
            <div className="pf-phone-row">
              <span className="pf-phone-prefix">+31</span>
              <input
                id="pf-phone"
                className="pf-input pf-input--phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                placeholder=""
              />
            </div>
          </div>

          <div className="pf-field">
            <label className="pf-label" htmlFor="pf-password">Password:</label>
            <input
              id="pf-password"
              className="pf-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>
        </div>

        {/* Avatar column */}
        <div className="pf-avatar-col">
          <div className="pf-avatar" aria-label="Profile picture">
            <svg width="68" height="68" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="pf-footer">
        <button className="pf-save-btn">Save Changes</button>
      </div>
    </div>
  );
}
