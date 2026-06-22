import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import {
  FaSearch,
  FaCalendarCheck,
  FaUsers,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
} from "react-icons/fa";

export default function BookingManagement() {
  const [bookings] = useState([
    {
      id: "BK001",
      guest: "John Smith",
      email: "john@gmail.com",
      roomType: "Deluxe Room",
      guests: 2,
      checkIn: "2026-06-25",
      checkOut: "2026-06-28",
      amount: 45,
      status: "Pending",
    },
    {
      id: "BK002",
      guest: "Emma Wilson",
      email: "emma@gmail.com",
      roomType: "Suite",
      guests: 4,
      checkIn: "2026-06-26",
      checkOut: "2026-06-30",
      amount: 90,
      status: "Confirmed",
    },
    {
      id: "BK003",
      guest: "Michael Lee",
      email: "michael@gmail.com",
      roomType: "Family Room",
      guests: 5,
      checkIn: "2026-06-27",
      checkOut: "2026-06-29",
      amount: 70,
      status: "Pending",
    },
    {
      id: "BK004",
      guest: "Sarah Brown",
      email: "sarah@gmail.com",
      roomType: "Executive Room",
      guests: 2,
      checkIn: "2026-06-29",
      checkOut: "2026-07-02",
      amount: 55,
      status: "Confirmed",
    },
  ]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700 border border-green-200";
      case "Pending":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Booking Management
          </h1>
          <p className="text-slate-500 mt-2">
            Manage hotel bookings and guest arrivals.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-6 text-white">
            <FaCalendarCheck size={24} />
            <h2 className="text-3xl font-bold mt-3">48</h2>
            <p>Total Bookings</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white">
            <FaCheckCircle size={24} />
            <h2 className="text-3xl font-bold mt-3">27</h2>
            <p>Confirmed</p>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 text-white">
            <FaUsers size={24} />
            <h2 className="text-3xl font-bold mt-3">8</h2>
            <p>Pending</p>
          </div>

          

        </div>

        {/* Search Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-wrap gap-4">

          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search booking ID, guest name..."
              className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select className="border border-slate-200 rounded-xl px-4 py-3">
            <option>All Status</option>
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Cancelled</option>
          </select>

        </div>

        {/* Booking Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4">Booking ID</th>
                  <th className="text-left px-6 py-4">Guest</th>
                  <th className="text-left px-6 py-4">Room Type</th>
                  <th className="text-left px-6 py-4">Guests</th>
                  <th className="text-left px-6 py-4">Check-In</th>
                  <th className="text-left px-6 py-4">Check-Out</th>
                  <th className="text-left px-6 py-4">Deposit</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-center px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>

                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-semibold">
                      {booking.id}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">
                          {booking.guest}
                        </p>

                        <p className="text-xs text-slate-500">
                          {booking.email}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {booking.roomType}
                    </td>

                    <td className="px-6 py-4">
                      {booking.guests}
                    </td>

                    <td className="px-6 py-4">
                      {booking.checkIn}
                    </td>

                    <td className="px-6 py-4">
                      {booking.checkOut}
                    </td>

                    <td className="px-6 py-4 font-semibold text-indigo-600">
                      ${booking.amount}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">

                        <button className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200">
                          <FaCheckCircle />
                        </button>

                        <button className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">
                          <FaTimesCircle />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}