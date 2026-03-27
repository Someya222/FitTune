import axios from "axios";

const REDIRECT_URI = "http://127.0.0.1:5000/api/spotify/callback";

// 🔐 Auth URL
export const getAuthURL = () => {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;

  const scope =
    "user-read-private user-read-email user-modify-playback-state user-read-playback-state";

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

// 🔁 Get Tokens
export const getTokens = async (code) => {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
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

// 👤 Get Profile
export const getUserProfile = async (token) => {
  const res = await axios.get("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};