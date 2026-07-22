// Backend origin for raw `fetch()` calls. Axios calls don't need this — they
// pick up axios.defaults.baseURL (set in main.jsx) automatically — but plain
// fetch() has no such default, so a relative "/api/..." path only works
// locally via the Vite dev proxy and silently breaks once frontend and
// backend are deployed as separate origins (e.g. two Railway services).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

// Shared request-header builder for raw `fetch()` calls against staff-only
// API endpoints (axios calls already get the token via the interceptor in
// main.jsx). Every reservation/payment/guest/service endpoint requires a
// logged-in user, so this must be included whenever fetch() is used instead
// of axios.
export function authHeaders(extra = {}) {
  const token = sessionStorage.getItem("auth_token");
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}
