// Thin fetch wrapper around the backend in server/. Every call includes
// credentials so the httpOnly session cookie goes with it.

const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Something went wrong");
  return body;
}

export function signup(email, password, displayName) {
  return request("/signup", { method: "POST", body: JSON.stringify({ email, password, displayName }) });
}

export function login(email, password) {
  return request("/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function logout() {
  return request("/logout", { method: "POST" });
}

export function me() {
  return request("/me");
}

export function getState() {
  return request("/state");
}

export function saveState(state) {
  return request("/state", { method: "PUT", body: JSON.stringify(state) });
}
