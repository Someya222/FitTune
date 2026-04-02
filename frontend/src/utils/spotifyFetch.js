export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("spotify_refresh_token");

  if (!refreshToken) return null;

  try {
    const res = await fetch("http://localhost:5000/api/spotify/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await res.json();

    if (data.access_token) {
      localStorage.setItem("spotify_token", data.access_token);
      // 🔥 Notify context to re-initialize
      window.dispatchEvent(new CustomEvent("spotify-token-updated", { detail: data.access_token }));
      return data.access_token;
    }
  } catch (err) {
    console.error("Refresh failed", err);
  }

  return null;
};

export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem("spotify_token");

  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    console.log("🔄 Token expired → refreshing...");

    const newToken = await refreshAccessToken();

    if (!newToken) {
      localStorage.clear();
      return res;
    }

    res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      },
    });
  }

  return res;
};