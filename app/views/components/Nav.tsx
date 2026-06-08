import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import Logo from './Logo';

const links = [
  { label: 'Tasks',   href: '/tasks' },
  { label: 'About',   href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleNav(href: string) {
    setOpen(false);
    if (href.startsWith('/')) navigate(href);
    else window.location.hash = href.replace('#', '');
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <a className="brand" href="/"><Logo height={40} /></a>

        {/* Desktop links */}
        <div className="nav-links">
          {links.map((l) => (
            <a key={l.label} href={l.href}>{l.label}</a>
          ))}
        </div>

        <div className="nav-right">
          <Button href="/login" variant="ghost" className="nav-login">
            Log In
          </Button>
          <Button href="/register" variant="primary" className="nav-cta">
            Sign Up
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
          <a key={l.label} href={l.href} onClick={() => handleNav(l.href)}>
            {l.label}
          </a>
        ))}
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <Button href="/login" variant="ghost" className="nav-mobile-cta">
            Log In
          </Button>
          <Button href="/register" variant="primary" className="nav-mobile-cta">
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
}
