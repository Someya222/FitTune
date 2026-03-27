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

    const { access_token, refresh_token } = data;

    // TODO: Save in DB (next step)
    
    res.redirect(
      `http://localhost:5173/spotify-success?access_token=${access_token}`
    );
  } catch (err) {
    console.error(err);
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