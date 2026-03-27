import useSpotifyPlayer from "../hooks/useSpotifyPlayer";

export default function MusicPlayer() {
  const token = localStorage.getItem("spotify_token");

  const { player, deviceId } = useSpotifyPlayer(token);

  // ▶️ PLAY
  const playSong = async () => {
    if (!deviceId) return alert("Device not ready yet");

    // Step 1: Activate device
    await fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Step 2: Play song
    await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          uris: ["spotify:track:4uLU6hMCjMI75M1A2tKUQC"], // test song
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  // ⏸ PAUSE
  const pauseSong = async () => {
    await fetch("https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // ⏭ NEXT
  const nextSong = async () => {
    await fetch("https://api.spotify.com/v1/me/player/next", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">🎵 Spotify Player</h1>

      <p className="mb-4">
        <strong>Device ID:</strong>{" "}
        {deviceId ? deviceId : "Connecting..."}
      </p>

      <div className="flex gap-4">
        <button
          onClick={playSong}
          className="bg-green-500 px-4 py-2 rounded-lg"
        >
          ▶️ Play
        </button>

        <button
          onClick={pauseSong}
          className="bg-yellow-500 px-4 py-2 rounded-lg"
        >
          ⏸ Pause
        </button>

        <button
          onClick={nextSong}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          ⏭ Next
        </button>
      </div>
    </div>
  );
}