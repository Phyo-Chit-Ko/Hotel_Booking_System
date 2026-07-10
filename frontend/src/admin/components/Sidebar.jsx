import { NavLink, useLocation } from "react-router-dom";
import {
  FaChartPie, FaBed, FaHotel, FaUsers, FaCalendarAlt,
  FaSearch, FaCreditCard, FaConciergeBell, FaUtensils,
  FaUserShield, FaCog, FaTimes
} from "react-icons/fa";

export default function Sidebar({ isOpen = false, onClose }) {
  const location = useLocation();

  // Grouped menu structure for logical separation
  const menuGroups = [
    {
      groupName: "Overview",
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: <FaChartPie /> },
      ]
    },
    {
      groupName: "Front Desk & Operations",
      items: [
        { name: "Available Search", path: "/admin/available_rooms", icon: <FaSearch /> },
        { name: "Bookings", path: "/admin/bookings", icon: <FaCalendarAlt /> },
        { name: "Reservations", path: "/admin/reservations", icon: <FaCalendarAlt /> },
        { name: "Guests", path: "/admin/guests", icon: <FaUsers /> },
        { name: "Payments", path: "/admin/payments", icon: <FaCreditCard /> },
        { name: "Extra Services", path: "/admin/extraServices", icon: <FaConciergeBell /> },
      ]
    },
    {
      groupName: "Management & Controls",
      items: [
        { name: "Room Management", path: "/admin/rooms", icon: <FaBed /> },
        { name: "Room Type Management", path: "/admin/room-types", icon: <FaHotel /> },
        { name: "User Management", path: "/admin/user_management", icon: <FaUserShield /> },
        { name: "Restaurant", path: "/admin/restaurant", icon: <FaUtensils /> },
        { name: "RoomLayoutEditor", path: "/admin/roomLayoutEditor", icon: <FaCog /> },
      ]
    }
  ];

  return (
    <>
      {/* Mobile/tablet backdrop — only rendered (and only needed) below lg,
          where the sidebar is an off-canvas drawer instead of a fixed rail. */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-72 h-screen fixed left-0 top-0 z-50 flex flex-col
          bg-gradient-to-b from-[#1c2140] via-[#161a30] to-[#111323]
          border-r border-white/[0.06] shadow-2xl shadow-black/40
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Branding Header */}
        <div className="relative px-5 pt-6 pb-5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-white/20 shrink-0">
                <span className="text-slate-950 font-extrabold text-sm tracking-tight">HG</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-white font-bold text-[15px] tracking-tight leading-tight truncate">
                  Harbor Grand
                </h1>
                <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-[0.12em] mt-0.5">
                  Hotel Management
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              title="Close menu"
              className="lg:hidden text-slate-400 hover:text-white p-2 -mr-1 rounded-lg hover:bg-white/5 transition flex-shrink-0"
            >
              <FaTimes size={15} />
            </button>
          </div>

          {/* Accent divider */}
          <div className="mt-5 h-px bg-gradient-to-r from-amber-500/40 via-white/[0.08] to-transparent" />
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 min-h-0 px-3 pb-4 space-y-7 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {menuGroups.map((group) => (
            <div key={group.groupName}>
              {/* Category Header Label */}
              <div className="flex items-center gap-2 px-3 mb-2">
                <span className="w-3 h-px bg-slate-600" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {group.groupName}
                </h2>
              </div>

              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.name}>
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={`group relative flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 ${
                          isActive
                            ? "bg-white/[0.06] text-white"
                            : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-100"
                        }`}
                      >
                        {/* Active accent bar */}
                        <span
                          className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-amber-300 to-amber-500 transition-opacity duration-150 ${
                            isActive ? "opacity-100" : "opacity-0"
                          }`}
                        />

                        <span
                          className={`flex items-center justify-center w-8 h-8 rounded-lg text-[13px] shrink-0 transition-all duration-150 ${
                            isActive
                              ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/25"
                              : "bg-white/[0.04] text-slate-500 group-hover:bg-white/[0.07] group-hover:text-slate-200"
                          }`}
                        >
                          {item.icon}
                        </span>

                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer identity strip */}
        <div className="shrink-0 px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.03]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-200 text-xs font-semibold leading-tight truncate">System Admin</p>
              <p className="text-slate-500 text-[10px] leading-tight">Administrator</p>
            </div>
            <span className="text-[9px] font-semibold text-slate-600 tracking-wide">v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
