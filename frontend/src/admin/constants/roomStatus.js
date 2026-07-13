import { FaCheckCircle, FaUserFriends, FaBroom, FaBookmark, FaTools } from "react-icons/fa";

// Fixed, reserved color per room status — shared by every admin page that
// displays room status, so the mapping never drifts between them.
export const STATUS_META = {
  Available: {
    icon: FaCheckCircle,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-600",
  },
  Occupied: {
    icon: FaUserFriends,
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    dot: "bg-blue-500",
    chip: "bg-blue-50 text-blue-600",
  },
  Cleaning: {
    icon: FaBroom,
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-600",
  },
  Reserved: {
    icon: FaBookmark,
    badge: "bg-violet-50 text-violet-700 border-violet-100",
    dot: "bg-violet-500",
    chip: "bg-violet-50 text-violet-600",
  },
  Maintenance: {
    icon: FaTools,
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-600",
  },
};

export const STATUS_ORDER = ["Available", "Occupied", "Cleaning", "Reserved", "Maintenance"];

export const FALLBACK_STATUS_META = { badge: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };
