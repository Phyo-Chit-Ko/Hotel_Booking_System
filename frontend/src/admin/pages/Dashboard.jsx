import AdminLayout from "../layouts/AdminLayout";
import StatCard from "../../admin/components/StatCard";

import {
  FaBed,
  FaDoorOpen,
  FaUsers,
  FaCalendarCheck,
} from "react-icons/fa";

export default function Dashboard() {
  return (
    <AdminLayout>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-3xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-4xl font-bold">
          Welcome Back, Admin 👋
        </h1>

        <p className="mt-2 text-lg">
          Harbor Grand Hotel Management System
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Rooms"
          value="120"
          icon={<FaBed />}
        />

        <StatCard
          title="Available Rooms"
          value="76"
          icon={<FaDoorOpen />}
        />

        <StatCard
          title="Occupied Rooms"
          value="44"
          icon={<FaUsers />}
        />

        <StatCard
          title="Today's Bookings"
          value="18"
          icon={<FaCalendarCheck />}
        />
      </div>

      {/* Revenue & Occupancy */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            Revenue Trend
          </h3>

          <div className="h-72 rounded-xl bg-slate-100 flex items-center justify-center">
            Revenue Chart Here
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            Occupancy Rate
          </h3>

          <div className="h-72 rounded-xl bg-slate-100 flex items-center justify-center">
            Occupancy Chart
          </div>
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
        <h3 className="text-xl font-bold mb-5">
          Recent Reservations
        </h3>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-left">
                Guest
              </th>

              <th className="py-3 text-left">
                Room
              </th>

              <th className="py-3 text-left">
                Check In
              </th>

              <th className="py-3 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="py-4">
                John Doe
              </td>

              <td>301</td>

              <td>2026-06-09</td>

              <td>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Checked In
                </span>
              </td>
            </tr>

            <tr>
              <td className="py-4">
                Emma Smith
              </td>

              <td>205</td>

              <td>2026-06-10</td>

              <td>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  Reserved
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </AdminLayout>
  );
}