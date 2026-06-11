import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useApp } from '../context/AppContext';

interface AppHeaderProps {
  /* Optionele "terug" knop links (gebruikt op subpagina's) */
  showBack?: boolean;
  /* Optioneel tab-label (bijv. PROFILE / SKILLS) */
  title?: string;
  /* Toon het logo i.p.v. een titel (bijv. op de map-pagina) */
  showLogo?: boolean;
}

export default function AppHeader({ showBack = false, title, showLogo = false }: AppHeaderProps) {
  const navigate = useNavigate();
  const { openSidebar } = useApp();

  return (
    <header className="ah-header">
      <div className="ah-left">
        {showBack && (
          <button className="ah-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}
        {showLogo && (
          <a href="/tasks" className="ah-logo-link"><Logo height={38} /></a>
        )}
        {title && <span className="ah-tab">{title}</span>}
      </div>

      {/* Hamburger -> opent de sidebar (consistent op alle pagina's) */}
      <button className="ah-hamburger" onClick={openSidebar} aria-label="Open menu">
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}
