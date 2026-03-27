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
      getOAuthToken: (cb) => cb(token),
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