import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSpotify } from "../context/SpotifyContext";

export default function WorkoutPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { deviceId, playTrack, token } = useSpotify();

  /* 🚫 Guard: direct /player access */
  if (!location.state || !location.state.exercises) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <p>No workout loaded.</p>
        <button
          onClick={() => navigate("/generate")}
          className="mt-4 bg-purple-600 px-4 py-2 rounded"
        >
          Generate Workout
        </button>
      </div>
    );
  }

  const exercises = location.state.exercises;

  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(true);
  const [isResting, setIsResting] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const timerRef = useRef(null);
  const REST_TIME = 10;

  /* 🔊 Voice */
  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 2;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  /* 🔥 Calories */
  const calculateCalories = () => {
    const USER_WEIGHT = 60;
    return Math.round(
      exercises.reduce((sum, ex) => {
        const hours = ex.duration / 3600;
        return sum + ex.met * USER_WEIGHT * hours;
      }, 0)
    );
  };

  /* ⏱️ Timer */
  useEffect(() => {
    if (paused || !started || finished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t === 1) {
          /* 🔚 LAST EXERCISE → FINISH */
          if (!isResting && index === exercises.length - 1) {
            clearInterval(timerRef.current);
            setFinished(true);
            setPaused(true);
            return 0;
          }

          /* Exercise → Rest */
          if (!isResting) {
            speak("Rest time");
            setIsResting(true);
            syncMusicWithWorkoutPhase("rest");
            return REST_TIME;
          }

          /* Rest → Next Exercise */
          const nextIndex = index + 1;
          setIsResting(false);
          setIndex(nextIndex);
          speak("Next exercise");
          syncMusicWithWorkoutPhase(exercises[nextIndex].category);
          return exercises[nextIndex].duration;
        }

        if (t === 4) speak("Three");
        if (t === 3) speak("Two");
        if (t === 2) speak("One");

        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [paused, started, isResting, index, finished]);

  const syncMusicWithWorkoutPhase = async (category) => {
    if (!token || !deviceId) return;

    let targetBPM = 120;
    let targetEnergy = 0.7;

    const cat = category?.toLowerCase() || "";
    if (cat.includes("warm") || cat.includes("stretch")) {
      targetBPM = 80;
      targetEnergy = 0.4;
    } else if (cat.includes("cardio") || cat.includes("run")) {
      targetBPM = 130;
      targetEnergy = 0.7;
    } else if (cat.includes("hiit") || cat.includes("strength") || cat.includes("power")) {
      targetBPM = 160;
      targetEnergy = 0.9;
    } else if (cat.includes("cool") || cat.includes("rest") || cat.includes("yoga")) {
      targetBPM = 70;
      targetEnergy = 0.3;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/spotify/recommendations?target_tempo=${targetBPM}&target_energy=${targetEnergy}&seed_genres=workout`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      
      if (data && data.length > 0) {
        await playTrack(data.map((t) => t.uri), data[0].uri);
      }
    } catch (err) {
      console.error("Sync music error:", err);
    }
  };

  /* 💾 Save + redirect */
useEffect(() => {
  if (!finished) return;

  const save = async () => {
    try {
      speak("Workout complete");
      syncMusicWithWorkoutPhase("cool down");

      const token = localStorage.getItem("token");

      const res = await axios.post(
  "http://localhost:5000/api/workouts/complete",
  { exercises },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

// redirect using workout ID
navigate(`/workout-summary/${res.data._id}`);

    } catch (e) {
      console.error(e);
    }
  };

  save();   // ✅ Call it here

}, [finished]);
  const currentExercise = exercises[index];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">
        {finished
          ? "Workout Complete 🎉"
          : isResting
          ? "Rest 🧘‍♀️"
          : currentExercise.name}
      </h1>

      <p className="text-gray-400">
        {finished
          ? "Saving workout..."
          : isResting
          ? "Get ready for next exercise"
          : `${currentExercise.category} • ${currentExercise.duration}s`}
      </p>

      <div className="text-6xl font-bold text-green-400">{timeLeft}</div>

      <div className="flex gap-4">
        {!started ? (
          <button
            onClick={() => {
              setStarted(true);
              setPaused(false);
              setTimeLeft(exercises[0].duration);
              speak("Workout starting");
            }}
            className="bg-green-600 px-8 py-3 rounded text-xl"
          >
            Start Workout 🔊
          </button>
        ) : (
          <>
            <button
              onClick={() => setPaused(!paused)}
              className="bg-purple-600 px-6 py-2 rounded"
            >
              {paused ? "Resume" : "Pause"}
            </button>
          </>
        )}
      </div>

      <p className="text-gray-500">
        Exercise {index + 1} of {exercises.length}
      </p>
    </div>
  );
}
