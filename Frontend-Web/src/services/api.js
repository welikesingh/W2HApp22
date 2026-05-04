const TOKEN_KEY = 'hsa_auth_token';

export function apiBaseUrl() {
  return (window.HSA_API_BASE_URL || '').replace(/\/$/, '');
}

export function apiUrl(path) {
  return path.startsWith('/api') ? `${apiBaseUrl()}${path}` : path;
}

export function authHeaders(headers = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}
