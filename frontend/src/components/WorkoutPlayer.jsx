import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import Lottie from "lottie-react";

// ─── Lottie animation data (simple inline) ──────────────────────────
// We use CDN URLs for Lottie files, loaded dynamically per category
const LOTTIE_URLS = {
  strength: "https://lottie.host/e9d28588-ce03-4e6e-b94a-7e1a4e1e8f2a/UdPKfkkVnj.json",
  cardio: "https://lottie.host/0fb7a038-377b-4e10-89fb-e7be89bab6a0/HkSHSNbmne.json",
  yoga: "https://lottie.host/0c6e5a6e-6648-4192-b84b-89f3d6e52b13/GQXw8G6hWz.json",
  stretching: "https://lottie.host/67419267-4b8d-4f60-b87a-4f2e73e4a88a/Kba7fQWkAJ.json",
  core: "https://lottie.host/b5e23a51-2784-4a15-b903-ee8c8f0b21c5/FNm46PSYHm.json",
};

const CATEGORY_EMOJIS = {
  cardio: "🏃", strength: "💪", yoga: "🧘", flexibility: "🤸",
  core: "🎯", warmup: "🔥", cooldown: "❄️"
};

const CATEGORY_COLORS = {
  cardio: "from-orange-600 to-red-600",
  strength: "from-blue-600 to-purple-600",
  yoga: "from-green-600 to-teal-600",
  flexibility: "from-emerald-600 to-cyan-600",
  core: "from-yellow-600 to-orange-600",
  warmup: "from-amber-600 to-orange-600",
  cooldown: "from-cyan-600 to-blue-600",
};

const MOTIVATIONAL_MESSAGES = [
  "You crushed it! 🔥",
  "Beast mode activated! 💪",
  "Incredible effort! ⚡",
  "You're unstoppable! 🚀",
  "Champion performance! 🏆",
  "That was legendary! 👑",
];

