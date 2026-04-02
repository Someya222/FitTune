import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WorkoutGenerator from "./pages/WorkoutGenerator";
import WorkoutPlayer from "./pages/WorkoutPlayer";
import Progress from "./pages/Progress";
import WorkoutSummary from "./pages/WorkoutSummary";
import ProfileSetup from "./pages/ProfileSetup";
import MainLayout from "./layouts/MainLayout";
import AppLayout from "./layouts/AppLayout"
import SpotifySuccess from "./pages/SpotifySuccess";;
import MusicLibrary from "./pages/MusicLibrary";
import MusicPreferences from "./pages/MusicPreferences";
import MusicPlayer from "./components/MusicPlayer";
import { SpotifyProvider } from "./context/SpotifyContext";

function App() {
  return (
    <SpotifyProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Pages WITH Navbar */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/generate" element={<WorkoutGenerator />} />
            <Route path="/player" element={<WorkoutPlayer />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/workout-summary/:id" element={<WorkoutSummary />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/spotify-success" element={<SpotifySuccess />} />
            <Route path="/music" element={<MusicLibrary />} />
            <Route path="/music-preferences" element={<MusicPreferences />} />
          </Route>
        </Routes>

        {/* ✅ GLOBAL PLAYER (IMPORTANT) */}
        <MusicPlayer />
      </BrowserRouter>
    </SpotifyProvider>
  );
}

export default App;
