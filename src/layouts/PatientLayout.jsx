import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, List, FileText, User, LogOut } from "lucide-react";
import { PatientAuthAPI } from "../utils/patientApi";

const BRAND = "#1E5FAF";

export default function PatientLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    await PatientAuthAPI.logout();
    localStorage.removeItem("patientToken");
    navigate("/patient/login");
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="flex min-h-screen  bg-gradient-to-b from-[#F6F9FF] to-[#E8F1FF]">

      {/* ✅ Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 px-6 py-8 shadow-md rounded-r-3xl sticky top-0 h-screen">

        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <img src="/img/logo/logo.png" alt="Logo" className="w-44" />
        </div>

        {/* Menu */}
        <div className="flex-1 space-y-3">

          <MenuItem
            icon={<Home size={20} />}
            text="Dashboard"
            active={isActive("/patient/dashboard")}
            onClick={() => navigate("/patient/dashboard")}
          />

          <MenuItem
            icon={<List size={20} />}
            text="My Visits"
            active={isActive("/patient/visits")}
            onClick={() => navigate("/patient/visits")}
          />

          <MenuItem
            icon={<FileText size={20} />}
            text="Reports"
            active={isActive("/patient/reports")}
            onClick={() => navigate("/patient/reports")}
          />

          <MenuItem
            icon={<User size={20} />}
            text="Profile"
            active={isActive("/patient/profile")}
            onClick={() => navigate("/patient/profile")}
          />

        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center justify-center gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl font-medium hover:bg-red-100 transition shadow-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* ✅ Main Content */}
      <main className="flex-1 p-4 lg:p-10">
        {children}
      </main>

      {/* ✅ Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl rounded-t-2xl flex justify-around py-2 z-50">

        <BottomItem
          icon={<Home size={22} />}
          text="Home"
          active={isActive("dashboard")}
          onClick={() => navigate("/patient/dashboard")}
        />

        <BottomItem
          icon={<List size={22} />}
          text="Visits"
          active={isActive("visits")}
          onClick={() => navigate("/patient/visits")}
        />

        <BottomItem
          icon={<FileText size={22} />}
          text="Reports"
          active={isActive("reports")}
          onClick={() => navigate("/patient/reports")}
        />

        <BottomItem
          icon={<User size={22} />}
          text="Profile"
          active={isActive("profile")}
          onClick={() => navigate("/patient/profile")}
        />
      </nav>
    </div>
  );
}

/* ✅ Desktop Sidebar Menu Item */
function MenuItem({ icon, text, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition shadow-sm
        ${active 
          ? "bg-[#E7F0FF] text-[#1E5FAF] font-semibold shadow-md" 
          : "text-gray-700 hover:bg-gray-100"}
      `}
    >
      {icon}
      <span className="text-[15px]">{text}</span>
    </div>
  );
}

/* ✅ Mobile Bottom Navigation Item */
function BottomItem({ icon, text, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col items-center text-xs cursor-pointer transition 
        ${active ? "text-[#1E5FAF] font-semibold" : "text-gray-500"}
      `}
    >
      {icon}
      <span className="mt-1">{text}</span>
    </div>
  );
}
