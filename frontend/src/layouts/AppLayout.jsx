import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0F0C29] via-[#14143c] to-[#0c0b1f] text-white">

      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] -translate-x-1/2 pointer-events-none" />

      {/* Navbar */}
      <Navbar />

      {/* Main Area */}
      <div className="flex">

        {/* Sidebar */}
        <div className="hidden lg:block w-60 border-r border-white/10">
          <Sidebar />
        </div>

        {/* Content ✅ pb-28 added so nothing hides under the player */}
        <div className="flex-1 p-8 pb-28 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}