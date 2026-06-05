import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';

const tasks = [
  { id: 1, title: 'TASK 1', desc: 'Crisis phone support — evening shift volunteers needed across Plymouth.' },
  { id: 2, title: 'TASK 2', desc: 'Community outreach — distribute mental health resource packs in PL1–PL4.' },
  { id: 3, title: 'TASK 3', desc: 'Drop-in centre support — assist staff at the Devonport wellbeing hub.' },
  { id: 4, title: 'TASK 4', desc: 'Digital support — help users navigate the crisis connect online portal.' },
];

const categories = ['Mental Health', 'Community', 'Emergency', 'Digital', 'Youth Support'];

export default function TasksMap() {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  function toggleCategory(cat: string) {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  return (
    <div className="tm-page">

      <Nav />

      <div className="tm-body">

        <div className="tm-map-banner">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          MAP
        </div>

        <div className="tm-grid-area">

          <div className="tm-task-grid">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="tm-task-card"
                onClick={() => navigate('/task-description')}
              >
                <div className="tm-task-label">{task.title}</div>
                <div className="tm-task-body">
                  <p>{task.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="tm-filter">
            <button className="tm-filter-header" onClick={() => setFilterOpen(!filterOpen)}>
              <span>FILTER By Categories</span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <ul className="tm-filter-list">
              {categories.map((cat) => (
                <li key={cat} className="tm-filter-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span className="tm-radio-dot" />
                    {cat}
                  </label>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
