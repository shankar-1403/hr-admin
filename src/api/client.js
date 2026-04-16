const BASE = import.meta.env.VITE_API_URL || '/api';

export async function api(endpoint, options = {}) {
  const { token, ...rest } = options;
  const isFormData = rest.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${BASE}${endpoint}`, { ...rest, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText);
  return data;
}
