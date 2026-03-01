import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function WorkoutSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/workouts/history",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const found = res.data.find(w => w._id === id);
        setWorkout(found);

      } catch (err) {
        console.error(err);
      }
    };

    fetchWorkout();
  }, [id]);

  if (!workout) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading summary...
      </div>
    );
  }

  /* 🔥 Motivational Message */
  const getMessage = () => {
    if (workout.intensityLevel === "high")
      return "Beast mode activated 🔥";
    if (workout.intensityLevel === "moderate")
      return "Solid session 💪";
    return "Nice light recovery session 🌿";
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 gap-6">
      
      <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
        Workout Summary 🎉
      </h1>

      <p className="text-gray-400 italic">{getMessage()}</p>

      {/* 📊 Summary Card */}
      <div className="bg-zinc-900 p-8 rounded-xl w-[400px] space-y-4">
        <p>Total Duration: {Math.floor(workout.totalDuration / 60)} min</p>
        <p>Total Calories: {workout.totalCalories.toFixed(2)} kcal</p>
        <p>Fatigue Score: {workout.fatigueScore.toFixed(2)}</p>
        <p>Intensity: {workout.intensityLevel}</p>
        <p>Exercises Completed: {workout.exercises.length}</p>
      </div>

      {/* 🔥 Exercise Breakdown */}
      <div className="bg-zinc-900 p-6 rounded-xl w-[400px] space-y-2">
        <h2 className="text-lg font-semibold mb-2">Exercise Breakdown</h2>

        {workout.exercises.map((ex, i) => (
          <div
            key={i}
            className="flex justify-between border-b border-zinc-700 py-1"
          >
            <span>{ex.name}</span>
            <span>{Number(ex.caloriesBurned).toFixed(2)} kcal</span>
          </div>
        ))}
      </div>

      {/* 🔘 Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700 transition"
      >
        Back to Dashboard
      </button>
    </div>
  );
}