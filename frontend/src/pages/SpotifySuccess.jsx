import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SpotifySuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("access_token");

    if (token) {
      localStorage.setItem("spotify_token", token);
      localStorage.setItem("spotify_connected", "true");

      navigate("/dashboard");
    }
  }, []);

  return <div>Connecting to Spotify...</div>;
}