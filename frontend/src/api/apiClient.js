// Centralized HTTP Client with Bearer Token Injection, 401 Interception, and Automatic Refresh Token Rotation
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiClient(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers
  };

  // Inject Bearer access token if session exists
  try {
    const rawSession = localStorage.getItem(STORAGE_SESSION_KEY);
    if (rawSession) {
      const session = JSON.parse(rawSession);
      const token = session?.accessToken || session?.token;
      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // Ignore session parsing errors
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    let response = await fetch(url, config);

    // Detect HTTP 401 Unauthorized
    // Attempt automatic silent refresh if not already calling login or refresh
    const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/super-admin/login') || endpoint.includes('/auth/refresh');
    
    if (response.status === 401 && !isAuthEndpoint) {
      const rawSession = localStorage.getItem(STORAGE_SESSION_KEY);
      const session = rawSession ? JSON.parse(rawSession) : null;
      const refreshToken = session?.refreshToken;

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ refreshToken })
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              const newTokens = refreshData.data || refreshData;

              // Update session storage with new tokens
              session.accessToken = newTokens.accessToken;
              session.token = newTokens.accessToken;
              session.refreshToken = newTokens.refreshToken || session.refreshToken;
              session.tokenType = newTokens.tokenType || 'Bearer';
              if (newTokens.expiresIn) {
                session.expiresAt = Date.now() + (newTokens.expiresIn * 1000);
              }
              localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));

              processQueue(null, newTokens.accessToken);

              // Retry original failed request with newly issued access token
              config.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
              response = await fetch(url, config);
            } else {
              // Refresh token also expired or revoked
              processQueue(new Error('Session expired'), null);
              localStorage.removeItem(STORAGE_SESSION_KEY);
              window.dispatchEvent(new CustomEvent('auth:expired'));
            }
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            localStorage.removeItem(STORAGE_SESSION_KEY);
            window.dispatchEvent(new CustomEvent('auth:expired'));
          } finally {
            isRefreshing = false;
          }
        } else {
          // Wait for current refresh to complete, then retry
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (newAccessToken) => {
                config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                resolve(fetch(url, config).then(res => res.json()));
              },
              reject: (err) => reject(err)
            });
          });
        }
      } else {
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
    throw new ApiError(error.message || 'Network request failed. Is the backend server running?', 0, null);
  }
}
