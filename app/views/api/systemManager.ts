export interface VolunteerAccount {
  id: number;
  name: string;
  surname: string;
  email: string;
  status: string;
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

export function getVolunteers(): Promise<VolunteerAccount[]> {
  return request('/api/system-manager/volunteers');
}

export function promoteVolunteer(
  volunteerId: number,
): Promise<{ message: string }> {
  return request(`/api/system-manager/volunteers/${volunteerId}/promote`, {
    method: 'PATCH',
  });
}
