import React, { useEffect, useState } from 'react';
import { getMyCertificates, type CertificateStatus } from '../api/certificates';
import { useApp } from '../context/AppContext';

export default function StatusBanner() {
  const { role } = useApp();
  const [status, setStatus] = useState<CertificateStatus | 'none' | null>(null);

  useEffect(() => {
    if (role !== 'volunteer') return;
    getMyCertificates()
      .then(certificates => {
        if (certificates.some(certificate => certificate.status === 'verified')) {
          setStatus('verified');
        } else if (certificates.some(certificate => certificate.status === 'under_review')) {
          setStatus('under_review');
        } else if (certificates.some(certificate => certificate.status === 'rejected')) {
          setStatus('rejected');
        } else {
          setStatus('none');
        }
      })
      .catch(() => setStatus(null));
  }, [role]);

  if (role !== 'volunteer' || status === null || status === 'verified') return null;

  if (status === 'under_review') {
    return (
      <div className="stb-banner stb-banner--review">
        <span className="stb-dot" />
        <span className="stb-text">
          <strong>Under review</strong> — certificate-restricted tasks remain locked until approval.
        </span>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="stb-banner stb-banner--rejected">
        <span className="stb-dot" />
        <span className="stb-text">
          <strong>Certificate rejected</strong> — submit an updated certificate from Certificates.
        </span>
      </div>
    );
  }

  return (
    <div className="stb-banner stb-banner--todo">
      <span className="stb-dot" />
      <span className="stb-text">
        <strong>No verified certificates</strong> — qualified tasks are locked until approval.
      </span>
    </div>
  );
}
