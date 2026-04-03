import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const GOALS = [
  { value: "weight_loss", label: "Weight Loss", emoji: "🔥", color: "from-orange-500 to-red-500" },
  { value: "muscle_gain", label: "Muscle Gain", emoji: "💪", color: "from-blue-500 to-purple-500" },
  { value: "flexibility", label: "Flexibility", emoji: "🧘", color: "from-green-500 to-teal-500" },
  { value: "general_fitness", label: "General Fitness", emoji: "⚡", color: "from-yellow-500 to-orange-500" },
];

const LEVELS = [
  { value: "beginner", label: "Beginner", icon: "🌱" },
  { value: "intermediate", label: "Intermediate", icon: "🌿" },
  { value: "advanced", label: "Advanced", icon: "🌳" },
];

const DURATIONS = [
  { value: 15, label: "15 min", icon: "⚡" },
  { value: 30, label: "30 min", icon: "🕐" },
  { value: 45, label: "45 min", icon: "🕑" },
  { value: 60, label: "60 min", icon: "🕒" },
];

const EQUIPMENT_OPTIONS = [
  { value: "none", label: "No Equipment", emoji: "🤸" },
  { value: "dumbbells", label: "Dumbbells", emoji: "🏋️" },
  { value: "gym", label: "Full Gym", emoji: "🏢" },
];

const TARGET_AREAS = [
  { value: "full_body", label: "Full Body", emoji: "🧍" },
  { value: "upper_body", label: "Upper Body", emoji: "💪" },
  { value: "lower_body", label: "Lower Body", emoji: "🦵" },
  { value: "core", label: "Core", emoji: "🎯" },
];

const CATEGORY_EMOJIS = {
  cardio: "🏃", strength: "💪", yoga: "🧘", flexibility: "🤸",
  core: "🎯", warmup: "🔥", cooldown: "❄️"
};

