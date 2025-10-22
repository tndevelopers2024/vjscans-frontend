import { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";

const Navbar = ({ title }) => {
  const [user, setUser] = useState(null);

  // 🧠 Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <header className="flex justify-between items-center bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-3 mt-2 mx-4">
      {/* Dynamic Page Title */}
      <h1 className="text-lg font-semibold text-gray-900 capitalize">
        {title || "Dashboard"}
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative bg-gray-50 p-2 rounded-full hover:bg-blue-50 transition">
          <FiBell size={20} className="text-gray-700" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* User Info */}
        <div className="text-right">
          <h3 className="text-sm font-semibold text-gray-900">
            {user?.name || "Guest User"}
          </h3>
          <p className="text-xs text-gray-500">
            {user?.role || "No Role"}
          </p>
        </div>

        {/* Circle Avatar with First Letter */}
        <div className="bg-[#6B1818] text-white w-9 h-9 rounded-full flex items-center justify-center font-semibold text-lg uppercase">
          {user?.name ? user.name.charAt(0) : "?"}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
