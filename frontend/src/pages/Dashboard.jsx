import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 text-white">
      <h1 className="text-3xl text-green-400 font-bold">
        Welcome to FitTune 💪
      </h1>

      <button
        onClick={() => navigate("/generate")}
        className="bg-purple-600 px-6 py-2 rounded"
      >
        Generate Workout
      </button>

      <button
        onClick={() => navigate("/progress")}
        className="bg-blue-600 px-6 py-2 rounded"
      >
        View Progress 📊
      </button><button
  onClick={() => {
    localStorage.clear();
    navigate("/");
  }}
  className="bg-red-600 px-6 py-2 rounded"
>
  Logout 🚪
</button>


    </div>
  );
}
