const TOKEN_KEY = "cyberflix_token";

const API_URL = import.meta.env.VITE_API_URL || "https://cyberflx-1.onrender.com";

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const fullPath = path.startsWith("http") ? path : API_URL + path;
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(fullPath, {
    ...options,
    headers,
    body:
      options.body && typeof options.body === "object" && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  me: () => request("/api/auth/me"),
  getContent: () => request("/api/content"),
  getContentById: (id) => request(`/api/content/${id}`),
  register: (username, email, password) =>
    request("/api/auth/register", { method: "POST", body: { username, email, password } }),
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password } }),
  verifyEmail: (verificationCode) =>
    request("/api/auth/verify-email", { method: "POST", body: { verificationCode } }),
  resendVerificationEmail: () =>
    request("/api/auth/resend-verification-email", { method: "POST" }),
  updateProfile: (updates) =>
    request("/api/auth/me", { method: "PATCH", body: updates }),
  getWatchlist: () => request("/api/watchlist"),
  toggleWatchlist: (contentId) =>
    request("/api/watchlist", { method: "PUT", body: { contentId } }),
  submitRating: (contentId, ratings) =>
    request(`/api/content/${contentId}/rate`, { method: "POST", body: { ratings } }),
  getRatings: (contentId) => request(`/api/content/${contentId}/ratings`),
};
