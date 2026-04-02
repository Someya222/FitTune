import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="h-[calc(100vh-80px)] p-6 bg-[#0f0f2b] border-r border-white/10 flex flex-col justify-between">

      {/* Top Navigation */}
      <div className="space-y-3">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-white shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`
          }
        >
          🏠 Dashboard
        </NavLink>

        <NavLink
          to="/generate"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-white shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`
          }
        >
          🏋 Plans
        </NavLink>

        <NavLink
          to="/progress"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-white shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`
          }
        >
          📊 Stats
        </NavLink>

        <NavLink
          to="/music"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-white shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`
          }
        >
          🎵 Music
        </NavLink>

        <NavLink
          to="/music-preferences"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-white shadow-md"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`
          }
        >
          ⚙️ Music Preferences
        </NavLink>

      </div>

      {/* Bottom Widget (Streak Placeholder) */}
      <div className="mt-10 p-4 rounded-2xl bg-gradient-to-br from-[#1a1a3a] to-[#13132e] border border-white/5 shadow-lg">
        <p className="text-xs text-gray-400 mb-1">Current Streak</p>
        <p className="text-lg font-semibold">🔥 5 Days</p>
      </div>

    </div>
  );
}