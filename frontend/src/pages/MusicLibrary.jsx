import useSpotifyPlayer from "../hooks/useSpotifyPlayer";
import { useEffect, useState } from "react";

export default function MusicLibrary() {
  const [songs, setSongs] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);

  const token = localStorage.getItem("spotify_token");

  const { deviceId } = useSpotifyPlayer(token);

  // ✅ store deviceId globally
  useEffect(() => {
    if (deviceId) {
      window.spotifyDeviceId = deviceId;
      console.log("🎧 Device stored:", deviceId);
    }
  }, [deviceId]);

  const isPremium =
    localStorage.getItem("spotify_product") === "premium";

  // ✅ FETCH SONGS
  useEffect(() => {
    const fetchSongs = async () => {
  try {
    const token = localStorage.getItem("spotify_token");

    if (!token) {
      setSongs([]);
      return;
    }

    const res = await fetch(
      "http://localhost:5000/api/spotify/search?q=workout",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // ❌ TOKEN EXPIRED
    if (res.status === 401) {
      alert("Session expired. Please reconnect Spotify.");

      localStorage.removeItem("spotify_token");
      localStorage.removeItem("spotify_connected");

      setSongs([]);
      return;
    }

    const data = await res.json();

    setSongs(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Error fetching songs:", err);
    setSongs([]);
  }
};


    if (token) fetchSongs();
  }, [token]);

  // ✅ PLAY SONG (FIXED)
  const playSong = async (song) => {
    const token = localStorage.getItem("spotify_token");
    const deviceId = window.spotifyDeviceId;

    if (isPremium) {
      if (!deviceId) {
        alert("Player not ready yet");
        return;
      }

      try {
        // ✅ STEP 1: Transfer playback to device
        await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_ids: [deviceId],
            play: true,
          }),
        });

        // ⏳ WAIT (IMPORTANT)
        await new Promise((res) => setTimeout(res, 1000));

        // ✅ STEP 2: Play on that device (FIXED URL)
        await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uris: [song.uri],
            }),
          }
        );

        // ✅ update current track UI
        window.currentTrack = {
          name: song.name,
          artist: song.artists[0]?.name,
          image: song.album?.images[0]?.url,
        };

      } catch (err) {
        console.error("Playback error:", err);
      }
    } else {
      // ✅ FREE USER (preview)
      if (!song.preview_url) {
        alert("No preview available");
        return;
      }

      if (currentAudio) currentAudio.pause();

      const audio = new Audio(song.preview_url);
      audio.play();
      setCurrentAudio(audio);

      // update UI
      setCurrentTrack({
        name: song.name,
        artist: song.artists[0]?.name,
        image: song.album?.images[0]?.url,
      });
    }
  };

  // ✅ Sync current playing track
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.currentTrack) {
        setCurrentTrack(window.currentTrack);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 p-6 text-white">
      <h1 className="text-3xl font-bold">🎵 Music Library</h1>

      {songs.length === 0 && (
        <p className="text-gray-400">No songs found...</p>
      )}

      {currentTrack && (
        <div className="p-4 bg-black/40 rounded-xl flex items-center gap-4">
          <img src={currentTrack.image} className="w-12 h-12 rounded" />
          <div>
            <p>{currentTrack.name}</p>
            <p className="text-sm text-gray-400">
              {currentTrack.artist}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {songs.map((song) => (
          <div
            key={song.id}
            className="p-4 bg-[#1a1a3a] rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={song.album?.images[0]?.url}
                alt=""
                className="w-12 h-12 rounded"
              />

              <div>
                <p className="font-semibold">{song.name}</p>
                <p className="text-sm text-gray-400">
                  {song.artists[0]?.name}
                </p>
              </div>
            </div>

            <button
              onClick={() => playSong(song)}
              className="bg-green-500 px-3 py-1 rounded"
            >
              ▶ Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}