import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerVolunteer } from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    surname: '',
    email: '',
    password: '',
    countryCode: '+44',
    phone: '',
    dob: '',
    homeAddress: '',
    workAddress: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await registerVolunteer({
        first_name: form.firstName,
        surname: form.surname,
        email: form.email,
        password: form.password,
        country_code: form.countryCode,
        phone: form.phone,
        date_of_birth: form.dob,
        home_address: form.homeAddress,
        work_address: form.workAddress,
      });
      navigate('/login', {
        state: { message: 'Account created. You can now log in.' },
      });
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : 'Account creation failed.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1 className="register-title">Register</h1>
        <p className="register-subtitle">Create a volunteer account</p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-row">
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="surname">Surname</label>
              <input
                id="surname"
                name="surname"
                value={form.surname}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-row">
            <div className="form-group">
              <label htmlFor="dob">Date of birth</label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={form.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone number</label>
              <div className="phone-row">
                <select
                  name="countryCode"
                  value={form.countryCode}
                  onChange={handleChange}
                  className="country-select"
                  aria-label="Country code"
                >
                  <option value="+44">+44</option>
                  <option value="+31">+31</option>
                  <option value="+1">+1</option>
                  <option value="+90">+90</option>
                  <option value="+49">+49</option>
                  <option value="+33">+33</option>
                </select>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <hr className="form-divider" />

          <div className="form-group">
            <label htmlFor="homeAddress">Home address</label>
            <textarea
              id="homeAddress"
              name="homeAddress"
              rows={2}
              value={form.homeAddress}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="workAddress">Work address</label>
            <textarea
              id="workAddress"
              name="workAddress"
              rows={2}
              value={form.workAddress}
              onChange={handleChange}
            />
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" className="create-btn" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
