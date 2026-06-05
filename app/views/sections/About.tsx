import React from 'react';
import { stats } from '../data';

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container about-grid">
        <div>
          <p className="eyebrow">About Us</p>
          <h2>
            Built for Plymouth.<br />
            <em>Powered by care.</em>
          </h2>
          <p className="intro">
            We connect people in crisis with the right resources — fast. Our
            network spans NHS services, local charities, and emergency care.
          </p>
        </div>

        <div className="stats-grid">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
