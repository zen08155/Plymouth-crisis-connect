import React, { useMemo, useState } from 'react';
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js/min';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface RegistrationForm {
  firstName: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: CountryCode;
  phone: string;
  birthday: string;
}

interface RegistrationResponse {
  user: {
    id: number;
    firstName: string;
    surname: string;
    email: string;
    role: string;
  };
}

function countryFlag(countryCode: CountryCode) {
  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split('')
      .map(character => 127397 + character.charCodeAt(0)),
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [form, setForm] = useState<RegistrationForm>({
    firstName: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'GB',
    phone: '',
    birthday: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const countries = useMemo(() => {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });

    return getCountries()
      .map(country => ({
        code: country,
        flag: countryFlag(country),
        name: displayNames.of(country) ?? country,
        callingCode: getCountryCallingCode(country),
      }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const localPhone = form.phone.trim().replace(/^0+/, '');
      const phoneNumber = `+${getCountryCallingCode(form.country)}${localPhone}`;
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: form.firstName.trim(),
          surname: form.surname.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone_nr: phoneNumber,
          birthday: form.birthday,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.detail || 'Registration failed. Please try again.');
      }

      const { user } = payload as RegistrationResponse;
      if (!user) {
        throw new Error('Account created, but automatic login failed.');
      }

      localStorage.setItem('plymouth-user', JSON.stringify(user));
      // Nieuwe gebruiker -> front-end context zetten en naar de welcome/onboarding
      register(`${form.firstName} ${form.surname}`.trim());
      navigate('/welcome', { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide register-card">
        <div className="register-heading">
          <h1 className="register-title">Create your account</h1>
          <p className="register-subtitle">Register as a Plymouth Crisis Connect volunteer</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-row register-row-even">
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
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
                type="text"
                autoComplete="family-name"
                value={form.surname}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
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

          <div className="register-row register-row-even">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="register-row register-row-phone">
            <div className="form-group">
              <label htmlFor="country">Country calling code</label>
              <select
                id="country"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="country-select"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name} (+{country.callingCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="7700 900123"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="birthday">Date of birth</label>
            <input
              id="birthday"
              name="birthday"
              type="date"
              autoComplete="bday"
              value={form.birthday}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="register-error" role="alert">{error}</p>}

          <div className="register-actions">
            <button type="submit" className="create-btn register-save-btn" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Save and register'}
            </button>
            <button type="button" className="register-login-link" onClick={() => navigate('/login')}>
              Already registered? Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
