import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddBookingModal from "../components/AddBookingModal";
import {
  FaSearch,
  FaCalendarCheck,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedDate, setSelectedDate] = useState(""); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editError, setEditError] = useState("");
  // NEW EDIT MODAL STATES
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);

  const COLUMN_COUNT = 13;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "All Status") params.append("status", statusFilter);
      if (selectedDate) params.append("date", selectedDate);

      const res = await fetch(`http://localhost:8000/api/bookings?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load bookings");
      const json = await res.json();

      setBookings(json.data || []);
      setStats(json.stats || { total: 0, confirmed: 0, pending: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, selectedDate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchBookings]);

  // HANDLE EDIT SUBMISSION TO BACKEND
  const handleEditSubmit = async (e) => {
  e.preventDefault();
  setEditError("");
  try {
    const res = await fetch(`http://localhost:8000/api/bookings/${bookingToEdit.raw_id || bookingToEdit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(bookingToEdit),
    });

    const json = await res.json();

    if (!res.ok) {
      setEditError(json.message || "Failed to update booking data");
      return; // keep modal open so they can fix the room number
    }

    setIsEditModalOpen(false);
    fetchBookings();
  } catch (err) {
    setEditError(err.message);
  }
};

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  return (
    <AdminLayout>
      <div className="w-full space-y-6 p-1">

        {/* Statistics Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xl text-slate-700">
                <FaCalendarCheck />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Bookings</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">{stats.total}</h3>
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
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">{stats.confirmed}</h3>
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
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">{stats.pending}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Master Card Box Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">

          {/* Controls Horizontal Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-[355px] h-11">
              <input
                type="text"
                placeholder="Search booking ID, guest name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            </div>

            <div className="h-11">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-full w-34 px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]"
              >
                <option>All Status</option>
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="h-11">
              <input
                type="date"
                value={selectedDate}
                className="h-full px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]"
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {selectedDate && (
              <button
                onClick={() => setSelectedDate("")}
                className="h-11 px-3 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Clear date
              </button>
            )}
          </div>

          {/* Nested Data Table Box */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Booking ID</th>
                  <th className="px-5 py-3.5 font-medium">First Name</th>
                  <th className="px-5 py-3.5 font-medium">Last Name</th>
                  <th className="px-5 py-3.5 font-medium">Room Type</th>
                  <th className="px-5 py-3.5 font-medium">Phone</th>
                  <th className="px-5 py-3.5 font-medium text-center">Adult</th>
                  <th className="px-5 py-3.5 font-medium text-center">Child</th>
                  <th className="px-5 py-3.5 font-medium">Check-In</th>
                  <th className="px-5 py-3.5 font-medium">Check-Out</th>
                  <th className="px-5 py-3.5 font-medium">Deposit</th>
                  <th className="px-5 py-3.5 font-medium">Deposit SS</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={COLUMN_COUNT} className="px-5 py-8 text-center text-slate-400">
                      Loading bookings...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={COLUMN_COUNT} className="px-5 py-8 text-center text-rose-500">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && bookings.length === 0 && (
                  <tr>
                    <td colSpan={COLUMN_COUNT} className="px-5 py-8 text-center text-slate-400">
                      No bookings found.
                    </td>
                  </tr>
                )}

                {!loading && !error && bookings.map((booking) => (
                  <tr key={booking.raw_id || booking.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-slate-900">
                      {booking.id}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      {booking.first_name}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      {booking.last_name}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {booking.roomType}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {booking.phone}
                    </td>

                    <td className="px-5 py-4 text-center font-mono font-medium text-slate-700">
                      {booking.adult}
                    </td>

                    <td className="px-5 py-4 text-center font-mono font-medium text-slate-700">
                      {booking.child}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {booking.checkIn}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {booking.checkOut}
                    </td>

                    <td className="px-5 py-4 font-mono font-semibold text-slate-900">
                      ${parseFloat(booking.amount || 0).toFixed(2)}
                    </td>

                    <td className="px-5 py-4">
                      {booking.depositScreenshot ? (
                        <a
                          href={booking.depositScreenshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 underline text-xs font-medium"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center items-center gap-1.5">
                        <button 
                          className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-100 transition active:scale-95" 
                          title="Edit Booking"
                          onClick={() => {
                            setBookingToEdit({ ...booking });
                            setIsEditModalOpen(true);
                          }}
                        >
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

      {/* RENDER DYNAMIC POPUP EDIT OVERLAY SCREEN */}
      {isEditModalOpen && bookingToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-semibold text-slate-800">Edit Details — Booking #{bookingToEdit.id}</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>
{editError && (
  <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
    {editError}
  </p>
)}
            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">First Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={bookingToEdit.first_name || ""}
                    onChange={(e) => setBookingToEdit({ ...bookingToEdit, first_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={bookingToEdit.last_name || ""}
                    onChange={(e) => setBookingToEdit({ ...bookingToEdit, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={bookingToEdit.phone || ""}
                    onChange={(e) => setBookingToEdit({ ...bookingToEdit, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                  <select 
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={bookingToEdit.status || "Pending"}
                    onChange={(e) => setBookingToEdit({ ...bookingToEdit, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
  <label className="block text-xs font-semibold text-slate-500 mb-1">Assign Room</label>
  <input
    type="text"
    placeholder="e.g. 101"
    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
    value={bookingToEdit.room_number || ""}
    onChange={(e) => setBookingToEdit({ ...bookingToEdit, room_number: e.target.value })}
  />
</div>

              <div className="flex justify-end space-x-2.5 border-t border-slate-100 pt-4 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AddBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRoom={{ title: "New Suite Room" }}
        onSuccess={fetchBookings} 
      />
    </AdminLayout>
  );
}