import { useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCog, FaSignOutAlt } from "react-icons/fa";
 
// Must match sidebar paths exactly
const PAGE_TITLES = {
  "/admin/dashboard":       { name: "Dashboard",              sub: "Hotel Overview" },
  "/admin/available_rooms": { name: "Available Search",       sub: "Browse & filter available rooms" },
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
  "/admin/roomLayoutEditor":{ name: "Room Layout Editor",     sub: "Visual floor plan editor" },
};
 
export default function Navbar() {
  const location                    = useLocation();
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
 
  
  const handleLogout = () => {
    
    localStorage.clear();
    sessionStorage.clear();
 
    setDropdown(false);
 
  
    window.location.href = "/login";
  };
 
  return (
    <div className="h-20 bg-white shadow-sm flex items-center justify-between px-8">
 
      {/* Page Title — updates based on current route */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{page.name}</h2>
        <p className="text-gray-500 text-sm">{page.sub}</p>
      </div>
 
      {/* User Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdown((o) => !o)}
          className="flex items-center gap-3 hover:bg-slate-50 rounded-xl px-3 py-2 transition-all group"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            A
          </div>
 
          {/* Name & role */}
          <div className="text-left">
            <p className="font-semibold text-slate-800 text-sm leading-tight">System Admin</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
 
          {/* Chevron */}
          <FaChevronDown
            size={11}
            className={`text-slate-400 ml-1 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>
 
        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden">
 
            {/* User info header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-xs font-bold text-slate-700">System Admin</p>
              <p className="text-[11px] text-slate-400 mt-0.5">admin@harbergrand.com</p>
            </div>
 
            {/* Menu items */}
            <div className="p-1.5 space-y-0.5">
              <button
                onClick={() => { setDropdown(false); window.location.href = "/admin/settings"; }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
              >
                <FaCog size={13} className="text-slate-400" />
                Settings
              </button>
 
            </div>
 
            <div className="p-1.5 border-t border-slate-100">
              <button
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