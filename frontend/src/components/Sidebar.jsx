import { NavLink } from "react-router-dom";
import { FaChartPie, FaBed, FaHotel, FaUsers, FaCalendarAlt } from "react-icons/fa";
export default function Sidebar() {
  const menus = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <FaChartPie />,
  },

  {
    name: "Room Management",
    path: "/rooms",
    icon: <FaBed />,
  },

  {
  name: "Available Search",
  path: "/available_rooms",
  icon: <FaBed />,
},

  {
    name: "Room Type Management",
    path: "/room-types",
    icon: <FaHotel />,
  },

  {
    name: "Guests",
    path: "/guests",
    icon: <FaUsers />,
  },

  {
    name: "Reservations",
    path: "/reservations",
    icon: <FaCalendarAlt />,
  },

  {
    name: "Users",
    path: "/user_management",
    icon: <FaCalendarAlt />,
  },
];

  return (
    <aside className="w-72 bg-[#181C2E] text-white min-h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-amber-400">
          Harbor Grand
        </h1>

        <p className="text-gray-400 text-sm">
          Hotel Management
        </p>
      </div>

      <ul className="p-4">
  {menus.map((menu) => (
    <li key={menu.name} className="mb-2">

      <NavLink
        to={menu.path}
        className={({ isActive }) =>
          `flex items-center gap-4 px-5 py-4 rounded-xl transition ${
            isActive
              ? "bg-amber-500 text-black"
              : "hover:bg-slate-800"
          }`
        }
      >
        {menu.icon}
        {menu.name}
      </NavLink>

    </li>
  ))}
</ul>
    </aside>
  );
}