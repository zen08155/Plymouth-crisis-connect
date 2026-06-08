import React from 'react';

const links = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <a className="brand" href="/">Plymouth Crisis Connect</a>

        <div className="footer-links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </div>

        <p className="footer-note">© 2025 Plymouth Crisis Connect</p>
      </div>
    </footer>
  );
}
