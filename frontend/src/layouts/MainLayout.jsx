// MainLayout.jsx — remove MusicPlayer from here
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-[#0a0a1f] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>
        {/* ❌ removed MusicPlayer — App.jsx handles it globally */}
      </div>
    </div>
  );
}