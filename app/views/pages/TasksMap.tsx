import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Logo from '../components/Logo';
import { getIncidents, getIncidentTypeColor, type Incident } from '../api/incidents';

function createPinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
             <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z"
                   fill="${color}" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>
             <circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>
           </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

export default function TasksMap() {
  const navigate = useNavigate();
  const { openSidebar, verification } = useApp();
  const isVerified = verification === 'verified';
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const incidentTypes = Array.from(new Set(incidents.map(incident => incident.type)));
  const visibleIncidents = selectedTypes.size === 0
    ? incidents
    : incidents.filter(incident => selectedTypes.has(incident.type));

  function toggleType(type: string): void {
    setSelectedIncident(null);
    setSelectedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  useEffect(() => {
    getIncidents().then(setIncidents);
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [50.3755, -4.1427],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

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
      const marker = L.marker([incident.latitude, incident.longitude], { icon: createPinIcon(color) });
      marker.on('click', () => setSelectedIncident(incident));
      marker.addTo(map);
    });
  }, [visibleIncidents]);

  return (
    <div className="tm2-page">
      <nav className="tm2-nav">
        <a href="/tasks" className="tm2-logo-link"><Logo height={40} /></a>
        <button className="ah-hamburger" onClick={openSidebar} aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Verificatie-statusbalk (verdwijnt zodra geverifieerd) */}
      <StatusBanner />

      <div className="tm2-map-wrap">
        <div ref={mapRef} className="tm2-map" />
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
            <button
              type="button"
              className="tm2-preview-action"
              onClick={() => navigate(`/task-description/${selectedIncident.id}`)}
            >
              View full task
              <span aria-hidden="true">→</span>
            </button>
          </aside>
        )}
        <div className="tm2-scroll-hint">...</div>
      </div>

      <div className="tm2-bottom">
        <div className="tm2-tasks-panel">
          <div className="tm2-tasks-header">
            <h2>TASKS</h2>
            <button className="tm2-add-btn" aria-label="Add task">+</button>
          </div>
          <ul className="tm2-task-list">
            {visibleIncidents.map(incident => (
              <li
                key={incident.id}
                className="tm2-task-item"
                onClick={() => navigate(`/task-description/${incident.id}`)}
              >
                <span className="tm2-dot" style={{ background: getIncidentTypeColor(incident.type) }} />
                <span className="tm2-task-title">{incident.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="tm2-filter-panel">
          <h3 className="tm2-filter-title">Filter by type</h3>
          <ul className="tm2-filter-list">
            {incidentTypes.map(type => (
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
