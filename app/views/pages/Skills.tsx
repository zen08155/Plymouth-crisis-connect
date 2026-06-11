import React, { useEffect, useRef, useState } from 'react';
import AppHeader from '../components/AppHeader';
import {
  CERTIFICATE_TYPES,
  getMyCertificates,
  submitCertificate,
  type Certificate,
  type CertificateType,
} from '../api/certificates';
import { useToast } from '../context/ToastContext';

const SKILL_OPTIONS = [
  'Crisis Communication',
  'Teamwork',
  'Problem Solving',
  'Organisation',
  'Logistics Coordination',
  'Community Outreach',
  'Language Support',
  'Food Preparation',
  'Administrative Support',
  'Basic IT Support',
  'Local Area Knowledge',
] as const;

function skillsStorageKey() {
  try {
    const user = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null') as {
      id?: number;
    } | null;
    return `plymouth-volunteer-skills:${user?.id ?? 'unknown'}`;
  } catch {
    return 'plymouth-volunteer-skills:unknown';
  }
}

function loadSelectedSkills(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(skillsStorageKey()) ?? '[]');
    return Array.isArray(stored)
      ? stored.filter(
          (skill): skill is typeof SKILL_OPTIONS[number] =>
            typeof skill === 'string' && SKILL_OPTIONS.some(option => option === skill),
        )
      : [];
  } catch {
    return [];
  }
}

export default function Skills() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(loadSelectedSkills);
  const [skillsSaved, setSkillsSaved] = useState(false);
  const [certificateType, setCertificateType] = useState<CertificateType>('First Aid');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadCertificates() {
    try {
      setCertificates(await getMyCertificates());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load certificates.');
    }
  }

  useEffect(() => {
    loadCertificates();
  }, []);

  function toggleSkill(skill: string) {
    setSkillsSaved(false);
    setSelectedSkills(current =>
      current.includes(skill)
        ? current.filter(selected => selected !== skill)
        : [...current, skill],
    );
  }

  function saveSkills() {
    localStorage.setItem(skillsStorageKey(), JSON.stringify(selectedSkills));
    setSkillsSaved(true);
    toast.success('Skills saved.');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fileName) {
      const message = 'Attach a certificate file before submitting.';
      setError(message);
      toast.error(message);
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await submitCertificate({
        certificate_type: certificateType,
        description: description.trim(),
        file_name: fileName,
      });
      setDescription('');
      setFileName('');
      if (fileRef.current) fileRef.current.value = '';
      await loadCertificates();
      toast.success('Certificate submitted for review.');
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Certificate submission failed.';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pf-page">
      <AppHeader title="Certificates & Skills" />
      <main className="cert-main">
        <section className="pf-intro">
          <div>
            <span className="pf-eyebrow">Volunteer qualifications</span>
            <h1>Certificates & Skills</h1>
            <p>Select your skills and submit certificates for qualifications that require review.</p>
          </div>
        </section>

        <section className="cert-skills-card">
          <div className="pf-form-heading">
            <div>
              <span className="pf-section-kicker">Your capabilities</span>
              <h2>Select your skills</h2>
              <p>Choose practical abilities you can offer without a formal qualification.</p>
            </div>
          </div>

          <div className="cert-skill-grid">
            {SKILL_OPTIONS.map(skill => {
              const selected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  className={`cert-skill-option${selected ? ' cert-skill-option--selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => toggleSkill(skill)}
                >
                  <span className="cert-skill-check" aria-hidden="true">{selected ? '✓' : ''}</span>
                  {skill}
                </button>
              );
            })}
          </div>

          <div className="cert-skills-actions">
            {skillsSaved && <p className="cert-skills-saved" role="status">Skills saved.</p>}
            <button className="pf-save-btn" type="button" onClick={saveSkills}>
              Save skills
            </button>
          </div>
        </section>

        <div className="cert-layout">
          <form className="pf-form-card cert-form" onSubmit={handleSubmit}>
            <div className="pf-form-heading">
              <div>
                <span className="pf-section-kicker">New submission</span>
                <h2>Submit a certificate</h2>
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label" htmlFor="certificate-type">Certificate type</label>
              <select
                id="certificate-type"
                className="pf-input"
                value={certificateType}
                onChange={event => setCertificateType(event.target.value as CertificateType)}
              >
                {CERTIFICATE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="pf-field">
              <label className="pf-label" htmlFor="certificate-description">Description</label>
              <textarea
                id="certificate-description"
                className="pf-input cert-description"
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder="Course provider, qualification level, or relevant details"
                minLength={3}
                required
              />
            </div>

            <div className="pf-field">
              <label className="pf-label" htmlFor="certificate-file">Certificate file</label>
              <button
                type="button"
                className="cert-file-button"
                onClick={() => fileRef.current?.click()}
              >
                <span>{fileName || 'Select PDF or image'}</span>
                <strong>Browse</strong>
              </button>
              <input
                ref={fileRef}
                id="certificate-file"
                type="file"
                accept=".pdf,image/*"
                hidden
                onChange={event => setFileName(event.target.files?.[0]?.name ?? '')}
              />
            </div>

            {error && <p className="ci-error" role="alert">{error}</p>}
            <div className="pf-actions">
              <button className="pf-save-btn" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for review'}
              </button>
            </div>
          </form>

          <section className="cert-list-card">
            <span className="pf-section-kicker">Your submissions</span>
            <h2>Review status</h2>
            {certificates.length === 0 ? (
              <p className="cert-empty">No certificates submitted yet.</p>
            ) : (
              <div className="cert-list">
                {certificates.map(certificate => (
                  <article className="cert-row" key={certificate.id}>
                    <div>
                      <strong>{certificate.type}</strong>
                      <span>{certificate.fileName}</span>
                    </div>
                    <span className={`cert-status cert-status--${certificate.status}`}>
                      {certificate.status.replace('_', ' ')}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
