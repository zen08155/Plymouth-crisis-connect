import React from 'react';
import { services } from '../data';

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="container">
        <div className="services-header">
          <p className="eyebrow">What We Offer</p>
          <h2>Support when it matters most.</h2>
        </div>

        <div className="service-list">
          {services.map((s, i) => (
            <div className="service-item" key={i}>
              <span className="service-num">0{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
