const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function request(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const leaderboardApi = {
  getData: (params = {}) => request(`/api/leaderboard?${new URLSearchParams(params)}`),
  getFilters: (type) => request(`/api/leaderboard/filters?type=${type}`),
};

export const settingsApi = {
  getPage: (page) => request(`/api/settings?page=${page}`),
};
