import { useEffect, useState, useRef } from "react";
import useSpotifyPlayer from "../hooks/useSpotifyPlayer";

export default function MusicPlayer() {
  const token = localStorage.getItem("spotify_token");
  const { deviceId } = useSpotifyPlayer(token);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [deviceReady, setDeviceReady] = useState(false);

  const pausePollRef = useRef(false);

  useEffect(() => {
    if (deviceId) {
      window.spotifyDeviceId = deviceId;
      setDeviceReady(true);
    }
  }, [deviceId]);

  // Poll Spotify every 1s for current playback state
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      if (pausePollRef.current) return;

      try {
        const res = await fetch("https://api.spotify.com/v1/me/player", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 204 || res.status === 202) return;

        if (res.ok) {
          const data = await res.json();
          setCurrentTrack(data.item ?? null);
          setIsPlaying(data.is_playing ?? false);
          setProgress(data.progress_ms ?? 0);
          setDuration(data.item?.duration_ms ?? 0);
        }
      } catch (err) {
        console.error("Player polling error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

  const formatTime = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const withPausedPoll = async (fn) => {
    pausePollRef.current = true;
    await fn();
    setTimeout(() => { pausePollRef.current = false; }, 2000);
  };

  // ⏸▶ Play / Pause
  const handlePlayPause = async () => {
    await withPausedPoll(async () => {
      if (isPlaying) {
        setIsPlaying(false);
        await fetch("https://api.spotify.com/v1/me/player/pause", {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        setIsPlaying(true);
        const did = deviceId || window.spotifyDeviceId;
        if (!did) return;

        await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ device_ids: [did], play: false }),
        });

        await new Promise((r) => setTimeout(r, 800));

        await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${did}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    });
  };

  // ⏭ Next
  const nextSong = async () => {
    await withPausedPoll(async () => {
      await fetch("https://api.spotify.com/v1/me/player/next", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    });
  };

  // ⏮ Previous
  const prevSong = async () => {
    await withPausedPoll(async () => {
      await fetch("https://api.spotify.com/v1/me/player/previous", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    });
  };

  // Only hide if not logged in at all
  if (!token) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#0d0d2b] border-t border-[#2a2a5a] px-6 flex items-center justify-between z-[9999]">

      {/* Track info — left */}
      <div className="flex items-center gap-4 w-1/3 min-w-0">
        {currentTrack ? (
          <>
            <img
              src={currentTrack.album?.images[0]?.url}
              alt=""
              className="w-12 h-12 rounded flex-shrink-0"
            />
            <div className="overflow-hidden">
              <p className="text-white font-semibold text-sm truncate">
                {currentTrack.name}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {currentTrack.artists?.[0]?.name}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-[#1a1a3a] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🎵</span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">No track playing</p>
              <p className="text-gray-600 text-xs">
                {deviceReady ? "Device ready" : "Connecting..."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls + progress — center */}
      <div className="flex flex-col items-center w-1/3 gap-1">
        <div className="flex gap-5 items-center">
          <button
            onClick={prevSong}
            className="text-gray-400 hover:text-white text-xl transition"
          >
            ⏮
          </button>

          <button
            onClick={handlePlayPause}
            disabled={!deviceReady}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg transition ${
              deviceReady
                ? "bg-green-500 hover:bg-green-400 cursor-pointer"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            onClick={nextSong}
            className="text-gray-400 hover:text-white text-xl transition"
          >
            ⏭
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 w-full text-xs text-gray-500">
          <span className="w-8 text-right">{formatTime(progress)}</span>
          <div className="flex-1 bg-gray-700 rounded-full h-1">
            <div
              className="bg-green-500 h-1 rounded-full transition-all duration-500"
              style={{
                width: duration ? `${(progress / duration) * 100}%` : "0%",
              }}
            />
          </div>
          <span className="w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Spacer — right */}
      <div className="w-1/3" />
    </div>
  );
}