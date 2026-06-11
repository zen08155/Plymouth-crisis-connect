import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useApp } from '../context/AppContext';

interface AppHeaderProps {
  title?: string;
}

export default function AppHeader({ title }: AppHeaderProps) {
  const { openSidebar } = useApp();

  return (
    <header className="ah-header">
      <Link to="/" className="ah-logo-link" aria-label="Plymouth Crisis Connect home">
        <Logo height={40} />
      </Link>

      <nav className="ah-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        {title && (
          <>
            <span className="ah-breadcrumb-separator" aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </>
        )}
      </nav>

      <button className="ah-hamburger" onClick={openSidebar} aria-label="Open menu">
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
