import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AppHeader from '../components/AppHeader';
import StatusBanner from '../components/StatusBanner';
import {
  formatIncidentCountdown,
  getIncidents,
  getIncidentTypeColor,
  INCIDENT_TYPES,
  isIncidentUpcoming,
  type Incident,
} from '../api/incidents';
import {
  getMyCertificates,
  verifiedCertificateTypes,
} from '../api/certificates';
import {
  addPlymouthTiles,
  PLYMOUTH_MAP_OPTIONS,
} from '../map/plymouth';

function createPinIcon(color: string, scheduled: boolean): L.DivIcon {
  const centerIcon = scheduled
    ? `<circle cx="17" cy="17" r="7" fill="#07111d" opacity=".92"/>
       <circle cx="17" cy="17" r="4.25" fill="none" stroke="#FCD34D" stroke-width="1.5"/>
       <path d="M17 14.5v2.8l2 1.2" fill="none" stroke="#FCD34D" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round"/>`
    : `<circle cx="17" cy="17" r="6" fill="#07111d" opacity=".88"/>
       <circle cx="17" cy="17" r="2.5" fill="#E6FFFA"/>`;

  return L.divIcon({
    className: `tm2-incident-marker${scheduled ? ' tm2-incident-marker--scheduled' : ''}`,
    html: `<span class="tm2-marker-pulse" style="--marker-color:${color}"></span>
           <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <filter id="marker-shadow" x="-50%" y="-35%" width="200%" height="210%">
                 <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#07111d" flood-opacity=".55"/>
               </filter>
             </defs>
             <path d="M17 1C8.16 1 1 8.16 1 17c0 10.7 16 26 16 26s16-15.3 16-26C33 8.16 25.84 1 17 1z"
                   fill="${color}" stroke="${scheduled ? '#FCD34D' : '#E6FFFA'}"
                   stroke-width="2" ${scheduled ? 'stroke-dasharray="3 2"' : ''}
                   filter="url(#marker-shadow)"/>
             ${centerIcon}
           </svg>`,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -44],
  });
}

