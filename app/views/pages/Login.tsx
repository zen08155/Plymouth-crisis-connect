import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useApp, type Role } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    firstName: string;
    surname: string;
    email: string;
    role: string;
  };
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const toast = useToast();
  const location = useLocation();
  const registrationMessage = (
    location.state as { registrationMessage?: string } | null
  )?.registrationMessage;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Social-login knoppen (geen backend): zet alleen de front-end context
  function handleLogin() {
    login();
    toast.success('You are now logged in.');
    navigate('/');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.detail || 'Unable to log in. Please try again.');
      }

      const { user, token } = payload as LoginResponse;
      localStorage.setItem('plymouth-user', JSON.stringify({ ...user, token }));
      // Sync front-end context (rol/verificatie/statusbalk)
      const role = user.role as Role;
      login(role);
      toast.success(`Welcome back, ${user.firstName}.`);
      navigate('/', { replace: true });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to log in.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-logo"><Logo height={48} /></div>

      <div className="login-card">

        <section className="login-section">
          <p className="login-heading">Create an account?</p>
          <button className="login-btn login-btn-yellow" onClick={() => navigate('/register')}>
            Register
          </button>
        </section>

        <section className="login-section">
          <div className="login-btn-group">
            <form className="login-form" onSubmit={handleSubmit}>
              {registrationMessage && (
                <p className="login-success" role="status">{registrationMessage}</p>
              )}

              <div className="login-form-group">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="login-form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  required
                />
              </div>

              {error && <p className="login-error" role="alert">{error}</p>}

              <button
                type="submit"
                className="login-btn login-btn-yellow"
                disabled={submitting}
              >
                {submitting ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <button className="login-btn login-btn-white login-btn-icon" onClick={handleLogin}>
              <span className="login-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </span>
              Log in with Google account
            </button>

            <button className="login-btn login-btn-white login-btn-icon" onClick={handleLogin}>
              <span className="login-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </span>
              Log in with Facebook account
            </button>

          </div>
        </section>

        {/* NL: demo-knop om als admin in te loggen. Verwijder/zekeren zodra de
            backend echte rollen levert. */}
        <button
          className="login-admin-link"
          onClick={() => { login('admin'); navigate('/admin'); }}
        >
          Log in as admin (demo)
        </button>

      </div>
    </div>
  );
}
