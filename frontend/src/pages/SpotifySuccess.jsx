import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SpotifySuccess() {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken) {
      localStorage.setItem("spotify_token", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("spotify_refresh_token", refreshToken);
    }

    localStorage.setItem("spotify_connected", "true");

    navigate("/dashboard");
  }, []);

  return <div>Connecting Spotify...</div>;
}