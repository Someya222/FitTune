import { NavLink } from "react-router-dom";
import logo from "../assets/branding/logo.png"; // adjust path if needed

export default function Navbar() {
  return (
    <div className="h-20 border-b border-white/10 flex items-center justify-between px-10 bg-[#111132] shadow-lg">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-10">

        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center">
          <img
            src={logo}
            alt="FitTune Logo"
            className="h-11 w-auto object-contain"
          />
        </NavLink>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "text-white font-semibold"
                : "text-gray-400 hover:text-white transition"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/generate"
            className={({ isActive }) =>
              isActive
                ? "text-white font-semibold"
                : "text-gray-400 hover:text-white transition"
            }
          >
            Plans
          </NavLink>

          <NavLink
            to="/progress"
            className={({ isActive }) =>
              isActive
                ? "text-white font-semibold"
                : "text-gray-400 hover:text-white transition"
            }
          >
            Stats
          </NavLink>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        {/* Mini Player */}
        <div className="hidden md:flex items-center gap-3 bg-gradient-to-br from-[#1a1a3a] to-[#13132e] shadow-xl px-4 py-2 rounded-xl border border-white/10 hover:border-primary/30 transition">
          <span className="text-sm text-gray-400">No music playing</span>
          <button className="text-white hover:text-primary transition">
            ⏯
          </button>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 bg-white/20 rounded-full cursor-pointer hover:bg-white/30 transition" />

      </div>

    </div>
  );
}