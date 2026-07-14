import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaChevronDown, FaCog, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

// Must match sidebar paths exactly
const PAGE_TITLES = {
  "/admin/dashboard":       { name: "Dashboard",              sub: "Hotel Overview" },
  "/admin/bookings":        { name: "Bookings",               sub: "Manage all bookings" },
  "/admin/reservations":    { name: "Reservations",           sub: "Guest reservation records" },
  "/admin/guests":          { name: "Guests",                 sub: "Guest profiles & history" },
  "/admin/payments":        { name: "Payments",               sub: "Payment records & transactions" },
  "/admin/extraServices":   { name: "Extra Services",         sub: "Additional guest services" },
  "/admin/rooms":           { name: "Room Management",        sub: "Manage rooms & availability" },
  "/admin/room-types":      { name: "Room Type Management",   sub: "Room categories & pricing" },
  "/admin/user_management": { name: "User Management",        sub: "Staff accounts & permissions" },
  "/admin/restaurant":      { name: "Restaurant",             sub: "Restaurant orders & menu" },
  "/admin/settings":        { name: "Settings",               sub: "System configuration" },
};

export default function Navbar({ onMenuClick }) {
  const location                    = useLocation();
  const navigate                    = useNavigate();
  const { user, logout }            = useAuth();
  const [dropdownOpen, setDropdown] = useState(false);
  const dropdownRef                 = useRef(null);

  const page = PAGE_TITLES[location.pathname] || { name: "Dashboard", sub: "Hotel Overview" };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setDropdown(false);
    try {
      const token = sessionStorage.getItem("auth_token");
      await axios.post("/api/logout", {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // Token may already be invalid/expired server-side — fine to proceed
      // with local cleanup regardless.
    } finally {
      logout();
      navigate("/account");
    }
  };

  return (
    <div className="h-16 sm:h-20 bg-white shadow-sm flex items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">

      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger — only needed below lg, where the sidebar is off-canvas */}
        <button
          type="button"
          onClick={onMenuClick}
          title="Open menu"
          className="lg:hidden text-slate-500 hover:text-slate-800 p-2 -ml-1 rounded-lg hover:bg-slate-50 transition flex-shrink-0"
        >
          <FaBars size={18} />
        </button>

        {/* Page Title — updates based on current route */}
        <div className="min-w-0">
          <h2 className="text-base sm:text-2xl font-bold text-slate-800 truncate">{page.name}</h2>
          <p className="text-gray-500 text-xs sm:text-sm truncate hidden sm:block">{page.sub}</p>
        </div>
      </div>

      {/* User Menu */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
       <button
  type="button"
  onClick={() => setDropdown((o) => !o)}
  className="flex items-center gap-2 sm:gap-3 hover:bg-slate-50 rounded-xl px-2 sm:px-3 py-2 transition-all group"
>
          {/* Avatar */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            A
          </div>

          {/* Name & role */}
          <div className="text-left hidden sm:block">
            <p className="font-semibold text-slate-800 text-sm leading-tight">{user?.name || "System Admin"}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || "Administrator"}</p>
          </div>

          {/* Chevron */}
          <FaChevronDown
            size={11}
            className={`text-slate-400 ml-1 transition-transform duration-200 hidden sm:inline-block ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        
      {/* Dropdown */}
{dropdownOpen && (
  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden">

    {/* User info header */}
    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
      <p className="text-xs font-bold text-slate-700">
        {user?.name || "System Admin"}
      </p>

      <p className="text-[11px] text-slate-400 mt-0.5">
        {user?.email || ""}
      </p>
    </div>


    {/* Menu items */}
    <div className="p-1.5 space-y-0.5">

      <button
        type="button"
        onClick={() => {
          setDropdown(false);
          navigate("/admin/settings");
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
      >
        <FaCog size={13} className="text-slate-400" />
        Settings
      </button>

    </div>


    {/* Logout */}
    <div className="p-1.5 border-t border-slate-100">

      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
      >
        <FaSignOutAlt size={13} />
        Log Out
      </button>

    </div>

  </div>
)}
      </div>
    </div>
  );
}
