import { fetchWithAuth } from "../utils/spotifyFetch";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [plan, setPlan] = useState("Unknown");

  const handleSpotifyConnect = () => {
    window.location.href = "http://localhost:5000/api/spotify/login";
  };

   useEffect(() => {
  const token = localStorage.getItem("spotify_token");

  if (!token) {
    setIsSpotifyConnected(false);
    return;
  }

  const fetchProfile = async () => {
    try {
      const res = await fetchWithAuth(
  "http://localhost:5000/api/spotify/me"
);

      // ❌ TOKEN INVALID
      if (res.status === 401) {
        console.log("Token expired → disconnecting");

        localStorage.removeItem("spotify_token");
        localStorage.removeItem("spotify_connected");
        localStorage.removeItem("spotify_product");

        setIsSpotifyConnected(false);
        setPlan("Unknown");
        return;
      }

      const data = await res.json();

      if (data?.product) {
        localStorage.setItem("spotify_product", data.product);
        localStorage.setItem("spotify_connected", "true");

        setIsSpotifyConnected(true);
        setPlan(data.product);
      }
    } catch (err) {
      console.error("Error fetching Spotify profile", err);
      setIsSpotifyConnected(false);
    }
  };

  fetchProfile();
}, []);

  return (
    <div className="space-y-16 p-8 text-white">

      <div>
        <h1 className="text-5xl font-bold mb-4">Ready to train?</h1>

        <p className="text-gray-400">
          AI-powered workouts synced with your music.
        </p>

        {!isSpotifyConnected && (
          <button
            onClick={handleSpotifyConnect}
            className="mt-6 bg-green-500 px-6 py-2 rounded-lg"
          >
            Connect Spotify 🎵
          </button>
        )}

        <p className="mt-4 text-sm text-gray-400">
          Plan: {plan}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        <div onClick={() => navigate("/generate")} className="cursor-pointer p-6 bg-gray-800 rounded-xl">
          🏋 Generate Workout
        </div>

        <div onClick={() => navigate("/progress")} className="cursor-pointer p-6 bg-gray-800 rounded-xl">
          📊 View Progress
        </div>

        <div onClick={() => navigate("/music")} className="cursor-pointer p-6 bg-gray-800 rounded-xl">
          🎵 Music Player
        </div>

      </div>

      <div className="bg-gray-800 p-6 rounded-xl">
        <h3>🎵 Now Playing</h3>

        {isSpotifyConnected ? (
          <>
            <p className="text-green-400">Spotify Connected 🎧</p>

            <button
              onClick={() => navigate("/music")}
              className="mt-3 underline"
            >
              Open Player →
            </button>
          </>
        ) : (
          <p>Connect Spotify to start music</p>
        )}
      </div>
        <button onClick={handleSpotifyConnect}>
  {isSpotifyConnected ? "Reconnect Spotify" : "Connect Spotify"}
</button>
    </div>
  );
}