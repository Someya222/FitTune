import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function WorkoutPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const exercises = location.state?.exercises || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercises[0]?.duration || 0);
  const [paused, setPaused] = useState(true); // Start paused
  const [isResting, setIsResting] = useState(false);
  const [started, setStarted] = useState(false);
  const REST_TIME = 10;

  // 🔊 Voice helper
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 2;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (paused) return;

    if (timeLeft === 0) {
      // Exercise finished → start rest
      if (!isResting) {
        speak("Rest time");
        setIsResting(true);
        setTimeLeft(REST_TIME);
      }
      // Rest finished → next exercise
      else {
        setIsResting(false);
        if (currentIndex < exercises.length - 1) {
          setCurrentIndex((i) => i + 1);
          setTimeLeft(exercises[currentIndex + 1].duration);
          speak("Next exercise");
        } else {
          speak("Workout complete");
        }
      }
      return;
    }

    // Countdown voice
    if (timeLeft === 3) speak("Three");
    if (timeLeft === 2) speak("Two");
    if (timeLeft === 1) speak("One");

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, paused, isResting, currentIndex, exercises]);

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <p>No workout data found.</p>
        <button
          onClick={() => navigate("/generate")}
          className="mt-4 bg-purple-600 px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentExercise = exercises[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">
        {isResting ? "Rest 🧘‍♀️" : currentExercise.name}
      </h1>

      <p className="text-gray-400">
        {isResting
          ? "Get ready for next exercise"
          : `${currentExercise.category} • ${currentExercise.duration}s`}
      </p>

      <div className="text-6xl font-bold text-green-400">
        {timeLeft}
      </div>

      <div className="flex gap-4">
        {!started ? (
          <button
            onClick={() => {
              setStarted(true);
              setPaused(false);
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

            <button
              onClick={() => {
                if (currentIndex < exercises.length - 1) {
                  setIsResting(false);
                  setCurrentIndex(currentIndex + 1);
                  setTimeLeft(exercises[currentIndex + 1].duration);
                }
              }}
              className="bg-gray-700 px-6 py-2 rounded"
            >
              Skip
            </button>
          </>
        )}
      </div>

      <p className="text-gray-500">
        Exercise {currentIndex + 1} of {exercises.length}
      </p>
    </div>
  );
}