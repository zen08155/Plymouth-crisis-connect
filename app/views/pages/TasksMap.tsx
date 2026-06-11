import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Logo from '../components/Logo';
import StatusBanner from '../components/StatusBanner';
import { useApp } from '../context/AppContext';
import { getIncidents, type Incident } from '../api/incidents';

const PRIORITY_COLORS: Record<Incident['priority'], string> = {
  low: '#22c55e',
  normal: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
};

// NL: incidenten met hoge prioriteit vereisen verificatie (skills/certificaten)
const REQUIRES_VERIFICATION: Incident['priority'][] = ['high', 'critical'];

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

  // NL: een incident is vergrendeld als het verificatie vereist en de gebruiker niet geverifieerd is
  const isLocked = (incident: Incident) =>
    REQUIRES_VERIFICATION.includes(incident.priority) && !isVerified;

  const incidentTypes = Array.from(new Set(incidents.map(incident => incident.type)));
  const visibleIncidents = selectedTypes.size === 0
    ? incidents
    : incidents.filter(incident => selectedTypes.has(incident.type));

  function toggleType(type: string): void {
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
      const color = PRIORITY_COLORS[incident.priority];
      const marker = L.marker([incident.latitude, incident.longitude], { icon: createPinIcon(color) });

      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:160px;font-size:13px">
          <span style="display:inline-block;width:9px;height:9px;border-radius:50%;
            background:${color};margin-right:5px;vertical-align:middle"></span>
          <strong>${incident.type} - ${incident.priority}</strong>
          <p style="margin:5px 0 0;line-height:1.4">${incident.title}</p>
        </div>`);

      marker.on('click', () => navigate(`/task-description/${incident.id}`));
      marker.addTo(map);
    });
  }, [visibleIncidents, navigate]);

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
        <div className="tm2-scroll-hint">...</div>
      </div>

      <div className="tm2-bottom">
        <div className="tm2-tasks-panel">
          <div className="tm2-tasks-header">
            <h2>TASKS</h2>
            <button className="tm2-add-btn" aria-label="Add task">+</button>
          </div>
          <ul className="tm2-task-list">
            {visibleIncidents.map(incident => {
              const locked = isLocked(incident);
              return (
                <li
                  key={incident.id}
                  className={`tm2-task-item ${locked ? 'tm2-task-item--locked' : ''}`}
                  onClick={() => { if (!locked) navigate(`/task-description/${incident.id}`); }}
                  title={locked ? 'Verificatie vereist voor deze taak' : undefined}
                >
                  <span className="tm2-dot" style={{ background: PRIORITY_COLORS[incident.priority] }} />
                  <span className="tm2-task-title">{incident.title}</span>
                  {locked && (
                    <svg className="tm2-lock" width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="tm2-filter-panel">
          <h3 className="tm2-filter-title">Filter by type</h3>
          <ul className="tm2-filter-list">
            {incidentTypes.map((type, index) => (
              <li key={type} className="tm2-filter-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedTypes.has(type)}
                    onChange={() => toggleType(type)}
                  />
                  <span className="tm2-filter-dot" style={{ background: Object.values(PRIORITY_COLORS)[index % 4] }} />
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
