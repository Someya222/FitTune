import * as spotifyService from "../../services/spotify.service.js";

export const login = (req, res) => {
  const scope =

    "user-read-email user-read-private streaming user-modify-playback-state user-read-playback-state";

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