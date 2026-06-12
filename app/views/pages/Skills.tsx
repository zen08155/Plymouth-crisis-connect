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
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittedTypes = new Set(certificates.map(certificate => certificate.type));
  const availableCertificateTypes = CERTIFICATE_TYPES.filter(
    type => !submittedTypes.has(type),
  );
  const allTypesSubmitted = availableCertificateTypes.length === 0;

  async function loadCertificates() {
    try {
      const loadedCertificates = await getMyCertificates();
      setCertificates(loadedCertificates);
      setCertificateType(current =>
        loadedCertificates.some(certificate => certificate.type === current)
          ? CERTIFICATE_TYPES.find(
              type => !loadedCertificates.some(certificate => certificate.type === type),
            ) ?? current
          : current,
      );
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
    if (submittedTypes.has(certificateType)) {
      const message = `You have already submitted a ${certificateType} certificate.`;
      setError(message);
      toast.error(message);
      return;
    }
    if (certificateFiles.length === 0) {
      const message = 'Attach at least one certificate file before submitting.';
      setError(message);
      toast.error(message);
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ] as const;
      if (certificateFiles.length > 5) {
        throw new Error('You can submit a maximum of 5 files.');
      }
      if (certificateFiles.some(file => !allowedTypes.some(type => type === file.type))) {
        throw new Error('Upload a PDF, JPEG, PNG, GIF, or WebP file.');
      }
      if (certificateFiles.some(file => file.size > 5 * 1024 * 1024)) {
        throw new Error('Each certificate file must be 5 MB or smaller.');
      }
      const files = await Promise.all(certificateFiles.map(async file => {
        const fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(',', 2)[1] ?? '');
          reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
          reader.readAsDataURL(file);
        });
        return {
          file_name: file.name,
          file_data: fileData,
          mime_type: file.type as typeof allowedTypes[number],
        };
      }));
      await submitCertificate({
        certificate_type: certificateType,
        description: description.trim(),
        files,
      });
      setDescription('');
      setCertificateFiles([]);
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
                disabled={allTypesSubmitted}
              >
                {CERTIFICATE_TYPES.map(type => (
                  <option key={type} value={type} disabled={submittedTypes.has(type)}>
                    {type}{submittedTypes.has(type) ? ' — already submitted' : ''}
                  </option>
                ))}
              </select>
              <span className="pf-help">
                Each certificate type can only be submitted once.
              </span>
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
                disabled={allTypesSubmitted}
              />
            </div>

            <div className="pf-field">
              <label className="pf-label" htmlFor="certificate-file">Certificate file</label>
              <input
                ref={fileRef}
                id="certificate-file"
                className="cert-file-input"
                type="file"
                accept=".pdf,image/*"
                multiple
                disabled={allTypesSubmitted}
                onChange={event => setCertificateFiles(Array.from(event.target.files ?? []))}
              />
              <span className="pf-help">
                Select up to 5 PDFs or images, maximum 5 MB per file.
              </span>
              {certificateFiles.length > 0 && (
                <ul className="cert-selected-files">
                  {certificateFiles.map(file => (
                    <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>

            {error && <p className="ci-error" role="alert">{error}</p>}
            {allTypesSubmitted && (
              <p className="cert-complete" role="status">
                You have submitted every available certificate type.
              </p>
            )}
            <div className="pf-actions">
              <button
                className="pf-save-btn"
                type="submit"
                disabled={submitting || allTypesSubmitted}
              >
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
