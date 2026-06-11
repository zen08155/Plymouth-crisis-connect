export const CERTIFICATE_TYPES = [
  'First Aid',
  'Water Rescue',
  'Safeguarding',
  'Manual Handling',
  'Working at Height',
] as const;

export type CertificateType = typeof CERTIFICATE_TYPES[number];
export type CertificateStatus = 'under_review' | 'verified' | 'rejected';

export interface Certificate {
  id: number;
  type: CertificateType;
  description: string;
  fileName: string;
  status: CertificateStatus;
  reviewedAt?: string | null;
}

export interface CertificateSubmission extends Certificate {
  user: {
    id: number;
    name: string;
    email: string;
  };
}

function storedToken(): string {
  const user = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null') as {
    token?: string;
  } | null;
  if (!user?.token) throw new Error('Your session is missing. Please log in again.');
  return user.token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${storedToken()}`,
      ...options?.headers,
    },
    ...options,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || `Request failed with status ${response.status}`);
  }
  return payload as T;
}

export function getMyCertificates(): Promise<Certificate[]> {
  return request('/api/certificates/me');
}

export function submitCertificate(input: {
  certificate_type: CertificateType;
  description: string;
  file_name: string;
}): Promise<{ certificateId: number }> {
  return request('/api/certificates', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getCertificateSubmissions(): Promise<CertificateSubmission[]> {
  return request('/api/certificate-submissions');
}

export function reviewCertificate(
  certificateId: number,
  status: 'verified' | 'rejected',
): Promise<void> {
  return request(`/api/certificate-submissions/${certificateId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function verifiedCertificateTypes(certificates: Certificate[]): Set<string> {
  return new Set(
    certificates
      .filter(certificate => certificate.status === 'verified')
      .map(certificate => certificate.type),
  );
}
