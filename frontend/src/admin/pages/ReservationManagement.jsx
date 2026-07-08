import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddReservation from "../components/addReservation";
import {
  FaPlus,
  FaSearch,
  FaFileExport,
  FaWindowRestore,
} from "react-icons/fa";

export default function ReservationManagement() {
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [minimizedStep, setMinimizedStep] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  const loadBookings = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/reservations", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Failed to load reservations");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Checked-In":
        return "bg-green-50 text-green-700 border border-green-100 font-medium";
      case "Confirmed":
        return "bg-cyan-50 text-cyan-700 border border-cyan-100 font-medium";
      case "Reserved":
        return "bg-blue-50 text-blue-700 border border-blue-100 font-medium";
      case "Checked-Out":
        return "bg-slate-50 text-slate-500 border border-slate-100 font-medium";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-100 font-medium";
    }
  };

  const stepLabels = { 1: "Guest Info", 2: "Room & Stay", 3: "Payment" };

  const handleOpenNew = () => {
    // If there's already an in-progress (minimized) session, just restore it
    // instead of clobbering its state with a fresh form.
    if (isMinimized) {
      setIsMinimized(false);
      return;
    }
    setIsModalOpen(true);
  };

  const handleMinimize = (step) => {
    setIsMinimized(true);
    setMinimizedStep(step);
  };

  const handleContinue = () => {
    setIsMinimized(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsMinimized(false);
    setMinimizedStep(null);
  };

  const handleSaveReservation = (savedBooking) => {
    // savedBooking comes straight from the API response — already has a real id/bookingNumber
    setBookings((prev) => [savedBooking, ...prev]);
    setIsModalOpen(false);
    setIsMinimized(false);
    setMinimizedStep(null);
  };

  return (
    //form design//
    <AdminLayout>
      <div className="w-full space-y-6 p-1">

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <button className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between text-left transition hover:border-slate-300 active:scale-98">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Daily Check-Ins</p>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">14</h3>
            </div>
          </button>

          <button className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between text-left transition hover:border-slate-300 active:scale-98">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Daily Check-Outs</p>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">9</h3>
            </div>
          </button>

          <button className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between text-left transition hover:border-slate-300 active:scale-98">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">In-House Today</p>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">32</h3>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">

          <div className="flex items-center gap-3">
            <div className="relative w-[355px] h-11">
              <input
                type="text"
                placeholder="Search visible columns..."
                className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            </div>

            <div className="h-11">
              <select className="h-full w-34 px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]">
                <option>All Room Types</option>
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Executive Room</option>
                <option>Suite</option>
                <option>Villa</option>
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

            <div className="flex-1" />

            {isMinimized && (
              <div className="h-11">
                <button
                  onClick={handleContinue}
                  className="h-full px-4 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-sm font-semibold text-amber-700 flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                >
                  <FaWindowRestore className="text-amber-600 text-sm" />
                  <span>
                    Continue Reservation
                    {minimizedStep ? ` (${stepLabels[minimizedStep] || `Step ${minimizedStep}`})` : ""}
                  </span>
                </button>
              </div>
            )}

            <div className="h-11">
              <button className="h-full px-4 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 flex items-center justify-center gap-2 shadow-sm transition active:scale-95">
                <FaFileExport className="text-slate-400 text-sm" />
                <span>Export</span>
              </button>
            </div>

            <div className="h-11">
              <button
                onClick={handleOpenNew}
                className="h-full px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <FaPlus className="text-sm" />
                <span>Add New</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead>
  <tr className="text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 bg-slate-50">
    <th className="px-5 py-3.5">ID</th>
    <th className="px-5 py-3.5">Res Number</th>
    <th className="px-5 py-3.5">Guest Name</th>
    <th className="px-5 py-3.5">Guest Type</th>
    <th className="px-5 py-3.5">Room</th>
    <th className="px-5 py-3.5">Room Type</th>
    <th className="px-5 py-3.5">Check-In</th>
    <th className="px-5 py-3.5">Check-Out</th>
    <th className="px-5 py-3.5 text-center">Nights</th>
    <th className="px-5 py-3.5">Source</th>
    <th className="px-5 py-3.5 text-center">Status</th>
    <th className="px-5 py-3.5 text-right">Total Amount</th>
  </tr>
</thead>
<tbody className="divide-y divide-slate-100">
  {loading && (
    <tr><td colSpan={12} className="px-5 py-6 text-center text-slate-400">Loading reservations…</td></tr>
  )}
  {!loading && loadError && (
    <tr><td colSpan={12} className="px-5 py-6 text-center text-red-500">{loadError}</td></tr>
  )}
  {!loading && !loadError && bookings.length === 0 && (
    <tr><td colSpan={12} className="px-5 py-6 text-center text-slate-400">No reservations yet.</td></tr>
  )}
  {!loading && !loadError && bookings.map((booking) => (
    <tr key={booking.rowId} className="hover:bg-slate-50/70 transition-colors">
      <td className="px-5 py-4 text-slate-500 font-medium font-mono">{booking.id}</td>
      <td className="px-5 py-4 font-mono font-semibold text-slate-900 tracking-tight">{booking.bookingNumber}</td>
      <td className="px-5 py-4 font-medium text-slate-900">{booking.guestName}</td>
      <td className="px-5 py-4">
        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
          booking.guestType === "Primary"
            ? "bg-amber-50 text-amber-700 border border-amber-100"
            : "bg-slate-50 text-slate-500 border border-slate-100"
        }`}>
          {booking.guestType}
        </span>
      </td>
      <td className="px-5 py-4 font-mono font-medium text-slate-700">{booking.roomNumber}</td>
      <td className="px-5 py-4 text-slate-600">{booking.roomType}</td>
      <td className="px-5 py-4 font-mono text-xs text-slate-500">{booking.checkIn}</td>
      <td className="px-5 py-4 font-mono text-xs text-slate-500">{booking.checkOut}</td>
      <td className="px-5 py-4 text-center font-mono text-slate-700">{booking.nights}</td>
      <td className="px-5 py-4 text-slate-600">{booking.source}</td>
      <td className="px-5 py-4 text-center">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getStatusBadgeClass(booking.status)}`}>
          {booking.status}
        </span>
      </td>
      <td className="px-5 py-4 text-right font-mono font-semibold text-slate-900">{booking.totalAmount}</td>
    </tr>
  ))}
</tbody>
            </table>
          </div>

        </div>
      </div>

      <AddReservation
        isOpen={isModalOpen}
        isMinimized={isMinimized}
        onClose={handleCloseModal}
        onMinimize={handleMinimize}
        onSave={handleSaveReservation}
      />
    </AdminLayout>
  );
}
