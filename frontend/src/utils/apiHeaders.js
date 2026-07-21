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
