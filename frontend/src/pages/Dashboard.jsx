import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-16">

      {/* HERO */}
      <div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Ready to train?
        </h1>

        {/* Accent Line */}
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mb-6" />

        <p className="text-gray-400 text-lg max-w-xl">
          AI-powered workouts synced with your music.
        </p>

        {/* Separator */}
        <div className="h-px bg-white/10 mt-10"></div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid md:grid-cols-3 gap-8">

        {/* Primary Card */}
        <div
          onClick={() => navigate("/generate")}
          className="cursor-pointer bg-gradient-to-br from-[#1a1a3a] to-[#13132e] border border-primary/40 p-6 rounded-2xl shadow-lg shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-500/30"
        >
          <h3 className="text-lg font-semibold mb-2">
            🏋 Generate Workout
          </h3>
          <p className="text-sm text-gray-400">
            Create an AI-personalized training plan.
          </p>
        </div>

        <div
          onClick={() => navigate("/progress")}
          className="cursor-pointer bg-gradient-to-br from-[#1a1a3a] to-[#13132e] border border-white/5 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-purple-500/10"
        >
          <h3 className="text-lg font-semibold mb-2">
            📊 View Progress
          </h3>
          <p className="text-sm text-gray-400">
            Track calories, streaks and stats.
          </p>
        </div>

        <div
          className="cursor-pointer bg-gradient-to-br from-[#1a1a3a] to-[#13132e] border border-white/5 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-purple-500/10"
        >
          <h3 className="text-lg font-semibold mb-2">
            🎵 Music Library
          </h3>
          <p className="text-sm text-gray-400">
            Browse playlists and workout music.
          </p>
        </div>

      </div>

      {/* TWO COLUMN ROW */}
      <div className="grid lg:grid-cols-2 gap-8">

        <div className="bg-gradient-to-br from-[#1a1a3a] to-[#13132e] border border-white/5 p-6 rounded-2xl shadow-xl">
          <h3 className="font-semibold mb-2">🎯 Daily Challenge</h3>
          <p className="text-gray-400 text-sm">
            Complete today’s challenge to boost your streak.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a3a] to-[#13132e] border border-white/5 p-6 rounded-2xl shadow-xl">
          <h3 className="font-semibold mb-2">🎵 Now Playing</h3>
          <p className="text-gray-400 text-sm">
            Spotify integration coming soon.
          </p>
        </div>

      </div>

    </div>
  );
}