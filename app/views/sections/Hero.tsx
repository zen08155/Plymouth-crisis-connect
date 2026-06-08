import React from 'react';
import Button from '../components/Button';

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-inner">
        <p className="eyebrow">24/7 Crisis Support</p>
        <h1>
          Connecting Plymouth<br />
          <span className="hero-accent">to the help</span><br />
          <em>you deserve.</em>
        </h1>
        <p className="intro">
          Immediate mental health support, crisis intervention, and community
          resources — when you need them most.
        </p>
        <div className="hero-actions">
          <Button href="#contact" variant="primary">Get Support Now</Button>
          <Button href="#services" variant="ghost">Learn More</Button>
        </div>
      </div>
    </section>
  );
}
