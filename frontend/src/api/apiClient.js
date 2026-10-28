// Centralized HTTP Client with Bearer Token Injection & Error Handling
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const STORAGE_SESSION_KEY = 'nexora_auth_session';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers
  };

  // Inject Bearer token if session exists
  try {
    const rawSession = localStorage.getItem(STORAGE_SESSION_KEY);
    if (rawSession) {
      const session = JSON.parse(rawSession);
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
    }
  } catch (e) {
    // Ignore session reading errors
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized -> redirect/clear invalid session if needed
    if (response.status === 401) {
      if (!endpoint.includes('/auth/login')) {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    }

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = json?.message || (json?.data && typeof json.data === 'object' ? Object.values(json.data).join(', ') : `HTTP ${response.status} Error`);
      throw new ApiError(errorMessage, response.status, json);
    }

    return json;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or offline error
    throw new ApiError(error.message || 'Network request failed. Is the backend server running?', 0, null);
  }
}
