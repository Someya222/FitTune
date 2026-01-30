import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function WorkoutGenerator() {
  const [level, setLevel] = useState("beginner");
  const [duration, setDuration] = useState(10);
  const [equipment, setEquipment] = useState("none");
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // ✅ INSIDE component

  const generateWorkout = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/workout/generate",
        { level, duration, equipment }
      );
      setWorkout(res.data);
    } catch (err) {
      alert("Failed to generate workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Generate Workout
      </h1>

      {/* Controls */}
      <div className="max-w-md mx-auto bg-gray-800 p-4 rounded-lg space-y-4">
        <div>
          <label>Fitness Level</label>
          <select
            className="w-full p-2 rounded text-black"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label>Duration (minutes)</label>
          <input
            type="number"
            className="w-full p-2 rounded text-black"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <div>
          <label>Equipment</label>
          <select
            className="w-full p-2 rounded text-black"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
          >
            <option value="none">None</option>
            <option value="dumbbells">Dumbbells</option>
            <option value="gym">Gym</option>
          </select>
        </div>

        <button
          onClick={generateWorkout}
          className="w-full bg-purple-600 py-2 rounded font-semibold"
        >
          {loading ? "Generating..." : "Generate Workout"}
        </button>
      </div>

      {/* Result */}
      {workout && (
        <div className="max-w-md mx-auto mt-6 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">
            Your Workout Plan
          </h2>

          <ul className="space-y-2">
            {workout.exercises.map((ex, index) => (
              <li
                key={index}
                className="bg-gray-700 p-2 rounded"
              >
                <strong>{index + 1}. {ex.name}</strong>
                <div className="text-sm text-gray-300">
                  {ex.category} • {ex.duration}s
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() =>
              navigate("/player", {
                state: { exercises: workout.exercises }
              })
            }
            className="w-full mt-4 bg-green-600 py-2 rounded font-semibold"
          >
            Start Workout ▶
          </button>
        </div>
      )}
    </div>
  );
}

