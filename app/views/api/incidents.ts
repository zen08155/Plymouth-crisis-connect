export const INCIDENT_TYPES = [
  'Flood',
  'Fire',
  'Medical',
  'Storm',
  'Shelter',
  'Relief',
  'Infrastructure',
  'Search and Rescue',
] as const;

export type IncidentType = typeof INCIDENT_TYPES[number];

export interface Incident {
  id: number;
  title: string;
  description: string;
  type: string;
  latitude: number;
  longitude: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'open' | 'closed';
  requiredCertificate: string | null;
  availableAt: string;
  createdBy: number;
}

export interface ActiveVolunteerIncident extends Incident {
  joinedAt: string;
  participationStatus: 'joined';
}

export interface CreateIncidentInput {
  title: string;
  description: string;
  incident_type: IncidentType;
  important_data: string;
  important_data_extra: string;
  latitude: number;
  longitude: number;
  priority: Incident['priority'];
  required_certificate: string | null;
  available_at: string | null;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const TYPE_COLORS: Record<string, string> = {
  flood: '#ef4444',
  fire: '#f97316',
  medical: '#ec4899',
  relief: '#f59e0b',
  shelter: '#22c55e',
  storm: '#3b82f6',
  infrastructure: '#a855f7',
  'search and rescue': '#2EC4B6',
};

export function getIncidentTypeColor(type: string): string {
  const normalizedType = type.trim().toLowerCase();
  if (TYPE_COLORS[normalizedType]) return TYPE_COLORS[normalizedType];

  const fallbackColors = ['#2EC4B6', '#a855f7', '#ec4899', '#14b8a6', '#eab308'];
  const colorIndex = Array.from(normalizedType).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  ) % fallbackColors.length;

  return fallbackColors[colorIndex];
}

function normalizePriority(priority: string): Incident['priority'] {
  const value = priority.toLowerCase();

  if (value === 'urgent') return 'critical';
  if (value === 'medium') return 'normal';
  if (value === 'low' || value === 'normal' || value === 'high' || value === 'critical') return value;

  return 'normal';
}

function normalizeIncident(raw: Record<string, unknown>): Incident {
  const endedAt = raw.Ended_at ?? raw.endedAt;
  const availableAt = raw.availableAt ?? raw.Available_at ?? raw.createdAt ?? raw.Created_at;

  return {
    id: Number(raw.Incident_id ?? raw.incidentId ?? raw.id),
    title: String(raw.Title ?? raw.title ?? 'Untitled incident'),
    description: String(raw.Description ?? raw.description ?? ''),
    type: String(raw.Type ?? raw.type ?? 'Other'),
    latitude: Number(raw.Latitude ?? raw.latitude),
    longitude: Number(raw.Longitude ?? raw.longitude),
    priority: normalizePriority(String(raw.Priority ?? raw.priority ?? 'normal')),
    status: endedAt ? 'closed' : String(raw.status ?? 'open').toLowerCase() === 'closed' ? 'closed' : 'open',
    requiredCertificate: raw.requiredCertificate
      ? String(raw.requiredCertificate)
      : null,
    availableAt: String(availableAt),
    createdBy: Number(raw.createdBy ?? raw.Created_by ?? 0),
  };
}

export function isIncidentUpcoming(incident: Incident, now = Date.now()): boolean {
  return new Date(incident.availableAt).getTime() > now;
}

export function formatIncidentCountdown(availableAt: string, now = Date.now()): string {
  const remainingSeconds = Math.max(
    0,
    Math.ceil((new Date(availableAt).getTime() - now) / 1000),
  );
  if (remainingSeconds === 0) return 'Available now';

  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function createIncident(input: CreateIncidentInput): Promise<number> {
  const user = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null') as {
    token?: string;
  } | null;
  if (!user?.token) throw new Error('Your session is missing. Please log in again.');

  const result = await request<{ incidentId: number }>('/incidents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify(input),
  });
  return result.incidentId;
}

export async function getIncidents(): Promise<Incident[]> {
  const data = await request<unknown[]>('/incidents');
  return data
    .map(item => normalizeIncident(item as Record<string, unknown>))
    .filter(incident => incident.status === 'open');
}

export async function getIncident(id: number): Promise<Incident | null> {
  try {
    const data = await request<Record<string, unknown>>(`/incidents/${id}`);
    return normalizeIncident(data);
  } catch {
    return null;
  }
}

export async function getMyActiveIncidents(): Promise<ActiveVolunteerIncident[]> {
  const user = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null') as {
    token?: string;
  } | null;
  if (!user?.token) throw new Error('Your session is missing. Please log in again.');

  const data = await request<Record<string, unknown>[]>('/incidents/mine/active', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
    },
  });

  return data.map(item => ({
    ...normalizeIncident(item),
    joinedAt: String(item.joinedAt),
    participationStatus: 'joined' as const,
  }));
}

export async function volunteerForIncident(incidentId: number): Promise<void> {
  const user = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null') as {
    token?: string;
  } | null;
  if (!user?.token) throw new Error('Your session is missing. Please log in again.');

  await request(`/incidents/${incidentId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
    },
  });
}

export async function closeIncident(incidentId: number): Promise<void> {
  const user = JSON.parse(localStorage.getItem('plymouth-user') ?? 'null') as {
    token?: string;
  } | null;
  if (!user?.token) throw new Error('Your session is missing. Please log in again.');

  await request(`/incidents/${incidentId}/close`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token}`,
    },
  });
}
