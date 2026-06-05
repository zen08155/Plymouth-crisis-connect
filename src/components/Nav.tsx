import React, { useState } from 'react';
import Button from './Button';

const links = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a className="brand" href="/">Plymouth</a>

        {/* Desktop links */}
        <div className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </div>

        <div className="nav-right">
          <Button href="#contact" variant="primary" className="nav-cta">
            Get Help
          </Button>

          {/* Hamburger */}
          <button
            className={`nav-hamburger ${open ? 'nav-hamburger--open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`nav-mobile ${open ? 'nav-mobile--open' : ''}`}>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <Button href="#contact" variant="primary" className="nav-mobile-cta">
          Get Help
        </Button>
      </div>
    </nav>
  );
}
