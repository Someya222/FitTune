import useSpotifyPlayer from "../hooks/useSpotifyPlayer";
import { fetchWithAuth } from "../utils/spotifyFetch";
import { useEffect, useState } from "react";

const GENRES = ["workout", "bollywood", "hip-hop", "lo-fi", "pop", "rock", "jazz"];

export default function MusicLibrary() {
  const [songs, setSongs] = useState([]);
  const [genre, setGenre] = useState("workout");
  // ✅ Track deviceId in React state so buttons re-render properly
  const [deviceReady, setDeviceReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  const token = localStorage.getItem("spotify_token");
  const isPremium = localStorage.getItem("spotify_product") === "premium";

  const { deviceId } = useSpotifyPlayer(token);

  useEffect(() => {
    if (deviceId) {
      window.spotifyDeviceId = deviceId;
      setDeviceReady(true); // ✅ triggers re-render, buttons go green
      console.log("🎧 Device ready:", deviceId);
    }
  }, [deviceId]);

  // ✅ Fetch songs when genre changes
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetchWithAuth(
          `http://localhost:5000/api/spotify/search?q=${genre}` // ✅ dynamic genre
        );
        const data = await res.json();
        setSongs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching songs:", err);
        setSongs([]);
      }
    };
    if (token) fetchSongs();
  }, [token, genre]); // ✅ re-fetches when genre changes

  const playSong = async (song) => {
    const token = localStorage.getItem("spotify_token");
    const deviceId = window.spotifyDeviceId;

    if (isPremium) {
      if (!deviceId) return;

      try {
        await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ device_ids: [deviceId], play: true }),
        });

        await new Promise((res) => setTimeout(res, 800));

        // ✅ Pass full queue so next/prev work across the list
        await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uris: songs.map((s) => s.uri),
              offset: { uri: song.uri },
            }),
          }
        );

        // ✅ Use React state, not window global
        setCurrentTrack({
          name: song.name,
          artist: song.artists[0]?.name,
          image: song.album?.images[0]?.url,
        });
      } catch (err) {
        console.error("Playback error:", err);
      }
    } else {
      if (!song.preview_url) return alert("No preview available");
      const audio = new Audio(song.preview_url);
      audio.play();
      setCurrentTrack({
        name: song.name,
        artist: song.artists[0]?.name,
        image: song.album?.images[0]?.url,
      });
    }
  };

  return (
    <div className="space-y-6 p-6 text-white pb-24">
      <h1 className="text-3xl font-bold">🎵 Music Library</h1>

      {/* ✅ Genre Selector */}
      <div className="flex gap-2 flex-wrap">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-4 py-1 rounded-full text-sm capitalize transition ${
              genre === g
                ? "bg-green-500 text-white"
                : "bg-[#1a1a3a] text-gray-300 hover:bg-[#2a2a5a]"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {songs.length === 0 && (
        <p className="text-gray-400">No songs found...</p>
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
                <p className="text-sm text-gray-400">{song.artists[0]?.name}</p>
              </div>
            </div>

            {/* ✅ Uses React state deviceReady instead of window.* */}
            <button
              onClick={() => playSong(song)}
              disabled={!deviceReady}
              className={`px-3 py-1 rounded ${
                deviceReady ? "bg-green-500 hover:bg-green-400" : "bg-gray-500 cursor-not-allowed"
              }`}
            >
              ▶ Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}