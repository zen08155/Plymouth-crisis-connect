import React, { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader';
import {
  getCertificateSubmissions,
  reviewCertificate,
  type CertificateSubmission,
} from '../api/certificates';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<CertificateSubmission[]>([]);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function loadSubmissions() {
    try {
      setSubmissions(await getCertificateSubmissions());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load submissions.');
    }
  }

  useEffect(() => {
    loadSubmissions();
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
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to update certificate.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="adm-page">
      <AppHeader title="CERTIFICATE REVIEWS" />
      <main className="adm-body">
        <div>
          <span className="pf-eyebrow">Coordinator tools</span>
          <h1 className="adm-heading">Certificate submissions</h1>
          <p className="adm-intro">
            Approve certificates to unlock incidents that require that qualification.
          </p>
        </div>

        {error && <p className="ci-error" role="alert">{error}</p>}

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
