import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  getAuthToken,
  getAuthenticatedUser,
  getRoleDestination,
  loadCurrentUser,
  loginUser,
} from '../api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      return;
    }

    const storedUser = getAuthenticatedUser();

    if (storedUser) {
      navigate(getRoleDestination(storedUser.Role), { replace: true });
      return;
    }

    loadCurrentUser()
      .then((user) => {
        navigate(getRoleDestination(user.Role), { replace: true });
      })
      .catch(() => {
        // An expired session is cleared by loadCurrentUser.
      });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const login = await loginUser(email, password);
      navigate(getRoleDestination(login.user.Role));
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Login failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <button
        className="login-logo"
        type="button"
        onClick={() => navigate('/')}
        aria-label="Return home"
      >
        <Logo height={38} />
      </button>

      <div className="login-card">
        {location.state?.message && (
          <p className="login-success">{location.state.message}</p>
        )}
        <section className="login-section">
          <p className="login-heading">Log in to your account</p>

          <form className="manager-login-form" onSubmit={handleSubmit}>
            <label htmlFor="manager-email">Email</label>
            <input
              id="manager-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="manager-password">Password</label>
            <input
              id="manager-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && <p className="login-error" role="alert">{error}</p>}

            <button
              className="login-btn login-btn-yellow"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </section>

        <section className="login-section">
          <p className="login-heading">New volunteer?</p>
          <button
            className="login-btn login-btn-white"
            type="button"
            onClick={() => navigate('/register')}
          >
            Create an account
          </button>
        </section>
      </div>
    </div>
  );
}
