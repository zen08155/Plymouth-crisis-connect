import React from 'react';
import { useApp } from '../context/AppContext';

/*
  NL: Statusbalk die bovenaan de app verschijnt zolang de gebruiker
  nog niet geverifieerd is. Bij 'verified' verdwijnt de balk volledig.
*/

export default function StatusBanner() {
  const { verification } = useApp();

  if (verification === 'verified') return null;

  if (verification === 'under_review') {
    return (
      <div className="stb-banner stb-banner--review">
        <span className="stb-dot" />
        <span className="stb-text">
          <strong>Onder review</strong> — je certificaten worden gecontroleerd. Taken met
          vereiste skills zijn nog vergrendeld.
        </span>
      </div>
    );
  }

  if (verification === 'rejected') {
    return (
      <div className="stb-banner stb-banner--rejected">
        <span className="stb-dot" />
        <span className="stb-text">
          <strong>Afgekeurd</strong> — je verificatie is niet goedgekeurd. Voeg je certificaten
          opnieuw toe via Skills.
        </span>
      </div>
    );
  }

  // not_submitted
  return (
    <div className="stb-banner stb-banner--todo">
      <span className="stb-dot" />
      <span className="stb-text">
        <strong>Niet ingediend</strong> — vul je skills en certificaten in om geverifieerd te
        worden.
      </span>
    </div>
  );
}
