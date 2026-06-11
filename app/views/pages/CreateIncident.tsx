import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AppHeader from '../components/AppHeader';
import {
  createIncident,
  INCIDENT_TYPES,
  type Incident,
  type IncidentType,
} from '../api/incidents';
import { CERTIFICATE_TYPES } from '../api/certificates';
import {
  addPlymouthTiles,
  createLocationMarkerIcon,
  PLYMOUTH_MAP_OPTIONS,
} from '../map/plymouth';
import { useToast } from '../context/ToastContext';

interface StoredUser {
  id: number;
  role?: string;
  token?: string;
}

const INITIAL_FORM = {
  title: '',
  description: '',
  incidentType: 'Flood' as IncidentType,
  importantData: '',
  importantDataExtra: '',
  latitude: '50.3755',
  longitude: '-4.1427',
  priority: 'normal' as Incident['priority'],
  requiredCertificate: '',
  availableAt: '',
};

export default function CreateIncident() {
  const navigate = useNavigate();
  const toast = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
  }

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, PLYMOUTH_MAP_OPTIONS);
    addPlymouthTiles(map);

    const marker = L.marker(
      [Number(INITIAL_FORM.latitude), Number(INITIAL_FORM.longitude)],
      { icon: createLocationMarkerIcon() },
    ).addTo(map);

    map.on('click', event => {
      const latitude = event.latlng.lat.toFixed(7);
      const longitude = event.latlng.lng.toFixed(7);
      marker.setLatLng(event.latlng);
      setForm(previous => ({ ...previous, latitude, longitude }));
    });

    mapInstance.current = map;
    markerInstance.current = marker;

    return () => {
      map.remove();
      mapInstance.current = null;
      markerInstance.current = null;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = JSON.parse(
        localStorage.getItem('plymouth-user') ?? 'null',
      ) as StoredUser | null;
      if (!user || user.role !== 'coordinator') {
        throw new Error('You must be logged in as a coordinator.');
      }

      const incidentId = await createIncident({
        title: form.title.trim(),
        description: form.description.trim(),
        incident_type: form.incidentType,
        important_data: form.importantData.trim(),
        important_data_extra: form.importantDataExtra.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        priority: form.priority,
        required_certificate: form.requiredCertificate || null,
        available_at: form.availableAt
          ? new Date(form.availableAt).toISOString()
          : null,
      });
      toast.success('Incident created and published.');
      navigate(`/task-description/${incidentId}`, { replace: true });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to create incident.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ci-page">
      <AppHeader title="Create incident" />
      <main className="ci-main">
        <section className="ci-heading">
          <span className="ci-kicker">Coordinator tools</span>
          <h1>Create a new incident</h1>
          <p>Publish immediately or schedule when the incident becomes available.</p>
        </section>

        <form className="ci-form" onSubmit={handleSubmit}>
          <div className="ci-form-heading">
            <div className="ci-form-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <div>
              <span>Incident details</span>
              <h2>Response information</h2>
            </div>
          </div>

          <div className="ci-field">
            <label htmlFor="ci-title">Title</label>
            <input id="ci-title" name="title" value={form.title} onChange={handleChange}
              minLength={3} maxLength={255} placeholder="Short incident title" required />
          </div>

          <div className="ci-field">
            <label htmlFor="ci-description">Description</label>
            <textarea id="ci-description" name="description" value={form.description}
              onChange={handleChange} rows={5} minLength={10}
              placeholder="Describe the situation and the help required" required />
          </div>

          <div className="ci-grid">
            <div className="ci-field">
              <label htmlFor="ci-type">Incident type</label>
              <select id="ci-type" name="incidentType" value={form.incidentType}
                onChange={handleChange} required>
                {INCIDENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="ci-field">
              <label htmlFor="ci-priority">Priority</label>
              <select id="ci-priority" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="ci-field">
            <label htmlFor="ci-certificate">Required certificate</label>
            <select
              id="ci-certificate"
              name="requiredCertificate"
              value={form.requiredCertificate}
              onChange={handleChange}
            >
              <option value="">No certificate required</option>
              {CERTIFICATE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="ci-field">
            <label htmlFor="ci-available-at">Available from (optional)</label>
            <input
              id="ci-available-at"
              name="availableAt"
              type="datetime-local"
              value={form.availableAt}
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)}
              onChange={handleChange}
            />
            <span className="ci-field-help">
              Leave blank to publish immediately. Scheduled incidents are visible but cannot be joined early.
            </span>
          </div>

          <div className="ci-field">
            <label htmlFor="ci-important">Important safety information</label>
            <input id="ci-important" name="importantData" value={form.importantData}
              onChange={handleChange} maxLength={255}
              placeholder="Hazards, equipment or access restrictions" required />
          </div>

          <div className="ci-field">
            <label htmlFor="ci-extra">Meeting point or additional information</label>
            <input id="ci-extra" name="importantDataExtra" value={form.importantDataExtra}
              onChange={handleChange} maxLength={255}
              placeholder="Where volunteers should report" required />
          </div>

          <div className="ci-location">
            <div className="ci-location-heading">
              <div>
                <span>Incident location</span>
                <h3>Select the location on the map</h3>
              </div>
              <p>Click anywhere within Plymouth to move the marker.</p>
            </div>
            <div ref={mapRef} className="ci-map" aria-label="Select incident location in Plymouth" />
            <div className="ci-coordinates" aria-live="polite">
              <span>Selected coordinates</span>
              <strong>{form.latitude}, {form.longitude}</strong>
            </div>
          </div>

          {error && <p className="ci-error" role="alert">{error}</p>}
          <div className="ci-actions">
            <button type="button" className="ci-secondary" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="ci-submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create incident'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
