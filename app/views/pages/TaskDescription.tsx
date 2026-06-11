import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Logo from '../components/Logo';
import {
  getIncident,
  getIncidentTypeColor,
  volunteerForIncident,
  type Incident,
} from '../api/incidents';
import {
  getMyCertificates,
  verifiedCertificateTypes,
} from '../api/certificates';
import {
  addPlymouthTiles,
  createLocationMarkerIcon,
  PLYMOUTH_BOUNDS,
  PLYMOUTH_MAP_OPTIONS,
} from '../map/plymouth';

function getLocationLabel(incident: Incident) {
  const locationMatch = incident.title.match(/\b(?:at|in|near)\s+(.+)$/i);
  return locationMatch?.[1] ?? 'Plymouth incident location';
}

export default function TaskDescription() {
  const navigate = useNavigate();
  const { incidentId } = useParams();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [volunteered, setVolunteered] = useState(false);
  const [volunteerError, setVolunteerError] = useState('');
  const [verifiedCertificates, setVerifiedCertificates] = useState<Set<string>>(new Set());
  const currentRole = (() => {
    try {
      return JSON.parse(localStorage.getItem('plymouth-user') ?? 'null')?.role as string | undefined;
    } catch {
      return undefined;
    }
  })();

  useEffect(() => {
    const id = Number(incidentId || 101);

    getIncident(id).then(result => {
      setIncident(result);
      setLoading(false);
    });
  }, [incidentId]);

  useEffect(() => {
    if (currentRole === 'volunteer') {
      getMyCertificates()
        .then(certificates => setVerifiedCertificates(verifiedCertificateTypes(certificates)))
        .catch(() => setVerifiedCertificates(new Set()));
    }
  }, []);

  useEffect(() => {
    if (!incident || !mapRef.current) return;

    mapInstance.current?.remove();
    const map = L.map(mapRef.current, {
      ...PLYMOUTH_MAP_OPTIONS,
      center: [incident.latitude, incident.longitude],
      zoom: 15,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });
    addPlymouthTiles(map);
    L.marker(
      [incident.latitude, incident.longitude],
      { icon: createLocationMarkerIcon() },
    ).addTo(map);
    map.fitBounds(PLYMOUTH_BOUNDS, { padding: [20, 20], maxZoom: 15 });
    map.setView([incident.latitude, incident.longitude], 15);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [incident]);

  async function handleVolunteer() {
    if (!incident) return;

    setVolunteerError('');

    try {
      await volunteerForIncident(incident.id);
      setVolunteered(true);
    } catch (error) {
      setVolunteerError(error instanceof Error ? error.message : 'Unable to volunteer.');
    }
  }

  const incidentColor = getIncidentTypeColor(incident?.type ?? 'Other');
  const locationLabel = incident ? getLocationLabel(incident) : '';
  const directionsUrl = incident
    ? `https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`
    : '#';
  const locked = Boolean(
    incident?.requiredCertificate
    && currentRole === 'volunteer'
    && !verifiedCertificates.has(incident.requiredCertificate),
  );

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
              <div
                ref={mapRef}
                className="incident-hero-map"
                aria-label={`Map showing ${locationLabel} in Plymouth`}
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
                  <div>
                    <span>Required certificate</span>
                    <strong>{incident.requiredCertificate || 'None'}</strong>
                  </div>
                </div>
              </article>

              <aside className="incident-action-card">
                <span className="incident-section-label">Join the response</span>
                <h2>{locked ? 'Certificate required' : 'Ready to help?'}</h2>
                <p>
                  {locked
                    ? `A verified ${incident.requiredCertificate} certificate is required for this task.`
                    : 'Volunteering adds you to the incident and its main response team.'}
                </p>
                <button
                  className={`incident-volunteer ${volunteered ? 'incident-volunteer--active' : ''}`}
                  onClick={handleVolunteer}
                  disabled={volunteered || locked || currentRole !== 'volunteer'}
                >
                  {volunteered
                    ? 'You are on the team'
                    : locked
                      ? `Requires ${incident.requiredCertificate}`
                      : currentRole !== 'volunteer'
                        ? 'Volunteer access only'
                        : 'Volunteer for this task'}
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
