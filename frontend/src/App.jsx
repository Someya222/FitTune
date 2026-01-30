import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WorkoutGenerator from "./pages/WorkoutGenerator";
import WorkoutPlayer from "./pages/WorkoutPlayer";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generate" element={<WorkoutGenerator />} />
        <Route path="/player" element={<WorkoutPlayer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
