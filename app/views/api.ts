export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ManagerUser {
  User_id: number;
  Name: string;
  Surname: string;
  Email: string;
  Role: string;
}

export interface LoginData {
  token: string;
  user: ManagerUser;
}

export interface VolunteerRegistration {
  first_name: string;
  surname: string;
  email: string;
  password: string;
  country_code: string;
  phone: string;
  date_of_birth: string;
  home_address?: string;
  work_address?: string;
}

const TOKEN_KEY = 'pcc_auth_token';
const USER_KEY = 'pcc_auth_user';

export function getAuthToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getAuthenticatedUser(): ManagerUser | null {
  const storedUser = sessionStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as ManagerUser;
  } catch {
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
}

export function getRoleDestination(role: string): string {
  const destinations: Record<string, string> = {
    system_manager: '/manager',
    coordinator: '/tasks',
    volunteer: '/tasks',
  };

  return destinations[role] ?? '/';
}

export function clearAuthToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, { ...options, headers });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.detail || 'The server could not complete the request.');
  }

  return body as ApiResponse<T>;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginData> {
  const response = await request<LoginData>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  sessionStorage.setItem(TOKEN_KEY, response.data.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  return response.data;
}

export async function loadCurrentUser(): Promise<ManagerUser> {
  try {
    const response = await request<ManagerUser>('/api/auth/me');
    sessionStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    clearAuthToken();
    throw error;
  }
}

export async function registerVolunteer(
  registration: VolunteerRegistration,
): Promise<ManagerUser> {
  const response = await request<ManagerUser>('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(registration),
  });
  return response.data;
}

export async function loadRealtimeDashboard(): Promise<Record<string, unknown>> {
  const response = await request<Record<string, unknown>>(
    '/api/system-manager/dashboard/realtime',
  );
  return response.data;
}

export async function logoutUser(): Promise<void> {
  try {
    await request<{ user_id: number }>('/api/auth/logout', {
      method: 'POST',
    });
  } finally {
    clearAuthToken();
  }
}
