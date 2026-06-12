import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import {
  getCertificateFile,
  getCertificateSubmissions,
  reviewCertificate,
  type CertificateFile,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState<CertificateSubmission[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [filePreview, setFilePreview] = useState<{
    name: string;
    type: string;
    url: string;
  } | null>(null);
  const [now, setNow] = useState(Date.now());
  const currentUser = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null') as {
    id?: number;
    role?: string;
  } | null;
  const activeTab = searchParams.get('tab') === 'submissions'
    ? 'submissions'
    : 'responses';
  const manageableIncidents = currentUser?.role === 'system_manager'
    ? incidents
    : incidents.filter(incident => incident.createdBy === currentUser?.id);

  function selectTab(tab: 'responses' | 'submissions') {
    setError('');
    setSearchParams({ tab }, { replace: true });
  }

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

  useEffect(() => {
    if (!filePreview) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeFilePreview();
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [filePreview]);

  function closeFilePreview() {
    setFilePreview(current => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }

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

  async function handleViewFile(
    submission: CertificateSubmission,
    attachment: CertificateFile,
  ) {
    setError('');
    setOpeningId(attachment.id);
    try {
      const file = await getCertificateFile(submission.id, attachment.id);
      setFilePreview({
        name: attachment.name,
        type: file.type || attachment.mimeType,
        url: URL.createObjectURL(file),
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to open certificate file.';
      setError(message);
      toast.error(message);
    } finally {
      setOpeningId(null);
    }
  }

  return (
    <div className="adm-page">
      <AppHeader title={activeTab === 'responses' ? 'Response management' : 'Submissions'} />
      <main className="adm-body">
        <div>
          <span className="pf-eyebrow">Coordinator tools</span>
          <h1 className="adm-heading">
            {activeTab === 'responses' ? 'Response management' : 'Submissions'}
          </h1>
          <p className="adm-intro">
            {activeTab === 'responses'
              ? 'Review and end incidents that are no longer active.'
              : 'Review volunteer certificate and qualification submissions.'}
          </p>
        </div>

        <div className="adm-tabs" role="tablist" aria-label="Coordinator tools">
          <button
            type="button"
            role="tab"
            id="responses-tab"
            aria-controls="responses-panel"
            aria-selected={activeTab === 'responses'}
            className={`adm-tab ${activeTab === 'responses' ? 'adm-tab--active' : ''}`}
            onClick={() => selectTab('responses')}
          >
            Response management
          </button>
          <button
            type="button"
            role="tab"
            id="submissions-tab"
            aria-controls="submissions-panel"
            aria-selected={activeTab === 'submissions'}
            className={`adm-tab ${activeTab === 'submissions' ? 'adm-tab--active' : ''}`}
            onClick={() => selectTab('submissions')}
          >
            Submissions
            {submissions.filter(submission => submission.status === 'under_review').length > 0 && (
              <span className="adm-tab-count">
                {submissions.filter(submission => submission.status === 'under_review').length}
              </span>
            )}
          </button>
        </div>

        {error && <p className="ci-error" role="alert">{error}</p>}

        {activeTab === 'responses' && (
          <section
            id="responses-panel"
            className="adm-section"
            role="tabpanel"
            aria-labelledby="responses-tab"
          >
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
        )}

        {activeTab === 'submissions' && (
          <section
            id="submissions-panel"
            className="adm-section"
            role="tabpanel"
            aria-labelledby="submissions-tab"
          >
            <h2 className="adm-section-title">Certificate submissions</h2>
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
                    {submission.files.length > 0 && (
                      <div className="adm-file-list">
                        {submission.files.map(attachment => (
                          <button
                            type="button"
                            className="adm-file-link"
                            key={attachment.id}
                            disabled={!attachment.available || openingId === attachment.id}
                            onClick={() => handleViewFile(submission, attachment)}
                          >
                            {openingId === attachment.id ? 'Opening...' : attachment.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {!submission.fileAvailable && (
                    <span
                      className="adm-file-unavailable"
                      title="This submission was created before certificate uploads were stored."
                    >
                      File not stored · resubmit required
                    </span>
                  )}
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
        )}
      </main>

      {filePreview && (
        <div
          className="adm-preview-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) closeFilePreview();
          }}
        >
          <section
            className="adm-preview"
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificate-preview-title"
          >
            <header className="adm-preview-header">
              <div>
                <span className="pf-section-kicker">Certificate file</span>
                <h2 id="certificate-preview-title">{filePreview.name}</h2>
              </div>
              <button
                type="button"
                className="adm-preview-close"
                onClick={closeFilePreview}
                aria-label="Close certificate preview"
              >
                ×
              </button>
            </header>

            <div className="adm-preview-content">
              {filePreview.type === 'application/pdf' ? (
                <iframe src={filePreview.url} title={filePreview.name} />
              ) : (
                <img src={filePreview.url} alt={`Certificate: ${filePreview.name}`} />
              )}
            </div>

            <footer className="adm-preview-footer">
              <a
                className="adm-btn adm-btn--view"
                href={filePreview.url}
                download={filePreview.name}
              >
                Download file
              </a>
              <button type="button" className="adm-btn adm-btn--close" onClick={closeFilePreview}>
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
