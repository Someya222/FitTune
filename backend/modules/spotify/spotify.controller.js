import * as spotifyService from "../../services/spotify.service.js";

export const login = (req, res) => {
  const scope =
    "user-read-email user-read-private streaming user-modify-playback-state user-read-playback-state user-top-read user-read-recently-played";

  const url = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.SPOTIFY_REDIRECT_URI}&scope=${encodeURIComponent(scope)}`;

  res.redirect(url);
};

export const callback = async (req, res) => {
  const code = req.query.code;

  try {
    const data = await spotifyService.getTokens(code);

    if (!data) {
      return res.status(500).send("Token fetch failed");
    }

    const access_token = data.access_token;
    const refresh_token = data.refresh_token;

    console.log("ACCESS:", access_token);
    console.log("REFRESH:", refresh_token);

    res.redirect(
      `http://localhost:5173/spotify-success?access_token=${access_token}&refresh_token=${refresh_token}`
    );
  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    res.status(500).send("Spotify auth failed");
  }
};

export const search = async (req, res) => {
  try {
    const { q } = req.query;
    const token = req.headers.authorization?.split(" ")[1];

    const songs = await spotifyService.searchSongs(q, token);

    res.json(songs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching songs" });
  }
};

export const topTracks = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const tracks = await spotifyService.getTopTracks(token);
    res.json(tracks);
  } catch (err) {
    console.error("TOP TRACKS ERROR:", err.response?.data || err.message);
    
    const status = err.response?.status || 500;
    const message = err.response?.data?.error?.message || "Error fetching top tracks";
    
    res.status(status).json({ message });
  }
};

export const recommendations = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });
    const token = authHeader.split(" ")[1];

    let tracks = [];
    
    // TIER 1: Original Seeds (Tracks/Artists/Tempo)
    try {
      console.log("⚙️ TIER 1: Attempting seeds-based recommendations...");
      tracks = await spotifyService.getRecommendations(token, req.query);
      if (tracks.length > 0) return res.json(tracks);
    } catch (err) {}

    // TIER 2: Safe Genre Seeds (Workout/Phonk)
    try {
      console.log("⚙️ TIER 2: Seeds failed. Trying safe workout genres...");
      tracks = await spotifyService.getRecommendations(token, { seed_genres: "workout,phonk", limit: 10 });
      if (tracks.length > 0) return res.json(tracks);
    } catch (err) {}

    // TIER 3: Account's Supported Genres
    try {
      console.log("⚙️ TIER 3: Safe genres failed. Fetching account-supported genres...");
      const availableGenres = await spotifyService.getAvailableGenres(token);
      if (availableGenres.length > 0) {
        // Pick top 3 available genres
        const seeds = availableGenres.slice(0, 3).join(",");
        tracks = await spotifyService.getRecommendations(token, { seed_genres: seeds, limit: 10 });
        if (tracks.length > 0) return res.json(tracks);
      }
    } catch (err) {}

    // TIER 4: Universal Artist Fallback (Daft Punk)
    try {
      console.log("⚙️ TIER 4: Everything failed. Using Universal Artist (Daft Punk)...");
      tracks = await spotifyService.getRecommendations(token, { seed_artists: "4tZvXm3pneZ9pK7Bv0sgS5", limit: 10 });
      if (tracks.length > 0) return res.json(tracks);
    } catch (err) {}

    // 🔥 TIER 5: Final Search-Based Fallback (GUARANTEED TO WORK)
    try {
      console.log("⚙️ TIER 5 (Final): Recommendations API unavailable. Using Search API as fallback...");
      const searchTerms = ["workout high energy", "HIIT workout", "phonk workout", "power workout"];
      const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      tracks = await spotifyService.searchSongs(randomTerm, token);
      if (tracks.length > 0) {
         console.log(`✅ Tier 5 Success: Found ${tracks.length} tracks using Search fallback.`);
         return res.json(tracks);
      }
    } catch (err) {
      console.error("TIER 5 SEARCH ERROR:", err.message);
    }

    res.status(404).json({ message: "Spotify is being unusually restrictive. Please try searching manually." });
  } catch (err) {
    console.error("RECOMMENDATIONS FATAL ERROR:", err.message);
    res.status(500).json({ message: "Server error during recommendations" });
  }
};

export const profile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const user = await spotifyService.getUserProfile(token);

    res.json(user);
  } catch (err) {
    console.error("PROFILE ERROR:", err.response?.data || err.message);

    if (err.response?.status === 401) {
      return res.status(401).json({ message: "Token expired or invalid" });
    }

    res.status(500).json({ message: "Error fetching profile" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
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
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
      }),
    });

    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ message: "Failed to refresh token" });
  }
};