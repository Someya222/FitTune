import axios from "axios";

const REDIRECT_URI = "http://127.0.0.1:5000/api/spotify/callback";

// 🔐 Auth URL
export const getAuthURL = () => {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;

  const scope =
    "user-read-private user-read-email user-modify-playback-state user-read-playback-state user-top-read user-read-recently-played";

  return (
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope,
      redirect_uri: REDIRECT_URI,
    }).toString()
  );
};

// 🔁 Get Tokens (FIXED)
export const getTokens = async (code) => {
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID +
                ":" +
                process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("TOKEN RESPONSE:", response.data); // ✅ DEBUG

    return response.data; // ✅ IMPORTANT
  } catch (err) {
    console.error("TOKEN ERROR:", err.response?.data || err.message);
    return null; // ✅ prevents crash
  }
};

// 🔍 Search Songs
export const searchSongs = async (query, token) => {
  const response = await axios.get(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.tracks.items;
};

// 🔝 Get Top Tracks
export const getTopTracks = async (token) => {
  const response = await axios.get(
    "https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=medium_term",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.items;
};

// 🎯 Get Recommendations
export const getRecommendations = async (token, params) => {
  const { seed_genres, seed_tracks, seed_artists, target_tempo, target_energy } = params;
  
  const query = {
    limit: 10,
  };

  if (seed_genres) query.seed_genres = seed_genres;
  if (seed_tracks) query.seed_tracks = seed_tracks;
  if (seed_artists) query.seed_artists = seed_artists;
  if (target_tempo) query.target_tempo = target_tempo;
  if (target_energy) query.target_energy = target_energy;

  // Fallback if no seeds provided
  if (!query.seed_genres && !query.seed_tracks && !query.seed_artists) {
    query.seed_genres = "workout";
  }

  const queryParams = new URLSearchParams(query);

  try {
    console.log("🟢 Requesting Spotify Recommendations with query:", queryParams.toString());
    const response = await axios.get(
      `https://api.spotify.com/v1/recommendations?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.tracks || [];
  } catch (err) {
    // 🔥 Detailed logging of the ACTUAL Spotify response
    console.error("❌ SPOTIFY RECOMMENDATIONS API ERROR:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
      query: queryParams.toString()
    });
    throw err;
  }
};

// 🌈 Get Available Genre Seeds (DEBUG TOOL)
export const getAvailableGenres = async (token) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.genres || [];
  } catch (err) {
    console.error("GENRE SEED ERROR:", err.response?.data || err.message);
    return [];
  }
};

// 👤 Get Profile
export const getUserProfile = async (token) => {
  const res = await axios.get("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};