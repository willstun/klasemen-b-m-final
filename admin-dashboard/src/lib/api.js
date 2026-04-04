// ─── Admin API Service ──────────────────────────────────
// All admin API calls in one place

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
    ...options,
  };

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Auth ───────────────────────────────────────────────

export const authApi = {
  checkSetup: () => request("/api/auth/check-setup"),
  me: () => request("/api/auth/me"),
  login: (username, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  register: (username, password) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
};

// ─── Competitions ───────────────────────────────────────

export const competitionApi = {
  list: (type) => request(`/api/admin/competitions${type ? `?type=${type}` : ""}`),
  get: (id) => request(`/api/admin/competitions/${id}`),
  create: (data) =>
    request("/api/admin/competitions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/api/admin/competitions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/api/admin/competitions/${id}`, { method: "DELETE" }),
};

// ─── Participants ───────────────────────────────────────

export const participantApi = {
  create: (data) =>
    request("/api/admin/participants", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  bulkCreate: (competitionId, participants) =>
    request("/api/admin/participants/bulk", {
      method: "POST",
      body: JSON.stringify({ competitionId, participants }),
    }),
  update: (id, data) =>
    request(`/api/admin/participants/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/api/admin/participants/${id}`, { method: "DELETE" }),
  toggleStatus: (data) =>
    request("/api/admin/participants/toggle-status", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Prizes ─────────────────────────────────────────────

export const prizeApi = {
  list: (type) => request(`/api/prizes?type=${type}`),
  upsert: (data) =>
    request("/api/prizes", { method: "POST", body: JSON.stringify(data) }),
  bulkUpdate: (type, prizes) =>
    request("/api/prizes", {
      method: "PUT",
      body: JSON.stringify({ type, prizes }),
    }),
  remove: (type, rank) =>
    request("/api/prizes", {
      method: "DELETE",
      body: JSON.stringify({ type, rank }),
    }),
};

// ─── Users ──────────────────────────────────────────────

export const userApi = {
  list: () => request("/api/admin/users"),
  update: (data) =>
    request("/api/admin/users", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request("/api/admin/users", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),
};

// ─── Settings ───────────────────────────────────────────

export const settingsApi = {
  get: (page) => request(`/api/settings?page=${page}`),
  update: (data) =>
    request("/api/settings", { method: "PUT", body: JSON.stringify(data) }),
};

// ─── Logs ───────────────────────────────────────────────

export const logApi = {
  list: (limit = 50) => request(`/api/admin/logs?limit=${limit}`),
};

// ─── Theme ──────────────────────────────────────────────

export const themeApi = {
  get: (target) => request(`/api/theme/${target}`),
  updateFrontendColors: (colors) =>
    request("/api/theme/frontend", {
      method: "PUT",
      body: JSON.stringify({ colors }),
    }),
  resetFrontend: () =>
    request("/api/theme/frontend", { method: "DELETE" }),
};

// ─── Upload ─────────────────────────────────────────────

export const uploadApi = {
  file: async (formData, folder = "general") => {
    const res = await fetch(`${API_BASE}/api/upload?folder=${folder}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload gagal" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },
  delete: (url) =>
    request("/api/upload", {
      method: "DELETE",
      body: JSON.stringify({ url }),
    }),
};
