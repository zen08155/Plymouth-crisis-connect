import React, { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { useApp } from '../context/AppContext';

/*
  NL (voor backend-team):
  ------------------------------------------------------------------
  Dit is het admin-dashboard voor verificaties (front-end mock).
  - De "mock" rijen hieronder zijn dummy aanvragen.
  - De ECHTE huidige gebruiker komt uit de AppContext; admin kan die
    goedkeuren/afkeuren via setVerification(). Dit update localStorage,
    zodat de statusbalk aan de volunteer-kant verdwijnt na goedkeuren.
  Vervang de mock-lijst later door echte data uit de API.
  ------------------------------------------------------------------
*/

interface PendingRequest {
  id: number;
  name: string;
  skill: string;
}

const MOCK_REQUESTS: PendingRequest[] = [
  { id: 101, name: 'Emma Johnson',  skill: 'First Aid Certified' },
  { id: 102, name: 'Liam Williams', skill: 'Boat Licence' },
  { id: 103, name: 'Sophia Brown',  skill: 'Mental Health First Aid' },
];

export default function AdminDashboard() {
  const { verification, setVerification } = useApp();
  const [handled, setHandled] = useState<Record<number, 'verified' | 'rejected'>>({});

  function handleMock(id: number, decision: 'verified' | 'rejected') {
    setHandled(prev => ({ ...prev, [id]: decision }));
  }

  return (
    <div className="adm-page">
      <AppHeader title="Admin · Verificaties" />

      <div className="adm-body">
        <p className="adm-intro">
          Beoordeel openstaande verificatie-aanvragen. Goedgekeurde gebruikers krijgen toegang
          tot taken die skills/certificaten vereisen.
        </p>

        {/* Huidige (ingelogde) gebruiker — echte state uit context */}
        <section className="adm-section">
          <h2 className="adm-section-title">Jouw account</h2>
          <div className="adm-row">
            <div className="adm-avatar" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="adm-row-info">
              <span className="adm-row-name">Huidige gebruiker</span>
              <span className={`adm-status adm-status--${verification}`}>
                {verification === 'verified' && 'Geverifieerd'}
                {verification === 'under_review' && 'Onder review'}
                {verification === 'rejected' && 'Afgekeurd'}
                {verification === 'not_submitted' && 'Niet ingediend'}
              </span>
            </div>
            <div className="adm-actions">
              <button
                className="adm-btn adm-btn--approve"
                onClick={() => setVerification('verified')}
                disabled={verification === 'verified'}
              >
                Goedkeuren
              </button>
              <button
                className="adm-btn adm-btn--reject"
                onClick={() => setVerification('rejected')}
                disabled={verification === 'rejected'}
              >
                Afkeuren
              </button>
            </div>
          </div>
        </section>

        {/* Mock-aanvragen */}
        <section className="adm-section">
          <h2 className="adm-section-title">Openstaande aanvragen</h2>
          <div className="adm-list">
            {MOCK_REQUESTS.map(req => {
              const decision = handled[req.id];
              return (
                <div key={req.id} className="adm-row">
                  <div className="adm-avatar" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="adm-row-info">
                    <span className="adm-row-name">{req.name}</span>
                    <span className="adm-row-skill">{req.skill}</span>
                  </div>
                  {decision ? (
                    <span className={`adm-status adm-status--${decision}`}>
                      {decision === 'verified' ? 'Goedgekeurd' : 'Afgekeurd'}
                    </span>
                  ) : (
                    <div className="adm-actions">
                      <button
                        className="adm-btn adm-btn--approve"
                        onClick={() => handleMock(req.id, 'verified')}
                      >
                        Goedkeuren
                      </button>
                      <button
                        className="adm-btn adm-btn--reject"
                        onClick={() => handleMock(req.id, 'rejected')}
                      >
                        Afkeuren
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