export default function TasksMap() {
  const navigate = useNavigate();
  const isCoordinator = (() => {
    try {
      return JSON.parse(localStorage.getItem('plymouth-user') ?? 'null')?.role === 'coordinator';
    } catch {
      return false;
    }
  })();
  const currentRole = (() => {
    try {
      return JSON.parse(localStorage.getItem('plymouth-user') ?? 'null')?.role as string | undefined;
    } catch {
      return undefined;
    }
  })();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [incidentError, setIncidentError] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [verifiedCertificates, setVerifiedCertificates] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(Date.now());

  const visibleIncidents = selectedTypes.size === 0
    ? incidents
    : incidents.filter(incident => selectedTypes.has(incident.type));
  const isLocked = (incident: Incident) => (
    currentRole === 'volunteer'
    && Boolean(incident.requiredCertificate)
    && !verifiedCertificates.has(incident.requiredCertificate as string)
  );
  const isUpcoming = (incident: Incident) => isIncidentUpcoming(incident, now);

  function toggleType(type: string): void {
    setSelectedIncident(null);
    setSelectedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    getIncidents()
      .then(result => {
        setIncidents(result);
        setIncidentError('');
      })
      .catch(error => {
        setIncidentError(error instanceof Error ? error.message : 'Unable to load tasks.');
      })
      .finally(() => setLoadingIncidents(false));

    if (currentRole === 'volunteer') {
      getMyCertificates()
        .then(certificates => setVerifiedCertificates(verifiedCertificateTypes(certificates)))
        .catch(() => setVerifiedCertificates(new Set()));
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      ...PLYMOUTH_MAP_OPTIONS,
      zoomControl: false,
    });
    addPlymouthTiles(map);
    L.control.zoom({ position: 'topright' }).addTo(map);

    map.on('click', () => setSelectedIncident(null));
    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    visibleIncidents.forEach(incident => {
      const color = getIncidentTypeColor(incident.type);
      const upcoming = isUpcoming(incident);
      const marker = L.marker(
        [incident.latitude, incident.longitude],
        {
          icon: createPinIcon(isLocked(incident) ? '#64748b' : color, upcoming),
          title: upcoming ? `Scheduled: ${incident.title}` : incident.title,
          alt: upcoming ? `Scheduled incident: ${incident.title}` : incident.title,
        },
      );
      marker.on('click', () => setSelectedIncident(incident));
      marker.addTo(map);
    });

    if (visibleIncidents.length > 1) {
      map.fitBounds(
        L.latLngBounds(visibleIncidents.map(incident => [incident.latitude, incident.longitude])),
        { padding: [70, 70], maxZoom: 14 },
      );
    } else if (visibleIncidents.length === 1) {
      map.setView([visibleIncidents[0].latitude, visibleIncidents[0].longitude], 14);
    }
  }, [visibleIncidents, verifiedCertificates]);

  return (
    <div className="tm2-page">
      <AppHeader />

      {/* Verificatie-statusbalk (verdwijnt zodra geverifieerd) */}
      <StatusBanner />

      <div className="tm2-map-wrap">
        <div ref={mapRef} className="tm2-map" />
        <div className="tm2-map-status">
          <span className="tm2-map-status-icon" aria-hidden="true">
            <span className="tm2-map-status-ring tm2-map-status-ring--outer" />
            <span className="tm2-map-status-ring tm2-map-status-ring--inner" />
            <span className="tm2-map-status-dot" />
          </span>
          <div>
            <strong>Plymouth response map</strong>
            <span>{visibleIncidents.length} open incident{visibleIncidents.length === 1 ? '' : 's'}</span>
          </div>
        </div>
        {selectedIncident && (
          <aside
            className="tm2-map-preview"
            style={{ '--incident-color': getIncidentTypeColor(selectedIncident.type) } as React.CSSProperties}
          >
            <button
              type="button"
              className="tm2-preview-close"
              onClick={() => setSelectedIncident(null)}
              aria-label="Close incident preview"
            >
              ×
            </button>
            <div className="tm2-preview-meta">
              <span className="tm2-preview-type">{selectedIncident.type}</span>
              <span className="tm2-preview-priority">{selectedIncident.priority}</span>
            </div>
            <h2>{selectedIncident.title}</h2>
            <p>{selectedIncident.description}</p>
            {isUpcoming(selectedIncident) && (
              <button
                type="button"
                className="tm2-preview-schedule"
                title={`Available ${new Date(selectedIncident.availableAt).toLocaleString()}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 7v5l3 2"/>
                </svg>
                Available in {formatIncidentCountdown(selectedIncident.availableAt, now)}
              </button>
            )}
            {isLocked(selectedIncident) && (
              <p className="tm2-preview-lock">
                Requires verified {selectedIncident.requiredCertificate}
              </p>
            )}
            <button
              type="button"
              className={`tm2-preview-action ${isLocked(selectedIncident) ? 'tm2-preview-action--locked' : ''}`}
              onClick={() => navigate(`/task-description/${selectedIncident.id}`)}
            >
              {isLocked(selectedIncident) ? 'View requirement' : 'View full task'}
              <span aria-hidden="true">→</span>
            </button>
          </aside>
        )}
      </div>

      <div className="tm2-bottom">
        <div className="tm2-tasks-panel">
          <div className="tm2-tasks-header">
            <h2>TASKS</h2>
            {isCoordinator && (
              <button
                className="tm2-add-btn"
                aria-label="Create incident"
                onClick={() => navigate('/coordinator/incidents/new')}
              >
                +
              </button>
            )}
          </div>
          <ul className="tm2-task-list">
            {loadingIncidents ? (
              <li className="tm2-task-item">Loading tasks...</li>
            ) : incidentError ? (
              <li className="tm2-task-item">{incidentError}</li>
            ) : visibleIncidents.length === 0 ? (
              <li className="tm2-task-item">No active tasks found.</li>
            ) : visibleIncidents.map(incident => (
              <li
                key={incident.id}
                className={`tm2-task-item ${isLocked(incident) ? 'tm2-task-item--locked' : ''}`}
                onClick={() => navigate(`/task-description/${incident.id}`)}
              >
                <span className="tm2-dot" style={{ background: getIncidentTypeColor(incident.type) }} />
                <span className="tm2-task-title">{incident.title}</span>
                {isUpcoming(incident) && (
                  <button
                    type="button"
                    className="tm2-schedule"
                    aria-label={`${incident.title} available in ${formatIncidentCountdown(incident.availableAt, now)}`}
                    title={`Available ${new Date(incident.availableAt).toLocaleString()}`}
                    onClick={event => {
                      event.stopPropagation();
                      setSelectedIncident(incident);
                    }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M12 7v5l3 2"/>
                    </svg>
                  </button>
                )}
                {isLocked(incident) && (
                  <span className="tm2-lock" title={`Requires ${incident.requiredCertificate}`}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="4" y="10" width="16" height="11" rx="2"/>
                      <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="tm2-filter-panel">
          <h3 className="tm2-filter-title">Filter by type</h3>
          <ul className="tm2-filter-list">
            {INCIDENT_TYPES.map(type => (
              <li key={type} className="tm2-filter-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedTypes.has(type)}
                    onChange={() => toggleType(type)}
                  />
                  <span className="tm2-filter-dot" style={{ background: getIncidentTypeColor(type) }} />
                  {type}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
