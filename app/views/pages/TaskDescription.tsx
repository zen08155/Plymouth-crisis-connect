import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Nav from '../components/Nav';
import { getIncident, volunteerForIncident, type Incident } from '../api/incidents';

export default function TaskDescription() {
  const { incidentId } = useParams();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [volunteered, setVolunteered] = useState(false);

  useEffect(() => {
    const id = Number(incidentId || 101);

    getIncident(id).then(result => {
      setIncident(result);
      setLoading(false);
    });
  }, [incidentId]);

  async function handleVolunteer() {
    if (!incident) return;

    const success = await volunteerForIncident(incident.id);
    if (success) setVolunteered(true);
  }

  const descriptionLines = incident?.description
    ? incident.description.split('.').filter(Boolean).map(line => `${line.trim()}.`)
    : ['Incident details are not available yet.'];

  return (
    <div className="td-page">
      <Nav />
      <h1 className="td-title">{loading ? 'LOADING TASK' : incident?.title ?? 'TASK NOT FOUND'}</h1>

      <div className="td-card">
        <div className="td-card-body">
          <div className="td-content">
            <div className="td-lines">
              {descriptionLines.map((line, i) => (
                <p key={i} className="td-line">{line}</p>
              ))}
            </div>
            <div className="td-tag-wrap">
              <span className="td-tag">{incident ? `${incident.type} - ${incident.priority}` : 'TASK'}</span>
            </div>
          </div>

          <div className="td-bottom">
            <div className="td-images">
              <div className="td-img-placeholder">
                <span>Image<br />Placeholder</span>
              </div>
              <div className="td-img-placeholder">
                <span>Image<br />Placeholder</span>
              </div>
            </div>

            <button
              className={`td-volunteer-btn ${volunteered ? 'td-volunteer-btn--active' : ''}`}
              onClick={handleVolunteer}
              disabled={!incident || volunteered}
            >
              {volunteered ? 'Volunteered' : 'Volunteer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
