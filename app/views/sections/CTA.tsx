import React from 'react';
import Button from '../components/Button';

export default function CTA() {
  return (
    <section className="cta-section" id="contact">
      <div className="container">
        <div className="cta-card">
          <p className="eyebrow">Ready to connect?</p>
          <h2>
            You're not alone.<br />
            <em>We're here.</em>
          </h2>
          <p>
            Reach out now. Our team is available around the clock to provide
            immediate support and guidance.
          </p>
          <div className="cta-actions">
            <Button href="tel:01752000000" variant="primary">
              Call 01752 000 000
            </Button>
            <Button href="mailto:help@plymouthcrisis.org" variant="ghost">
              Send a Message
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
