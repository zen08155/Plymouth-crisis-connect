import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Skill {
  id: number;
  label: string;
}

const DEFAULT_SKILLS: Skill[] = [
  { id: 1, label: 'First Aid Certified' },
  { id: 2, label: 'Mental Health First Aid' },
  { id: 3, label: 'Crisis Counsellor' },
];

export default function Skills() {
  const navigate = useNavigate();
  const [skills] = useState<Skill[]>(DEFAULT_SKILLS);
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  return (
    <div className="pf-page">
      {/* Header */}
      <div className="pf-header">
        <button className="pf-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="pf-tab">SKILLS</div>
      </div>

      {/* Content */}
      <div className="pf-skills-content">

        {/* Skill Type card */}
        <div className="welcome-card">
          <p className="welcome-card-label">Skill Type</p>
          <ul className="skill-list">
            {skills.map(skill => (
              <li key={skill.id} className="skill-item">
                <span className="skill-dot" />
                <span className="skill-name">{skill.label}</span>
              </li>
            ))}
          </ul>
          <button className="skill-sort-btn" aria-label="Reorder">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="8 9 12 5 16 9"/>
              <polyline points="16 15 12 19 8 15"/>
            </svg>
          </button>
        </div>

        {/* Bottom row */}
        <div className="welcome-bottom">

          {/* Skill Description */}
          <div className="welcome-card welcome-card--half">
            <p className="welcome-card-label">Skill Description</p>
            <textarea
              className="skill-textarea"
              placeholder="Describe your skills and experience..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          {/* Proof of Certificate */}
          <div className="welcome-card welcome-card--half">
            <p className="welcome-card-label">Proof of Certificate</p>
            <button
              className="pdf-attach-btn"
              onClick={() => fileRef.current?.click()}
            >
              <span>{fileName ?? '(attach PDF)'}</span>
              <span className="pdf-attach-plus">+</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
          </div>

        </div>

        {/* Save button */}
        <button className="welcome-submit-btn">Save Skills</button>

      </div>
    </div>
  );
}
