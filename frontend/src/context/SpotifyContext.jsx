import React, { createContext, useContext, useEffect, useState, useRef } from "react";

const SpotifyContext = createContext();

export const SpotifyProvider = ({ children }) => {
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [token, setToken] = useState(localStorage.getItem("spotify_token"));

  const playerRef = useRef(null);
  const pausePollRef = useRef(false);

  // Sync token and handle refresh events
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("spotify_token"));
    };
    const handleTokenUpdate = (e) => {
      setToken(e.detail);
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("spotify-token-updated", handleTokenUpdate);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("spotify-token-updated", handleTokenUpdate);
    };
  }, []);

  // Initialize Spotify Player
  useEffect(() => {
    if (!token) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }

      const player = new window.Spotify.Player({
        name: "FitTune Global Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      playerRef.current = player;

      player.addListener("ready", ({ device_id }) => {
        console.log("🟢 Spotify Device Ready:", device_id);
        setDeviceId(device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("🔴 Spotify Device offline:", device_id);
        setDeviceId(null);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
        setProgress(state.position);
        setDuration(state.duration);
      });

      player.addListener("initialization_error", ({ message }) => console.error("Init Error:", message));
      player.addListener("authentication_error", ({ message }) => console.error("Auth Error:", message));
      player.addListener("account_error", ({ message }) => console.error("Account Error:", message));

      player.connect();
    };

    if (!window.Spotify) {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
      const script = document.createElement("script");
      script.id = "spotify-player-script";
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token]);

  // Polling fallback if SDK events are slow (optional but helpful)
  useEffect(() => {
    if (!token || !isPlaying) return;

    const interval = setInterval(async () => {
      if (pausePollRef.current) return;
      try {
        const res = await fetch("https://api.spotify.com/v1/me/player", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200) {
          const data = await res.json();
          setProgress(data.progress_ms || 0);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token, isPlaying]);

  const withPausedPoll = async (fn) => {
    pausePollRef.current = true;
    await fn();
    setTimeout(() => { pausePollRef.current = false; }, 2000);
  };

  const playTrack = async (uris, offsetUri = null) => {
    if (!deviceId) return;
    await withPausedPoll(async () => {
      const body = offsetUri ? { uris, offset: { uri: offsetUri } } : { uris };
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    });
  };

  const togglePlay = async () => {
    if (!playerRef.current) return;
    await playerRef.current.togglePlay();
  };

  const nextTrack = async () => {
    if (!playerRef.current) return;
    await playerRef.current.nextTrack();
  };

  const prevTrack = async () => {
    if (!playerRef.current) return;
    await playerRef.current.previousTrack();
  };

  const seek = async (positionMs) => {
    if (!playerRef.current) return;
    await playerRef.current.seek(positionMs);
  };

  return (
    <SpotifyContext.Provider
      value={{
        deviceId,
        currentTrack,
        isPlaying,
        progress,
        duration,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        token
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => useContext(SpotifyContext);
