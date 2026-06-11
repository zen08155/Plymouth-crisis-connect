export interface Incident {
  id: number;
  title: string;
  description: string;
  type: string;
  latitude: number;
  longitude: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'open' | 'closed';
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const TYPE_COLORS: Record<string, string> = {
  flood: '#ef4444',
  relief: '#f59e0b',
  shelter: '#22c55e',
  storm: '#3b82f6',
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

  return {
    id: Number(raw.Incident_id ?? raw.incidentId ?? raw.id),
    title: String(raw.Title ?? raw.title ?? 'Untitled incident'),
    description: String(raw.Description ?? raw.description ?? ''),
    type: String(raw.Type ?? raw.type ?? 'Other'),
    latitude: Number(raw.Latitude ?? raw.latitude),
    longitude: Number(raw.Longitude ?? raw.longitude),
    priority: normalizePriority(String(raw.Priority ?? raw.priority ?? 'normal')),
    status: endedAt ? 'closed' : String(raw.status ?? 'open').toLowerCase() === 'closed' ? 'closed' : 'open',
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getIncidents(): Promise<Incident[]> {
  try {
    const data = await request<unknown[]>('/incidents');
    return data.map(item => normalizeIncident(item as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getIncident(id: number): Promise<Incident | null> {
  try {
    const data = await request<Record<string, unknown>>(`/incidents/${id}`);
    return normalizeIncident(data);
  } catch {
    return null;
  }
}

export async function volunteerForIncident(incidentId: number, userId: number): Promise<boolean> {
  try {
    await request(`/incidents/${incidentId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return true;
  } catch {
    return false;
  }
}
