import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  getAuthToken,
  getRoleDestination,
  loadCurrentUser,
  logoutUser,
  type ManagerUser,
} from '../api';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<ManagerUser | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login', { replace: true });
      return;
    }

    loadCurrentUser()
      .then(setUser)
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Your session has expired.',
        );
      });
  }, [navigate]);

  async function logOut() {
    await logoutUser();
    navigate('/login', { replace: true });
  }

  if (error) {
    return (
      <main className="profile-page">
        <section className="profile-panel">
          <p className="profile-error">{error}</p>
          <button type="button" className="profile-primary" onClick={() => navigate('/login')}>
            Log in again
          </button>
        </section>
      </main>
    );
  }

  if (!user) {
    return <p className="profile-loading">Loading profile...</p>;
  }

  return (
    <main className="profile-page">
      <header className="profile-header">
        <button type="button" className="profile-logo" onClick={() => navigate('/')}>
          <Logo height={38} />
        </button>
        <button type="button" className="profile-back" onClick={() => navigate(getRoleDestination(user.Role))}>
          Back
        </button>
      </header>

      <section className="profile-panel">
        <div className="profile-avatar" aria-hidden="true">
          {user.Name.charAt(0)}{user.Surname.charAt(0)}
        </div>
        <div className="profile-title">
          <p>{user.Role.replace('_', ' ')}</p>
          <h1>{user.Name} {user.Surname}</h1>
        </div>

        <dl className="profile-details">
          <div>
            <dt>Email</dt>
            <dd>{user.Email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user.Role.replace('_', ' ')}</dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd>{user.User_id}</dd>
          </div>
        </dl>

        <button type="button" className="profile-logout" onClick={logOut}>
          Log out
        </button>
      </section>
    </main>
  );
}
