import React, { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import {
  getCertificateSubmissions,
  reviewCertificate,
  type CertificateSubmission,
} from '../api/certificates';
import {
  closeIncident,
  formatIncidentCountdown,
  getIncidents,
  isIncidentUpcoming,
  type Incident,
} from '../api/incidents';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const toast = useToast();
  const [submissions, setSubmissions] = useState<CertificateSubmission[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const currentUser = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null') as {
    id?: number;
    role?: string;
  } | null;
  const manageableIncidents = currentUser?.role === 'system_manager'
    ? incidents
    : incidents.filter(incident => incident.createdBy === currentUser?.id);

  async function loadSubmissions() {
    try {
      setSubmissions(await getCertificateSubmissions());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load submissions.');
    }
  }

  async function loadIncidents() {
    try {
      setIncidents(await getIncidents());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load incidents.');
    }
  }

  useEffect(() => {
    loadSubmissions();
    loadIncidents();
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function handleReview(
    certificateId: number,
    status: 'verified' | 'rejected',
  ) {
    setError('');
    setUpdatingId(certificateId);
    try {
      await reviewCertificate(certificateId, status);
      await loadSubmissions();
      toast.success(`Certificate ${status === 'verified' ? 'approved' : 'rejected'}.`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to update certificate.';
      setError(message);
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleClose(incident: Incident) {
    const confirmed = window.confirm(
      `End "${incident.title}"? Volunteers will no longer see it as an active task.`,
    );
    if (!confirmed) return;

    setError('');
    setClosingId(incident.id);
    try {
      await closeIncident(incident.id);
      setIncidents(current => current.filter(item => item.id !== incident.id));
      toast.success(`"${incident.title}" has ended.`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to end incident.';
      setError(message);
      toast.error(message);
    } finally {
      setClosingId(null);
    }
  }

  return (
    <div className="adm-page">
      <AppHeader title="Response management" />
      <main className="adm-body">
        <div>
          <span className="pf-eyebrow">Coordinator tools</span>
          <h1 className="adm-heading">Response management</h1>
          <p className="adm-intro">
            Review qualifications and end incidents that are no longer active.
          </p>
        </div>

        {error && <p className="ci-error" role="alert">{error}</p>}

        <section className="adm-section">
          <h2 className="adm-section-title">Active incidents</h2>
          <div className="adm-list">
            {manageableIncidents.length === 0 && (
              <p className="cert-empty">No active incidents available to manage.</p>
            )}
            {manageableIncidents.map(incident => (
              <article className="adm-row" key={incident.id}>
                <div className="adm-incident-marker" aria-hidden="true" />
                <div className="adm-row-info">
                  <span className="adm-row-name">{incident.title}</span>
                  <span className="adm-row-skill">
                    {incident.type} · {incident.priority} priority
                    {isIncidentUpcoming(incident, now)
                      ? ` · available in ${formatIncidentCountdown(incident.availableAt, now)}`
                      : ''}
                  </span>
                  <span className="adm-row-email">{incident.description}</span>
                </div>
                <div className="adm-actions">
                  <button
                    className="adm-btn adm-btn--end"
                    disabled={closingId === incident.id}
                    onClick={() => handleClose(incident)}
                  >
                    {closingId === incident.id ? 'Ending...' : 'End incident'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="adm-section">
          <h2 className="adm-section-title">Submissions</h2>
          <div className="adm-list">
            {submissions.length === 0 && (
              <p className="cert-empty">No certificate submissions found.</p>
            )}
            {submissions.map(submission => (
              <article className="adm-row" key={submission.id}>
                <div className="adm-avatar" aria-hidden="true">
                  {submission.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="adm-row-info">
                  <span className="adm-row-name">{submission.user.name}</span>
                  <span className="adm-row-skill">
                    {submission.type} · {submission.fileName}
                  </span>
                  <span className="adm-row-email">{submission.user.email}</span>
                </div>
                {submission.status === 'under_review' ? (
                  <div className="adm-actions">
                    <button
                      className="adm-btn adm-btn--approve"
                      disabled={updatingId === submission.id}
                      onClick={() => handleReview(submission.id, 'verified')}
                    >
                      Approve
                    </button>
                    <button
                      className="adm-btn adm-btn--reject"
                      disabled={updatingId === submission.id}
                      onClick={() => handleReview(submission.id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className={`adm-status adm-status--${submission.status}`}>
                    {submission.status}
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
