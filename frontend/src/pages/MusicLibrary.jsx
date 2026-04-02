import { fetchWithAuth } from "../utils/spotifyFetch";
import { useEffect, useState } from "react";
import { useSpotify } from "../context/SpotifyContext";
import Equalizer from "../components/Equalizer";

const GENRES = ["workout", "phonk", "edm", "hip-hop", "bollywood", "rock", "pop", "lo-fi"];

export default function MusicLibrary() {
  const [songs, setSongs] = useState([]);
  const [genre, setGenre] = useState(null); // null means "Top Tracks"
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { deviceId, currentTrack, isPlaying, playTrack, token } = useSpotify();

  // ✅ Fetch Songs (Top Tracks, Genre, or Search)
  const fetchSongs = async (query = null) => {
    setIsLoading(true);
    try {
      let url;
      if (query) {
        url = `http://localhost:5000/api/spotify/search?q=${encodeURIComponent(query)}`;
      } else if (genre) {
        url = `http://localhost:5000/api/spotify/search?q=${encodeURIComponent(genre)}`;
      } else {
        url = `http://localhost:5000/api/spotify/top-tracks`;
      }

      const res = await fetchWithAuth(url);
      const data = await res.json();
      
      if (res.status === 401) {
        alert("Spotify session expired. Please re-connect on Dashboard.");
        return;
      }

      setSongs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching songs:", err);
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Debounced Search
  useEffect(() => {
    if (!token) return;
    
    if (searchQuery.trim().length > 2) {
      const delay = setTimeout(() => {
        setGenre(null); // Reset genre when searching
        fetchSongs(searchQuery);
      }, 500);
      return () => clearTimeout(delay);
    } else if (searchQuery.trim().length === 0) {
      fetchSongs();
    }
  }, [token, searchQuery]);

  // ✅ Re-fetch when genre changes (unless searching)
  useEffect(() => {
    if (token && !searchQuery) {
      fetchSongs();
    }
  }, [token, genre]);

  const handlePlaySong = async (song) => {
    if (!deviceId) return;
    const uris = songs.map((s) => s.uri);
    await playTrack(uris, song.uri);
  };

  const surpriseMe = async () => {
    setIsLoading(true);
    try {
      let query = "limit=10&target_energy=0.9&target_tempo=150";
      
      if (songs.length > 0) {
        const seedTracks = songs.slice(0, 2).map(s => s.id).join(",");
        query += `&seed_tracks=${seedTracks}`;
      } else {
        query += `&seed_genres=workout,rock`;
      }

      const res = await fetchWithAuth(`http://localhost:5000/api/spotify/recommendations?${query}`);
      const data = await res.json();
      
      if (res.status === 401) {
        alert("Spotify session expired. Please re-connect on Dashboard.");
        return;
      }

      if (Array.isArray(data) && data.length > 0) {
        setSongs(data);
        const uris = data.map((s) => s.uri);
        await playTrack(uris, data[0].uri);
      } else {
        const errorMsg = data?.message || "Spotify has no recommendations for those songs right now. Try a different seed!";
        alert(errorMsg);
        setGenre("workout");
      }
    } catch (err) {
      console.error("Surprise Me fatal error:", err);
      alert("Something went wrong with recommendations.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 text-white pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {searchQuery ? "Search Results" : genre ? `${genre} Music` : "Your Top Tracks"}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => fetchSongs()}
            className="p-2 bg-[#1a1a3a] hover:bg-[#2a2a5a] rounded-lg transition"
            title="Refresh"
          >
            🔄
          </button>
          <button
            onClick={surpriseMe}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            ✨ Surprise Me
          </button>
        </div>
      </div>

      {/* 🔍 Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search for any song..."
          className="w-full bg-[#1a1a3a] border border-white/10 rounded-xl px-12 py-3 focus:outline-none focus:border-green-500 transition"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
        {searchQuery && (
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            onClick={() => setSearchQuery("")}
          >
            ✕
          </button>
        )}
      </div>

      {/* ✅ Genre Selector */}
      <div className="flex gap-2 flex-wrap pb-2 border-b border-white/5">
        <button
          onClick={() => { setGenre(null); setSearchQuery(""); }}
          className={`px-4 py-1 rounded-full text-sm capitalize transition ${
            genre === null && !searchQuery
              ? "bg-green-500 text-white"
              : "bg-[#1a1a3a] text-gray-300 hover:bg-[#2a2a5a]"
          }`}
        >
          Top Tracks
        </button>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => { setGenre(g); setSearchQuery(""); }}
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

      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {!isLoading && songs.length === 0 && (
        <p className="text-gray-400 text-center py-10 italic">No songs found...</p>
      )}

      <div className={`grid gap-4 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
        {songs.map((song) => {
          const isCurrent = currentTrack?.id === song.id;
          
          return (
            <div
              key={song.id}
              onClick={() => handlePlaySong(song)}
              className={`p-4 rounded-xl flex items-center justify-between group cursor-pointer transition-all duration-300 ${
                isCurrent 
                ? "bg-green-500/10 border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                : "bg-[#1a1a3a] border border-transparent hover:bg-[#252550] hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={song.album?.images[0]?.url}
                  alt=""
                  className="w-12 h-12 rounded"
                />
                <div>
                  <p className={`font-semibold ${isCurrent ? "text-green-400" : "text-white"}`}>
                    {song.name}
                  </p>
                  <p className="text-sm text-gray-400">{song.artists[0]?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {isCurrent && isPlaying && <Equalizer />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}