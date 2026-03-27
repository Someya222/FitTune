import { useEffect, useState } from "react";

export default function useSpotifyPlayer(token) {
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    if (!token || !window.Spotify) return;
    
    window.onSpotifyWebPlaybackSDKReady = () => {
  console.log("SDK Ready");

  const token = localStorage.getItem("spotify_token");

  const player = new window.Spotify.Player({
    name: "FitTune Player",
    getOAuthToken: (cb) => cb(token),
    volume: 0.5,
  });

  player.addListener("ready", ({ device_id }) => {
    console.log("✅ Device Ready:", device_id);
    localStorage.setItem("spotify_device_id", device_id);
  });

  player.connect();
};

    console.log("🚀 Initializing Spotify Player...");

    const player = new window.Spotify.Player({
      name: "FitTune Player",
      getOAuthToken: async (cb) => {
  let token = localStorage.getItem("spotify_token");

  if (!token) {
    token = await refreshAccessToken();
  }

  cb(token);
},
      volume: 0.5,
    });

    player.addListener("ready", ({ device_id }) => {
      console.log("✅ Device Ready:", device_id);
      setDeviceId(device_id);
    });

    player.addListener("initialization_error", (e) =>
      console.error("Init error", e)
    );
    player.addListener("authentication_error", (e) =>
      console.error("Auth error", e)
    );
    player.addListener("account_error", (e) =>
      console.error("Account error", e)
    );
    player.addListener("playback_error", (e) =>
      console.error("Playback error", e)
    );
     
   player.addListener("player_state_changed", (state) => {
  if (!state) return;

  const current = state.track_window.current_track;

  console.log("🎵 Now Playing:", current.name);

  // store globally (temporary)
  window.currentTrack = {
    name: current.name,
    artist: current.artists[0].name,
    image: current.album.images[0].url,
  };
});

    player.connect();
  }, [token]);

  return { deviceId };
}

const refreshAccessToken = async () => {
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
      return data.access_token;
    }
  } catch (err) {
    console.error("Refresh failed", err);
  }

  return null;
};