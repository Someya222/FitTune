import { useSpotify } from "../context/SpotifyContext";
import { useState, useEffect } from "react";

export default function MusicPlayer() {
  const [scrubValue, setScrubValue] = useState(null);
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    duration, 
    deviceId, 
    togglePlay, 
    nextTrack, 
    prevTrack, 
    seek,
    token
  } = useSpotify();

  // Reset scrub value when track changes
  useEffect(() => {
    setScrubValue(null);
  }, [currentTrack?.id]);

  const formatTime = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSeek = (e) => {
    const val = parseInt(e.target.value);
    setScrubValue(val);
  };

  const handleSeekEnd = () => {
    if (scrubValue !== null) {
      seek(scrubValue);
      // Wait for SDK state to sync back before clearing scrubValue
      setTimeout(() => setScrubValue(null), 1000);
    }
  };

  if (!token) return null;

  const displayProgress = scrubValue !== null ? scrubValue : progress;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#0d0d2b]/95 backdrop-blur-md border-t border-[#2a2a5a] px-6 flex items-center justify-between z-[9999]">
      {/* Track info — left */}
      <div className="flex items-center gap-4 w-1/3 min-w-0">
        {currentTrack ? (
          <>
            <img
              src={currentTrack.album?.images[0]?.url}
              alt=""
              className="w-12 h-12 rounded flex-shrink-0 shadow-lg"
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
              <span className="text-2xl text-gray-400">🎵</span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">No track playing</p>
              <p className="text-gray-600 text-xs">
                {deviceId ? "Device ready" : "Connecting Spotify..."}
              </p>
            </div>
          </div>
        ) }
      </div>

      {/* Controls + progress — center */}
      <div className="flex flex-col items-center w-5/12 gap-1">
        <div className="flex gap-6 items-center">
          <button
            onClick={prevTrack}
            className="text-gray-400 hover:text-white text-xl transition transform active:scale-90"
          >
            ⏮
          </button>

          <button
            onClick={togglePlay}
            disabled={!deviceId}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xl transition transform hover:scale-105 active:scale-95 ${
              deviceId
                ? "bg-white !text-black shadow-lg cursor-pointer"
                : "bg-gray-700 cursor-not-allowed opacity-50"
            }`}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            onClick={nextTrack}
            className="text-gray-400 hover:text-white text-xl transition transform active:scale-90"
          >
            ⏭
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 w-full text-[10px] font-mono text-gray-500">
          <span className="w-10 text-right">{formatTime(displayProgress)}</span>
          <div className="relative flex-1 flex items-center h-4 group">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={displayProgress}
              onChange={handleSeek}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-green-500 hover:h-1.5 transition-all"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${(displayProgress / (duration || 1)) * 100}%, #374151 ${(displayProgress / (duration || 1)) * 100}%, #374151 100%)`
              }}
            />
          </div>
          <span className="w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Spacing — right */}
      <div className="w-1/3 flex justify-end items-center gap-3 opacity-0 text-white">
          {/* Volume control could go here */}
      </div>
    </div>
  );
}