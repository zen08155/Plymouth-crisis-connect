import React, { useState } from 'react';
import AppHeader from '../components/AppHeader';

const descriptionLines = [
  'Crisis support volunteers are needed to assist residents in the Plymouth area.',
  'Tasks include phone check-ins, community outreach, and resource distribution.',
  'No prior experience required — full training will be provided by our team.',
  'Volunteers should be available for at least 4 hours per week.',
  'All roles are flexible and can be completed remotely or in person.',
  'Join our growing network of over 200 active community volunteers.',
  'Make a real difference in the lives of people facing mental health crises.',
];

export default function TaskDescription() {
  const [volunteered, setVolunteered] = useState(false);

  return (
    <div className="td-page">
      <AppHeader showBack showLogo />
      <h1 className="td-title">TASK DESCRIPTION PAGE</h1>

      <div className="td-card">
        <div className="td-card-body">

          <div className="td-content">
            <div className="td-lines">
              {descriptionLines.map((line, i) => (
                <p key={i} className="td-line">{line}</p>
              ))}
            </div>
            <div className="td-tag-wrap">
              <span className="td-tag">TASK 1</span>
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
              onClick={() => setVolunteered(!volunteered)}
            >
              {volunteered ? 'Volunteered ✓' : 'Volunteer'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