export default function WorkoutPlayer() {
  const location = useLocation();
  const navigate = useNavigate();

  // Guard: no plan
  if (!location.state?.plan) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-400">No workout loaded.</p>
        <button
          onClick={() => navigate("/generate")}
          className="bg-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-500 transition"
        >
          Generate Workout
        </button>
      </div>
    );
  }

  const plan = location.state.plan;
  const exercises = plan.exercises;

  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(true);
  const [isResting, setIsResting] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lottieData, setLottieData] = useState({});

  const timerRef = useRef(null);
  const elapsedRef = useRef(null);

  const currentExercise = exercises[index];

  // ─── Voice guidance ──────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.1;
    u.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, []);

  // ─── Load Lottie animations ──────────────────────────────────────
  useEffect(() => {
    const categories = [...new Set(exercises.map(e => e.lottieCategory).filter(Boolean))];
    categories.forEach(async (cat) => {
      const url = LOTTIE_URLS[cat];
      if (!url) return;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setLottieData(prev => ({ ...prev, [cat]: json }));
        }
      } catch {
        // Silently fail — emoji fallback will be used
      }
    });
  }, [exercises]);

  // ─── Calculate exercise duration for timer ───────────────────────
  const getExerciseDuration = (ex) => {
    if (ex.isWarmup) return ex.duration || 150;
    if (ex.isCooldown) return ex.duration || 120;
    if (ex.duration > 0) return ex.duration;
    // For rep-based, estimate: sets × reps × 3 sec per rep
    return ex.sets * ex.reps * 3;
  };

  // ─── Timer logic ─────────────────────────────────────────────────
  useEffect(() => {
    if (paused || !started || finished) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Exercise finished
          if (!isResting && index === exercises.length - 1) {
            clearInterval(timerRef.current);
            setFinished(true);
            setPaused(true);
            speak("Workout complete! Great job!");
            return 0;
          }

          // Exercise → Rest
          if (!isResting) {
            const restTime = currentExercise.restAfter || 15;
            const nextEx = exercises[index + 1];
            speak(`Rest for ${restTime} seconds. Next up: ${nextEx?.name || "final exercise"}`);
            setIsResting(true);
            return restTime;
          }

          // Rest → Next Exercise
          const nextIndex = index + 1;
          const nextEx = exercises[nextIndex];
          setIsResting(false);
          setIndex(nextIndex);
          const nextDuration = getExerciseDuration(nextEx);
          const setsText = nextEx.reps > 0
            ? `${nextEx.sets} sets of ${nextEx.reps} reps`
            : `${nextDuration} seconds`;
          speak(`Starting ${nextEx.name}. ${setsText}`);
          return nextDuration;
        }

        // 5-second warning
        if (t === 6 && !isResting) {
          speak("5 seconds remaining");
        }

        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [paused, started, isResting, index, finished]);

  // ─── Elapsed time tracker ────────────────────────────────────────
  useEffect(() => {
    if (!started || finished || paused) {
      clearInterval(elapsedRef.current);
      return;
    }
    elapsedRef.current = setInterval(() => {
      setElapsedTime(t => t + 1);
    }, 1000);
    return () => clearInterval(elapsedRef.current);
  }, [started, finished, paused]);

  // ─── Controls ────────────────────────────────────────────────────
  const handleStart = () => {
    setStarted(true);
    setPaused(false);
    const dur = getExerciseDuration(exercises[0]);
    setTimeLeft(dur);
    const ex = exercises[0];
    const setsText = ex.reps > 0
      ? `${ex.sets} sets of ${ex.reps} reps`
      : `${dur} seconds`;
    speak(`Workout starting. First exercise: ${ex.name}. ${setsText}`);
  };

  const handleSkip = () => {
    if (index >= exercises.length - 1) {
      setFinished(true);
      setPaused(true);
      speak("Workout complete! Great job!");
      return;
    }
    const nextIndex = index + 1;
    setIsResting(false);
    setIndex(nextIndex);
    const dur = getExerciseDuration(exercises[nextIndex]);
    setTimeLeft(dur);
    speak(`Skipping to ${exercises[nextIndex].name}`);
  };

  const handlePrevious = () => {
    if (index <= 0) return;
    const prevIndex = index - 1;
    setIsResting(false);
    setIndex(prevIndex);
    const dur = getExerciseDuration(exercises[prevIndex]);
    setTimeLeft(dur);
    speak(`Going back to ${exercises[prevIndex].name}`);
  };

  // ─── Circular progress ──────────────────────────────────────────
  const totalDuration = getExerciseDuration(currentExercise);
  const restDuration = currentExercise?.restAfter || 15;
  const timerMax = isResting ? restDuration : totalDuration;
  const progressPercent = timerMax > 0 ? ((timerMax - timeLeft) / timerMax) * 100 : 0;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ─── FINISHED screen ────────────────────────────────────────────
  if (finished) {
    const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col items-center justify-center p-6">
        <div className="animate-bounceIn text-center max-w-md">
          <div className="text-7xl mb-6">🏆</div>
          <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Workout Complete!
          </h1>
          <p className="text-xl text-gray-300 mb-8">{msg}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700">
              <p className="text-2xl font-bold text-green-400">{formatTime(elapsedTime)}</p>
              <p className="text-xs text-gray-400 mt-1">Duration</p>
            </div>
            <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700">
              <p className="text-2xl font-bold text-orange-400">~{plan.estimatedCalories}</p>
              <p className="text-xs text-gray-400 mt-1">Calories</p>
            </div>
            <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700">
              <p className="text-2xl font-bold text-purple-400">{exercises.length}</p>
              <p className="text-xs text-gray-400 mt-1">Exercises</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/generate")}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all"
            >
              New Workout
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3 rounded-xl font-semibold bg-gray-800 border border-gray-600 hover:border-gray-500 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <style>{`
          @keyframes bounceIn {
            0% { opacity: 0; transform: scale(0.3); }
            50% { opacity: 1; transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); }
          }
          .animate-bounceIn { animation: bounceIn 0.6s ease-out; }
        `}</style>
      </div>
    );
  }

  // ─── MAIN PLAYER UI ─────────────────────────────────────────────
  const gradientColor = CATEGORY_COLORS[currentExercise?.category] || "from-purple-600 to-pink-600";
  const lottieAnim = lottieData[currentExercise?.lottieCategory];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col`}>

      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => setShowQuitModal(true)}
          className="text-gray-400 hover:text-white transition text-sm"
        >
          ✕ Quit
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            {isResting ? "Rest" : `Exercise ${index + 1} of ${exercises.length}`}
          </p>
        </div>
        <p className="text-xs text-gray-500">{formatTime(elapsedTime)}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-800">
        <div
          className={`h-full bg-gradient-to-r ${gradientColor} transition-all duration-500`}
          style={{ width: `${((index + 1) / exercises.length) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-6">

        {/* Rest screen */}
        {isResting ? (
          <div className="text-center animate-fadeIn">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Rest</p>
            <div className="relative w-52 h-52 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#1f2937" strokeWidth="8" />
                <circle
                  cx="100" cy="100" r="90" fill="none"
                  stroke="url(#restGrad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="restGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-cyan-400">{timeLeft}</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Next up:</p>
            <p className="text-xl font-bold capitalize mt-1">
              {exercises[index + 1]?.name || "Done!"}
            </p>
          </div>
        ) : (
          <>
            {/* Exercise visual */}
            <div className={`w-64 h-64 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br ${gradientColor} bg-opacity-30 shadow-2xl`}>
              {currentExercise.gifUrl ? (
                <img src={currentExercise.gifUrl} alt={currentExercise.name}
                  className="w-full h-full object-cover" loading="eager" />
              ) : lottieAnim ? (
                <Lottie animationData={lottieAnim} loop autoplay
                  style={{ width: "80%", height: "80%" }} />
              ) : (
                <span className="text-8xl">
                  {CATEGORY_EMOJIS[currentExercise.category] || "💪"}
                </span>
              )}
            </div>

            {/* Exercise name */}
            <div className="text-center">
              <h1 className="text-2xl font-extrabold capitalize">{currentExercise.name}</h1>
              <p className="text-sm text-gray-400 mt-1">
                {currentExercise.isWarmup ? "Warmup 🔥" :
                 currentExercise.isCooldown ? "Cooldown ❄️" :
                 currentExercise.reps > 0
                   ? `${currentExercise.sets} sets × ${currentExercise.reps} reps`
                   : `${getExerciseDuration(currentExercise)}s`}
              </p>
              {currentExercise.targetMuscles?.length > 0 && (
                <div className="flex gap-1 mt-2 justify-center flex-wrap">
                  {currentExercise.targetMuscles.map((m, i) => (
                    <span key={i} className="text-xs bg-white/10 rounded-full px-2 py-0.5">{m}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Circular Timer */}
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#1f2937" strokeWidth="8" />
                <circle
                  cx="100" cy="100" r="90" fill="none"
                  stroke="url(#timerGrad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold">{timeLeft}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 pb-8">
        {!started ? (
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-500
              hover:from-green-500 hover:to-emerald-400 hover:shadow-2xl hover:shadow-green-500/30
              transition-all duration-300 active:scale-[0.98]"
          >
            Start Workout 🔊
          </button>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={index === 0}
              className="w-14 h-14 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center
                hover:bg-gray-700 transition disabled:opacity-30 disabled:cursor-not-allowed text-xl"
            >
              ⏮
            </button>

            <button
              onClick={() => setPaused(!paused)}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center
                hover:from-purple-500 hover:to-pink-500 hover:shadow-2xl hover:shadow-purple-500/30
                transition-all duration-300 active:scale-95 text-3xl"
            >
              {paused ? "▶" : "⏸"}
            </button>

            <button
              onClick={handleSkip}
              className="w-14 h-14 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center
                hover:bg-gray-700 transition text-xl"
            >
              ⏭
            </button>
          </div>
        )}
      </div>

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-2">Quit Workout?</h3>
            <p className="text-gray-400 text-sm mb-6">Your progress won't be saved.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-800 border border-gray-600 font-semibold
                  hover:bg-gray-700 transition"
              >
                Continue
              </button>
              <button
                onClick={() => navigate("/generate")}
                className="flex-1 py-3 rounded-xl bg-red-600 font-semibold
                  hover:bg-red-500 transition"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
