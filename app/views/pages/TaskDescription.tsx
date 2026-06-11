import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  getIncident,
  getIncidentTypeColor,
  volunteerForIncident,
  type Incident,
} from '../api/incidents';

function getLocationLabel(incident: Incident) {
  const locationMatch = incident.title.match(/\b(?:at|in|near)\s+(.+)$/i);
  return locationMatch?.[1] ?? 'Plymouth incident location';
}

export default function TaskDescription() {
  const navigate = useNavigate();
  const { incidentId } = useParams();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [volunteered, setVolunteered] = useState(false);
  const [volunteerError, setVolunteerError] = useState('');

  useEffect(() => {
    const id = Number(incidentId || 101);

    getIncident(id).then(result => {
      setIncident(result);
      setLoading(false);
    });
  }, [incidentId]);

  async function handleVolunteer() {
    if (!incident) return;

    setVolunteerError('');

    try {
      const storedUser = localStorage.getItem('plymouth-user');
      const userId = storedUser ? Number(JSON.parse(storedUser).id) : NaN;
      if (!Number.isInteger(userId)) throw new Error('Your session could not be read.');

      const success = await volunteerForIncident(incident.id, userId);
      if (!success) throw new Error('You could not be added to this incident.');
      setVolunteered(true);
    } catch (error) {
      setVolunteerError(error instanceof Error ? error.message : 'Unable to volunteer.');
    }
  }

  const incidentColor = getIncidentTypeColor(incident?.type ?? 'Other');
  const locationLabel = incident ? getLocationLabel(incident) : '';
  const mapEmbedUrl = incident
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${incident.longitude - 0.008}%2C${incident.latitude - 0.005}%2C${incident.longitude + 0.008}%2C${incident.latitude + 0.005}&layer=mapnik&marker=${incident.latitude}%2C${incident.longitude}`
    : '';
  const directionsUrl = incident
    ? `https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`
    : '#';

  return (
    <div
      className="incident-detail-page"
      style={{ '--incident-color': incidentColor } as React.CSSProperties}
    >
      <header className="incident-detail-header">
        <button type="button" className="incident-back" onClick={() => navigate('/tasks')}>
          <span aria-hidden="true">←</span>
          Back to tasks
        </button>
        <button type="button" className="incident-logo" onClick={() => navigate('/tasks')}>
          <Logo height={40} />
        </button>
      </header>

      <main className="incident-detail-main">
        {loading ? (
          <div className="incident-state">Loading incident...</div>
        ) : !incident ? (
          <div className="incident-state">
            <h1>Incident not found</h1>
            <button type="button" onClick={() => navigate('/tasks')}>Return to tasks</button>
          </div>
        ) : (
          <>
            <section className="incident-hero">
              <iframe
                title={`Map showing ${locationLabel}`}
                src={mapEmbedUrl}
                className="incident-hero-map"
                loading="lazy"
                tabIndex={-1}
              />
              <div className="incident-hero-shade" aria-hidden="true" />

              <div className="incident-hero-copy">
                <div className="incident-badges">
                  <span className="incident-type-badge">{incident.type}</span>
                  <span className="incident-priority-badge">{incident.priority} priority</span>
                  <span className="incident-status-badge">{incident.status}</span>
                </div>
                <h1>{incident.title}</h1>
                <p>Review the incident information before joining the response team.</p>
              </div>

              <div className="incident-route-card">
                <div className="incident-route-content">
                  <div>
                    <span>Incident location</span>
                    <strong>{locationLabel}</strong>
                  </div>
                  <a href={directionsUrl} target="_blank" rel="noreferrer">
                    Get directions
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </section>

            <section className="incident-detail-grid">
              <article className="incident-info-card">
                <span className="incident-section-label">What you need to know</span>
                <h2>Incident overview</h2>
                <p>{incident.description || 'No additional incident details are available.'}</p>

                <div className="incident-guidance">
                  <div>
                    <span>Response type</span>
                    <strong>{incident.type}</strong>
                  </div>
                  <div>
                    <span>Priority</span>
                    <strong>{incident.priority}</strong>
                  </div>
                  <div>
                    <span>Current status</span>
                    <strong>{incident.status}</strong>
                  </div>
                </div>
              </article>

              <aside className="incident-action-card">
                <span className="incident-section-label">Join the response</span>
                <h2>Ready to help?</h2>
                <p>Volunteering adds you to the incident and its main response team.</p>
                <button
                  className={`incident-volunteer ${volunteered ? 'incident-volunteer--active' : ''}`}
                  onClick={handleVolunteer}
                  disabled={volunteered}
                >
                  {volunteered ? 'You are on the team' : 'Volunteer for this task'}
                </button>
                {volunteerError && <p className="incident-action-error" role="alert">{volunteerError}</p>}
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
