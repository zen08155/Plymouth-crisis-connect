import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  clearAuthToken,
  getAuthToken,
  loadRealtimeDashboard,
  logoutUser,
} from '../api';

interface DashboardData {
  current_workload?: {
    total_open_incidents?: number;
    urgent_open_incidents?: number;
  };
  available_resources?: {
    active_volunteers?: number;
    registered_users?: number;
  };
  operational_performance?: {
    average_response_time_minutes?: number;
  };
  active_projects?: {
    open_project_count?: number;
    projects?: Array<{
      incident_id: number;
      project_name: string;
      status: string;
      progress_percent: number;
    }>;
  };
  decision_flags?: Record<string, boolean>;
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login', { replace: true });
      return;
    }

    loadRealtimeDashboard()
      .then((data) => setDashboard(data as DashboardData))
      .catch((requestError) => {
        clearAuthToken();
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Dashboard data could not be loaded.',
        );
      });
  }, [navigate]);

  async function logOut() {
    await logoutUser();
    navigate('/login');
  }

  const metrics = [
    {
      label: 'Open incidents',
      value: dashboard?.current_workload?.total_open_incidents ?? 0,
    },
    {
      label: 'Urgent incidents',
      value: dashboard?.current_workload?.urgent_open_incidents ?? 0,
    },
    {
      label: 'Active volunteers',
      value: dashboard?.available_resources?.active_volunteers ?? 0,
    },
    {
      label: 'Open projects',
      value: dashboard?.active_projects?.open_project_count ?? 0,
    },
    {
      label: 'Average response',
      value: `${dashboard?.operational_performance?.average_response_time_minutes ?? 0} min`,
    },
  ];

  return (
    <div className="manager-page">
      <header className="manager-header">
        <button type="button" className="manager-logo" onClick={() => navigate('/')}>
          <Logo height={36} />
        </button>
        <div>
          <p>System Manager</p>
          <h1>Emergency overview</h1>
        </div>
        <button type="button" className="manager-logout" onClick={logOut}>
          Log out
        </button>
      </header>

      {error ? (
        <div className="manager-error">
          <p>{error}</p>
          <button type="button" onClick={() => navigate('/login')}>Return to login</button>
        </div>
      ) : !dashboard ? (
        <p className="manager-loading">Loading dashboard...</p>
      ) : (
        <main className="manager-content">
          <section className="manager-metrics" aria-label="Emergency metrics">
            {metrics.map((metric) => (
              <article key={metric.label} className="manager-metric">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </section>

          <section className="manager-section">
            <div className="manager-section-heading">
              <div>
                <p>Operations</p>
                <h2>Project progress</h2>
              </div>
            </div>

            <div className="manager-project-list">
              {(dashboard.active_projects?.projects ?? []).map((project) => (
                <article key={project.incident_id} className="manager-project">
                  <div>
                    <strong>{project.project_name}</strong>
                    <span>{project.status}</span>
                  </div>
                  <div className="manager-progress">
                    <span style={{ width: `${project.progress_percent}%` }} />
                  </div>
                  <b>{project.progress_percent}%</b>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
