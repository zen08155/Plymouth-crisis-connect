import React, { useState } from 'react';
import AppHeader from '../components/AppHeader';

interface StoredUser {
  id: number;
  firstName?: string;
  surname?: string;
  email?: string;
  role?: string;
  birthday?: string;
  phone?: string;
}

function loadProfile() {
  try {
    const user = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null') as StoredUser | null;

    return {
      name: user?.firstName ?? '',
      surname: user?.surname ?? '',
      dob: user?.birthday ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      role: user?.role ?? 'volunteer',
      password: '',
    };
  } catch {
    return { name: '', surname: '', dob: '', email: '', phone: '', password: '', role: 'volunteer' };
  }
}

export default function Profile() {
  const [form, setForm] = useState(loadProfile);
  const [saved, setSaved] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSaved(false);
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem('plymouth-user') ?? '{}') as StoredUser;
    localStorage.setItem('plymouth-user', JSON.stringify({
      ...storedUser,
      firstName: form.name.trim(),
      surname: form.surname.trim(),
      email: form.email.trim(),
      birthday: form.dob,
      phone: form.phone.trim(),
    }));
    setSaved(true);
  }

  const displayName = [form.name, form.surname].filter(Boolean).join(' ') || 'Your profile';
  const initials = [form.name, form.surname]
    .filter(Boolean)
    .map(value => value.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2) || 'PC';

  return (
    <div className="pf-page">
      <AppHeader showBack title="PROFILE" />

      <main className="pf-main">
        <section className="pf-intro">
          <div>
            <span className="pf-eyebrow">Account settings</span>
            <h1>Personal information</h1>
            <p>Keep your contact details current so coordinators can reach you during an incident.</p>
          </div>
        </section>

        <div className="pf-layout">
          <aside className="pf-summary-card">
            <div className="pf-avatar" aria-label="Profile initials">{initials}</div>
            <h2>{displayName}</h2>
            <p>{form.email || 'No email address added'}</p>
            <span className="pf-role">{form.role.replace('_', ' ')}</span>
            <div className="pf-summary-note">
              Your profile details are only shared with authorised response coordinators.
            </div>
          </aside>

          <form className="pf-form-card" onSubmit={handleSubmit}>
            <div className="pf-form-heading">
              <div>
                <span className="pf-section-kicker">Profile details</span>
                <h2>Contact information</h2>
              </div>
              {saved && <span className="pf-saved" role="status">Changes saved</span>}
            </div>

            <div className="pf-name-grid">
              <div className="pf-field">
                <label className="pf-label" htmlFor="pf-name">First name</label>
                <input id="pf-name" className="pf-input" type="text" name="name"
                  value={form.name} onChange={handleChange} autoComplete="given-name" />
              </div>

              <div className="pf-field">
                <label className="pf-label" htmlFor="pf-surname">Surname</label>
                <input id="pf-surname" className="pf-input" type="text" name="surname"
                  value={form.surname} onChange={handleChange} autoComplete="family-name" />
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label" htmlFor="pf-email">Email address</label>
              <input id="pf-email" className="pf-input" type="email" name="email"
                value={form.email} onChange={handleChange} autoComplete="email" />
            </div>

            <div className="pf-contact-grid">
              <div className="pf-field">
                <label className="pf-label" htmlFor="pf-phone">Phone number</label>
                <input id="pf-phone" className="pf-input" type="tel" name="phone"
                  value={form.phone} onChange={handleChange} autoComplete="tel"
                  placeholder="+44 7700 900123" />
              </div>

              <div className="pf-field">
                <label className="pf-label" htmlFor="pf-dob">Date of birth</label>
                <input id="pf-dob" className="pf-input" type="date" name="dob"
                  value={form.dob} onChange={handleChange} autoComplete="bday" />
              </div>
            </div>

            <div className="pf-divider" />

            <div className="pf-field">
              <label className="pf-label" htmlFor="pf-password">New password</label>
              <input id="pf-password" className="pf-input" type="password" name="password"
                value={form.password} onChange={handleChange} autoComplete="new-password"
                placeholder="Leave blank to keep your current password" />
              <span className="pf-help">Use at least 8 characters when changing your password.</span>
            </div>

            <div className="pf-actions">
              <button className="pf-save-btn" type="submit">Save changes</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
