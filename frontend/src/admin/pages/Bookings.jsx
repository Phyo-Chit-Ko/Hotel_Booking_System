import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddBookingModal from "../components/AddBookingModal"; // Adjust path based on your folder structure
import {
  FaSearch,
  FaCalendarCheck,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";

export default function BookingManagement() {
  // Helper function to get today's date in proper YYYY-MM-DD format
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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

  // Added managed state for the date input
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  // Modal Visibility State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  return (
    <AdminLayout>
      <div className="w-full space-y-6 p-1">

        {/* Statistics Panels */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xl text-slate-700">
                <FaCalendarCheck />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Bookings</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">48</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xl text-emerald-600">
                <FaCheckCircle />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Confirmed</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">27</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-xl text-amber-600">
                <FaUsers />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Tasks</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">8</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Master Card Box Container (Matches Reservation Layout) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          
          {/* Controls Horizontal Row */}
          <div className="flex items-center gap-3">
            <div className="relative w-[355px] h-11"> 
              <input
                type="text"
                placeholder="Search booking ID, guest name..."
                className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            </div>

            <div className="h-11">
              <select className="h-full w-34 px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]">
                <option>All Status</option>
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Cancelled</option>
              </select>
            </div>

            {/* Controlled Date Input Layer */}
            <div className="h-11">
              <input
                type="date"
                value={selectedDate}
                className="h-full px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]"
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  console.log("Selected Check-In Date:", e.target.value);
                }}
              />
            </div>
            <div className="h-11 ml-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="h-full px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <span>Add New</span>
              </button>
            </div>
          </div>

          {/* Nested Data Table Box */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Booking ID</th>
                  <th className="px-5 py-3.5 font-medium">Guest details</th>
                  <th className="px-5 py-3.5 font-medium">Room Type</th>
                  <th className="px-5 py-3.5 font-medium text-center">Pax</th>
                  <th className="px-5 py-3.5 font-medium">Check-In</th>
                  <th className="px-5 py-3.5 font-medium">Check-Out</th>
                  <th className="px-5 py-3.5 font-medium">Deposit</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-slate-900">
                      {booking.id}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{booking.guest}</span>
                        <span className="text-xs text-slate-400 font-mono mt-0.5">{booking.email}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {booking.roomType}
                    </td>

                    <td className="px-5 py-4 text-center font-mono font-medium text-slate-700">
                      {booking.guests}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {booking.checkIn}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {booking.checkOut}
                    </td>

                    <td className="px-5 py-4 font-mono font-semibold text-slate-900">
                      ${booking.amount.toFixed(2)}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center items-center gap-1.5">
                        <button className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-100 transition active:scale-95" title="Edit Booking">
                          Edit
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

      {/* Add Booking Modal Trigger Configuration */}
      <AddBookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedRoom={{ title: "New Suite Room" }} // Optional: Send initial room properties if needed
      />
    </AdminLayout>
  );
}