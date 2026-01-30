import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl text-green-400">
        Welcome to FitTune 
      </h1>

      <button
        onClick={() => navigate("/generate")}
        className="bg-purple-600 text-white px-6 py-2 rounded"
      >
        Generate Workout
      </button>
    </div>
  );
}
