import { useEffect, useState } from "react";

export default function useSpotifyPlayer(token) {
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    if (!token) return;

    console.log("🚀 Initializing Spotify Player...");

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "FitTune Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("✅ Device Ready:", device_id);
        setDeviceId(device_id);

        // store globally
        window.spotifyDeviceId = device_id;
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("❌ Device not ready:", device_id);
      });

      player.connect();
    };

    // load SDK only once
    if (!window.Spotify) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      window.onSpotifyWebPlaybackSDKReady();
    }

  }, [token]);

  return { deviceId };
}