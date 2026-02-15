import { useEffect, useState } from "react";
import axios from "axios";

export default function Progress() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = localStorage.getItem("userId");
      const res = await axios.get(
        `http://localhost:5000/api/workout/history/${userId}`
      );
      setHistory(res.data);
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Your Progress 📈</h1>

      {history.length === 0 && (
        <p>No workouts recorded yet.</p>
      )}

      {history.map((w, i) => (
        <div
          key={i}
          className="bg-gray-800 p-4 rounded mb-4"
        >
          <p>Date: {new Date(w.date).toLocaleDateString()}</p>
          <p>Calories: 🔥 {w.totalCalories}</p>
          <p>Duration: ⏱ {Math.round(w.totalDuration / 60)} min</p>
        </div>
      ))}
    </div>
  );
}
