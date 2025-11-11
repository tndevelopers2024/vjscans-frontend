import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  /** ✅ Get User Role */
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      setRole(user?.role || null);
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  /** ✅ Logout Handler */
  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/", { replace: true });
    window.location.reload();
  };

  /** ✅ Menu by Role */
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
      { name: "User Mangement", path: "/admin/users", icon: <FiUserPlus size={18} /> },
    ],

    Receptionist: [
      { name: "Dashboard", path: "/receptionist/dashboard", icon: <FiHome size={18} /> },
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

  const toggle = (name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  return (
    <aside
      className="
        w-64 h-screen flex flex-col 
        bg-gradient-to-b from-[#F6F9FF] to-[#E8F1FF]
        
        overflow-hidden
      "
    >
      {/* ✅ Logo */}
      <div className="flex items-center justify-center py-6 border-b border-white/40">
        <img
          src="/img/logo/logo.png"
          alt="VJ Scans Lab"
          className="h-12 object-contain"
        />
      </div>

      {/* ✅ Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">

        {currentMenu.map((item) => (
          <div key={item.name}>
            {/* ✅ Parent menu */}
            {item.children ? (
              <button
                onClick={() => toggle(item.name)}
                className={`
                  w-full flex items-center justify-between
                  px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all
                  ${openMenu === item.name
                    ? "bg-[#D8E8FF] text-[#1E5FAF]"
                    : "text-gray-700 hover:bg-white/80"}
                `}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`
                      flex items-center justify-center p-2 rounded-xl shadow-sm
                      transition-all
                      ${openMenu === item.name
                        ? "bg-white text-[#1E5FAF]"
                        : "bg-white text-gray-500"}
                    `}
                  >
                    {item.icon}
                  </span>

                  {item.name}
                </div>

                {openMenu === item.name ? (
                  <FiChevronDown size={15} className="text-[#1E5FAF]" />
                ) : (
                  <FiChevronRight size={15} className="text-gray-400" />
                )}
              </button>
            ) : (
              // ✅ Single menu item
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `
                    flex items-center gap-3 px-3 py-2.5 
                    rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? "bg-[#D8E8FF] text-[#1E5FAF]"
                      : "text-gray-700 hover:bg-white/80"}
                  `
                }
              >
                <span className="flex items-center justify-center p-2 rounded-xl bg-white shadow-sm text-gray-500">
                  {item.icon}
                </span>

                {item.name}
              </NavLink>
            )}

            {/* ✅ Submenu */}
            {item.children && openMenu === item.name && (
              <div className="ml-2 mt-5 space-y-1  border-gray-300/50 pl-3">
                {item.children.map((sub) => (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    className={({ isActive }) =>
                      `
                        block px-4 py-1.5 text-md  rounded-lg transition
                        ${isActive
                          ? "text-[#F28A1F] bg-[#FFF3E1]"
                          : "text-gray-500 hover:bg-[#FFF7EB] hover:text-[#F28A1F]"}
                      `
                    }
                  >
                    {sub.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ✅ Logout */}
      <div className="p-4 border-t border-white/50">
        <button
          onClick={handleLogout}
          className="
            flex items-center gap-2 
            text-red-600 hover:bg-red-50
            w-full py-2 rounded-xl transition
          "
        >
          <FiLogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
