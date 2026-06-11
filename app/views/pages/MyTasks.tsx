import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import {
  getIncidentTypeColor,
  getMyActiveIncidents,
  type ActiveVolunteerIncident,
} from '../api/incidents';

function formatJoinedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently joined';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function MyTasks() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<ActiveVolunteerIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyActiveIncidents()
      .then(result => {
        setIncidents(result);
        setError('');
      })
      .catch(caught => {
        setError(caught instanceof Error ? caught.message : 'Unable to load your active tasks.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="myt-page">
      <AppHeader title="My active tasks" />

      <main className="myt-main">
        <section className="myt-heading">
          <div>
            <span className="myt-eyebrow">Volunteer dashboard</span>
            <h1>My active tasks</h1>
            <p>Track the incidents you joined and open the latest response details.</p>
          </div>
          <div className="myt-count" aria-label={`${incidents.length} active tasks`}>
            <strong>{incidents.length}</strong>
            <span>Active {incidents.length === 1 ? 'task' : 'tasks'}</span>
          </div>
        </section>

        {loading ? (
          <div className="myt-state">Loading your tasks...</div>
        ) : error ? (
          <div className="myt-state myt-state--error" role="alert">{error}</div>
        ) : incidents.length === 0 ? (
          <section className="myt-empty">
            <div className="myt-empty-icon" aria-hidden="true">✓</div>
            <h2>No active tasks yet</h2>
            <p>Join an incident from the response map and it will appear here.</p>
            <button type="button" onClick={() => navigate('/')}>
              Browse available tasks
            </button>
          </section>
        ) : (
          <section className="myt-grid" aria-label="Joined active tasks">
            {incidents.map(incident => (
              <article
                key={incident.id}
                className="myt-card"
                style={{ '--task-color': getIncidentTypeColor(incident.type) } as React.CSSProperties}
              >
                <div className="myt-card-top">
                  <span className="myt-type">{incident.type}</span>
                  <span className={`myt-priority myt-priority--${incident.priority}`}>
                    {incident.priority}
                  </span>
                </div>

                <div className="myt-card-copy">
                  <h2>{incident.title}</h2>
                  <p>{incident.description}</p>
                </div>

                <div className="myt-card-meta">
                  <div>
                    <span>Status</span>
                    <strong><i aria-hidden="true" /> Active response</strong>
                  </div>
                  <div>
                    <span>Joined</span>
                    <strong>{formatJoinedAt(incident.joinedAt)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="myt-open"
                  onClick={() => navigate(`/task-description/${incident.id}`)}
                >
                  View task details
                  <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
