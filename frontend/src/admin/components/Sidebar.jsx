import { NavLink } from "react-router-dom";
import { 
  FaChartPie, FaBed, FaHotel, FaUsers, FaCalendarAlt, 
  FaSearch, FaCreditCard, FaConciergeBell, FaUtensils, 
  FaUserShield, FaCog 
} from "react-icons/fa";

export default function Sidebar() {
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
    <aside className="w-72 bg-[#181C2E] text-white h-screen fixed left-0 top-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent flex flex-col">
      {/* Branding Header */}
      <div className="p-6 border-b border-slate-800 shrink-0">
        <h1 className="text-xl font-semibold text-amber-400 tracking-tight">
          Harbor Grand
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Hotel Management System
        </p>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 p-3 space-y-6">
        {menuGroups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            {/* Category Header Label */}
            <h2 className="px-4 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              {group.groupName}
            </h2>
            
            <ul>
              {group.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition text-sm font-medium ${
                        isActive
                          ? "bg-amber-500 text-slate-950"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`
                    }
                  >
                    <span className="text-base shrink-0 opacity-80">{item.icon}</span>
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}