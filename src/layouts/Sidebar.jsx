import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiUserPlus,
  FiClipboard,
  FiPackage,
  FiChevronRight,
  FiChevronDown,
  FiLogOut,
  FiCamera,
} from "react-icons/fi";

const Sidebar = ({ role }) => {
  const [openMenu, setOpenMenu] = useState(null);

  const handleToggle = (menuName) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  const menu = {
    Admin: [
      { name: "Dashboard", path: "/admin/dashboard", icon: <FiHome size={18} /> },
      {
        name: "Patients",
        icon: <FiUsers size={18} />,
        children: [
          { name: "All Patients", path: "/admin/patients" },
          { name: "Add Patient", path: "/admin/patients/add" },
        ],
      },
      { name: "Tests", path: "/admin/tests", icon: <FiClipboard size={18} /> },
      { name: "Packages", path: "/admin/packages", icon: <FiPackage size={18} /> },
      { name: "Scan Reports", path: "/pathologist/scanner", icon: <FiCamera size={18} /> },
      {
        name: "User Management",
        icon: <FiUserPlus size={18} />,
        children: [
          { name: "All Users", path: "/admin/users" },
          { name: "Add User", path: "/admin/users/new" },
        ],
      },
    ],

    Receptionist: [
      { name: "Dashboard", path: "/receptionist", icon: <FiHome size={18} /> },
     
      { name: "Scan Barcode", path: "/receptionist/scanner", icon: <FiCamera size={18} /> },
    ],

    Technician: [
      { name: "Dashboard", path: "/technician/dashboard", icon: <FiHome size={18} /> },
      { name: "Scan Samples", path: "/technician/scanner", icon: <FiCamera size={18} /> },
    ],

    Pathologist: [
      { name: "Dashboard", path: "/pathologist/dashboard", icon: <FiHome size={18} /> },
      
      { name: "Scan Reports", path: "/pathologist/scanner", icon: <FiCamera size={18} /> },
    ],
  };

  const currentMenu = menu[role] || [];

  return (
    <aside className="w-64 bg-white rounded-3xl shadow-md border border-gray-100 flex flex-col">
      {/* Logo Section */}
      <div className="flex items-center justify-center border-b border-gray-100 p-5">
        <img
          src="/img/logo/logo.jpg"
          alt="VJ Scans Lab"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {currentMenu.map((item) => (
          <div key={item.name} className="mb-1">
            {item.children ? (
              <button
                onClick={() => handleToggle(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  openMenu === item.name
                    ? "bg-[#E8F3FB] text-[#0961A1]"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      openMenu === item.name ? "text-[#0961A1]" : "text-gray-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {openMenu === item.name ? (
                  <FiChevronDown size={16} className="text-[#0961A1]" />
                ) : (
                  <FiChevronRight size={16} className="text-gray-400" />
                )}
              </button>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#E8F3FB] text-[#0961A1]"
                      : "hover:bg-gray-50 text-gray-600"
                  }`
                }
              >
                <span className="text-gray-500">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            )}

            {item.children && openMenu === item.name && (
              <div className="ml-6 mt-1 space-y-1 border-l border-gray-100 pl-3 animate-fadeIn">
                {item.children.map((sub) => (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition ${
                        isActive
                          ? "bg-[#FCEAD1] text-[#F98D1B]"
                          : "text-gray-500 hover:bg-[#FFF5EB] hover:text-[#F98D1B]"
                      }`
                    }
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F98D1B]"></span>
                    <span>{sub.name}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-2 text-red-500 hover:bg-red-50 w-full py-2 rounded-xl justify-center transition">
          <FiLogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
