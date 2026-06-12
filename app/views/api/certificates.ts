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
  fileAvailable: boolean;
  files: CertificateFile[];
  status: CertificateStatus;
  reviewedAt?: string | null;
}

export interface CertificateFile {
  id: number;
  name: string;
  mimeType: string;
  available: boolean;
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
  files: Array<{
    file_name: string;
    file_data: string;
    mime_type: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  }>;
}): Promise<{ certificateId: number }> {
  return request('/api/certificates', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getCertificateFile(
  certificateId: number,
  fileId: number,
): Promise<Blob> {
  const path = fileId === 0
    ? `/api/certificate-submissions/${certificateId}/file`
    : `/api/certificate-submissions/${certificateId}/files/${fileId}`;
  const response = await fetch(path, {
    headers: { Authorization: `Bearer ${storedToken()}` },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail || 'Unable to open certificate file.');
  }
  return response.blob();
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