export default function WorkoutGenerator() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState("general_fitness");
  const [fitnessLevel, setFitnessLevel] = useState("beginner");
  const [duration, setDuration] = useState(30);
  const [equipment, setEquipment] = useState("none");
  const [targetArea, setTargetArea] = useState("full_body");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Drag state
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const generateWorkout = async () => {
    try {
      setLoading(true);
      setError(null);
      setSaved(false);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/api/workout/generate`,
        { goal, fitnessLevel, duration, equipment, targetArea },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlan(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate workout");
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async () => {
    if (!plan) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/workout/save`, plan, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaved(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setSaved(true);
      } else {
        setError("Failed to save plan");
      }
    } finally {
      setSaving(false);
    }
  };

  const removeExercise = (index) => {
    if (!plan) return;
    const updated = { ...plan };
    updated.exercises = updated.exercises.filter((_, i) => i !== index);
    updated.exercises = updated.exercises.map((ex, i) => ({ ...ex, order: i + 1 }));
    setPlan(updated);
  };

  // Drag and drop handlers
  const handleDragStart = (index) => setDragIndex(index);
  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDrop = (index) => {
    if (dragIndex === null || dragIndex === index || !plan) return;
    const exercises = [...plan.exercises];
    const [moved] = exercises.splice(dragIndex, 1);
    exercises.splice(index, 0, moved);
    const reordered = exercises.map((ex, i) => ({ ...ex, order: i + 1 }));
    setPlan({ ...plan, exercises: reordered });
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const startWorkout = () => {
    if (!plan) return;
    navigate("/player", { state: { plan } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 text-transparent bg-clip-text">
            AI Workout Generator
          </h1>
          <p className="text-gray-400 text-lg">Customize your perfect workout</p>
        </div>

        {/* ─── FORM ─── */}
        {!plan && (
          <div className="space-y-8 animate-fadeIn">

            {/* Goal Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                🎯 Your Goal
              </label>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left
                      ${goal === g.value
                        ? `border-purple-500 bg-gradient-to-r ${g.color} bg-opacity-20 shadow-lg shadow-purple-500/20 scale-[1.02]`
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800"
                      }`}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <p className="mt-1 font-semibold text-sm">{g.label}</p>
                    {goal === g.value && (
                      <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Fitness Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                📊 Fitness Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setFitnessLevel(l.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 text-center
                      ${fitnessLevel === l.value
                        ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                  >
                    <span className="text-xl">{l.icon}</span>
                    <p className="mt-1 text-xs font-semibold">{l.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                ⏱️ Duration
              </label>
              <div className="grid grid-cols-4 gap-3">
                {DURATIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 text-center
                      ${duration === d.value
                        ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                  >
                    <span className="text-lg">{d.icon}</span>
                    <p className="mt-1 text-xs font-bold">{d.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                🏋️ Equipment
              </label>
              <div className="grid grid-cols-3 gap-3">
                {EQUIPMENT_OPTIONS.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => setEquipment(e.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 text-center
                      ${equipment === e.value
                        ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                  >
                    <span className="text-xl">{e.emoji}</span>
                    <p className="mt-1 text-xs font-semibold">{e.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                🎯 Target Area
              </label>
              <div className="grid grid-cols-4 gap-3">
                {TARGET_AREAS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTargetArea(t.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-300 text-center
                      ${targetArea === t.value
                        ? "border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                  >
                    <span className="text-xl">{t.emoji}</span>
                    <p className="mt-1 text-xs font-semibold">{t.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateWorkout}
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 
                bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500
                hover:from-purple-500 hover:via-pink-500 hover:to-orange-400
                hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Generating Your Workout...
                </span>
              ) : (
                "Generate Workout ✨"
              )}
            </button>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center text-red-300">
                {error}
              </div>
            )}
          </div>
        )}

        {/* ─── GENERATED PLAN ─── */}
        {plan && (
          <div className="animate-fadeIn">

            {/* Plan Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 mb-6 border border-purple-500/30">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Your Workout Plan</h2>
                  <p className="text-gray-400 text-sm">
                    {plan.exercises.length} exercises • {plan.estimatedDuration} min • ~{plan.estimatedCalories} kcal
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-purple-300">{plan.goal?.replace("_", " ")}</span>
                  <p className="text-xs text-gray-400">{plan.fitnessLevel}</p>
                </div>
              </div>
            </div>

            {/* Drag hint */}
            <p className="text-xs text-gray-500 mb-3 text-center">
              ↕ Drag to reorder • ✕ to remove exercises
            </p>

            {/* Exercise Cards */}
            <div className="space-y-3 mb-8">
              {plan.exercises.map((ex, idx) => (
                <div
                  key={`${ex.exerciseId}-${idx}`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  className={`group relative bg-gray-800/80 rounded-xl p-4 border transition-all duration-200 cursor-grab active:cursor-grabbing
                    ${dragOverIndex === idx ? "border-purple-500 bg-purple-900/30 scale-[1.02]" : "border-gray-700/50 hover:border-gray-600"}
                    ${dragIndex === idx ? "opacity-40 scale-95" : ""}
                    ${ex.isWarmup ? "border-l-4 border-l-orange-500" : ""}
                    ${ex.isCooldown ? "border-l-4 border-l-blue-500" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Order/Grab handle */}
                    <div className="flex flex-col items-center gap-1 text-gray-500">
                      <span className="text-xs">⋮⋮</span>
                      <span className="text-xs font-mono bg-gray-700 rounded px-1.5 py-0.5">
                        {ex.order}
                      </span>
                    </div>

                    {/* GIF or Emoji Fallback */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700 flex items-center justify-center">
                      {ex.gifUrl ? (
                        <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-3xl">
                          {CATEGORY_EMOJIS[ex.category] || "💪"}
                        </span>
                      )}
                    </div>

                    {/* Exercise Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate capitalize">{ex.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ex.isWarmup ? "🔥 Warmup" : ex.isCooldown ? "❄️ Cooldown" : (
                          <>
                            {ex.sets > 0 && ex.reps > 0 ? `${ex.sets} × ${ex.reps} reps` : `${ex.duration}s`}
                            {ex.restAfter > 0 && ` • ${ex.restAfter}s rest`}
                          </>
                        )}
                      </p>
                      {ex.targetMuscles?.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {ex.targetMuscles.slice(0, 3).map((m, i) => (
                            <span key={i} className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Remove button */}
                    {!ex.isWarmup && !ex.isCooldown && (
                      <button
                        onClick={() => removeExercise(idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity
                          text-gray-500 hover:text-red-400 text-lg p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={startWorkout}
                className="col-span-3 py-4 rounded-xl font-bold text-lg transition-all duration-300 
                  bg-gradient-to-r from-green-600 to-emerald-500
                  hover:from-green-500 hover:to-emerald-400
                  hover:shadow-2xl hover:shadow-green-500/30 hover:scale-[1.01]
                  active:scale-[0.98]"
              >
                Start Workout ▶
              </button>

              <button
                onClick={savePlan}
                disabled={saving || saved}
                className={`py-3 rounded-xl font-semibold text-sm transition-all duration-300
                  ${saved
                    ? "bg-green-700/30 border border-green-500/50 text-green-300"
                    : "bg-gray-800 border border-gray-600 hover:border-purple-500 hover:bg-purple-900/20"
                  } disabled:cursor-not-allowed`}
              >
                {saved ? "✓ Saved" : saving ? "Saving..." : "💾 Save Plan"}
              </button>

              <button
                onClick={() => setPlan(null)}
                className="py-3 rounded-xl font-semibold text-sm bg-gray-800 border border-gray-600
                  hover:border-orange-500 hover:bg-orange-900/20 transition-all duration-300"
              >
                ← Edit Options
              </button>

              <button
                onClick={generateWorkout}
                disabled={loading}
                className="py-3 rounded-xl font-semibold text-sm bg-gray-800 border border-gray-600
                  hover:border-pink-500 hover:bg-pink-900/20 transition-all duration-300
                  disabled:opacity-50"
              >
                {loading ? "..." : "🔄 Regenerate"}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center text-red-300">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
