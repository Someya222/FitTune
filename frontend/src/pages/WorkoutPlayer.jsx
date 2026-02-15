import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export default function WorkoutPlayer() {
  const location = useLocation();
  const navigate = useNavigate();

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
            return REST_TIME;
          }

          /* Rest → Next Exercise */
          const nextIndex = index + 1;
          setIsResting(false);
          setIndex(nextIndex);
          speak("Next exercise");
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

  /* 💾 Save + redirect */
  useEffect(() => {
    if (!finished) return;

    const save = async () => {
      speak("Workout complete");

      try {
        await axios.post("http://localhost:5000/api/workout/save", {
          userId: localStorage.getItem("userId"),
          exercises,
          totalCalories: calculateCalories(),
          totalDuration: exercises.reduce((s, ex) => s + ex.duration, 0),
        });
      } catch (e) {
        console.error(e);
      }

      navigate("/progress");
    };

    save();
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
