import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-darkbg text-white">
      <Navbar />
      <div className="px-6 py-6">
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;