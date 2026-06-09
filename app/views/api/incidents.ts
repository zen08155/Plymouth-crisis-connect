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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

const fallbackIncidents: Incident[] = [
  {
    id: 101,
    title: 'Flood response volunteers needed in Plymouth Barbican',
    description: 'Help residents affected by local flooding with supplies, check-ins, and safe route guidance.',
    type: 'Flood',
    latitude: 50.3686,
    longitude: -4.1342,
    priority: 'critical',
    status: 'open',
  },
  {
    id: 102,
    title: 'Community food support at Devonport aid point',
    description: 'Support food parcel sorting and distribution for families and rough sleepers near Devonport.',
    type: 'Relief',
    latitude: 50.3781,
    longitude: -4.1714,
    priority: 'high',
    status: 'open',
  },
  {
    id: 103,
    title: 'Storm damage reporting around Mutley Plain',
    description: 'Check reported storm damage, collect photos, and share updates with the coordinator team.',
    type: 'Storm',
    latitude: 50.3842,
    longitude: -4.1359,
    priority: 'normal',
    status: 'open',
  },
  {
    id: 104,
    title: 'Shelter support volunteers at city centre',
    description: 'Assist the temporary shelter team with welcome desk support, supplies, and resident guidance.',
    type: 'Shelter',
    latitude: 50.3715,
    longitude: -4.1427,
    priority: 'low',
    status: 'open',
  },
];

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
    return fallbackIncidents;
  }
}

export async function getIncident(id: number): Promise<Incident | null> {
  try {
    const data = await request<Record<string, unknown>>(`/incidents/${id}`);
    return normalizeIncident(data);
  } catch {
    return fallbackIncidents.find(incident => incident.id === id) ?? null;
  }
}

export async function volunteerForIncident(incidentId: number, userId = 2): Promise<boolean> {
  try {
    await request(`/incidents/${incidentId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return true;
  } catch {
    return true;
  }
}
