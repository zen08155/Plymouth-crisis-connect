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

interface StoredUser {
  id?: number;
  token?: string;
}

let myCertificatesRequest: Promise<Certificate[]> | null = null;
let myCertificatesCacheKey = '';

function isTokenExpired(token: string): boolean {
  try {
    const [encodedPayload] = token.split('.');
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: number;
    };
    return typeof payload.exp === 'number' && payload.exp <= Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function storedUser(): StoredUser | null {
  const user = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null') as {
    id?: number;
    token?: string;
  } | null;
  if (!user?.token) return null;
  if (isTokenExpired(user.token)) {
    localStorage.removeItem('plymouth-user');
    return null;
  }
  return user;
}

function storedToken(): string {
  const user = storedUser();
  if (!user?.token) throw new Error('Your session is missing. Please log in again.');
  return user.token;
}

function clearMyCertificatesCache(): void {
  myCertificatesRequest = null;
  myCertificatesCacheKey = '';
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
  const user = storedUser();
  if (!user?.token) return Promise.resolve([]);

  const cacheKey = `${user.id ?? 'unknown'}:${user.token}`;
  if (!myCertificatesRequest || myCertificatesCacheKey !== cacheKey) {
    myCertificatesCacheKey = cacheKey;
    myCertificatesRequest = request<Certificate[]>('/api/certificates/me').catch(error => {
      clearMyCertificatesCache();
      throw error;
    });
  }

  return myCertificatesRequest as Promise<Certificate[]>;
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
  return request<{ certificateId: number }>('/api/certificates', {
    method: 'POST',
    body: JSON.stringify(input),
  }).then(result => {
    clearMyCertificatesCache();
    return result;
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
  return request<void>(`/api/certificate-submissions/${certificateId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }).then(result => {
    clearMyCertificatesCache();
    return result;
  });
}

export function verifiedCertificateTypes(certificates: Certificate[]): Set<string> {
  return new Set(
    certificates
      .filter(certificate => certificate.status === 'verified')
      .map(certificate => certificate.type),
  );
}
