import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import AddBookingModal from "../components/AddBookingModal";
import BookingDetailModal from "../components/BookingDetailModal";
import { useAuth } from "../../context/AuthContext"; // Ensure the path is correct
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaCalendarCheck,
  FaUsers,
  FaCheckCircle,
  FaTimes,
  FaSave,
  FaBan
} from "react-icons/fa";

export default function BookingManagement() {
   const auth = useAuth();

  console.log("BOOKING FULL AUTH:", auth);

  const { token } = auth;
  

  console.log("BookingManagement token:", token);
  console.log(
    "sessionStorage token:",
    sessionStorage.getItem("auth_token")
  );
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedDate, setSelectedDate] = useState(""); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editError, setEditError] = useState("");
  // NEW EDIT MODAL STATES
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);

  // Details popup
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);

  // Assign Room dropdowns (N = booking.total_room)
  const [assignedRooms, setAssignedRooms] = useState([]);
  const [availableAssignRooms, setAvailableAssignRooms] = useState([]);

  // States for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // adjust as needed

  const COLUMN_COUNT = 10;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "All Status") params.append("status", statusFilter);
      if (selectedDate) params.append("date", selectedDate);

   const res = await fetch(
 `http://localhost:8000/api/bookings?${params.toString()}`,
 {
   headers:{
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
      Accept:"application/json"
   }
 }
);
      if (!res.ok) throw new Error("Failed to load bookings");
      const json = await res.json();

      setBookings(json.data || []);
      setStats(json.stats || { total: 0, confirmed: 0, pending: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, selectedDate, token]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchBookings]);

  // Reset to page 1 whenever the search/filter criteria change,
  // so we never get stuck on a page that no longer has any rows.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedDate]);

  // Fetch candidate rooms for the Assign Room dropdowns whenever the edit
  // modal opens for a booking — filtered by the booking's room type and
  // available for its check-in/check-out range (backend also re-validates
  // at confirm time, this is just for a friendly dropdown list).
  useEffect(() => {
    if (!isEditModalOpen || !bookingToEdit) {
      setAvailableAssignRooms([]);
      setAssignedRooms([]);
      return;
    }

    let cancelled = false;
    axios
      .get("http://localhost:8000/api/rooms/available", {
        params: { check_in: bookingToEdit.checkIn, check_out: bookingToEdit.checkOut },
      })
      .then((res) => {
        if (cancelled) return;
        const filtered = (res.data.rooms || []).filter(
          (r) => r.room_type_id === bookingToEdit.room_type_id
        );
        setAvailableAssignRooms(filtered);
      })
      .catch(() => {
        if (!cancelled) setAvailableAssignRooms([]);
      });

    const n = Number(bookingToEdit.total_room) || 1;
    setAssignedRooms((prev) => {
      const seed = bookingToEdit.roomNumber ? [bookingToEdit.roomNumber] : [];
      const base = prev.length === n ? prev : Array(n).fill("");
      return base.map((v, i) => v || seed[i] || "");
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditModalOpen, bookingToEdit?.raw_id]);

  const optionsForSlot = (index) =>
    availableAssignRooms.filter(
      (r) => !assignedRooms.some((chosen, i) => i !== index && chosen === r.room_number)
    );

  // HANDLE EDIT SUBMISSION TO BACKEND
const handleEditSubmit = async (e) => {
  e.preventDefault();

  console.log("Using token from AuthContext:", token);

  if (!token) {
    setEditError("Authentication token missing. Please log in again.");
    return;
  }

  try {
    const chosenRooms = assignedRooms.filter(Boolean);
    const wantsConfirm = (bookingToEdit.status || "").toLowerCase() === "confirmed";

    if (wantsConfirm && chosenRooms.length > 0) {
      const assignRes = await fetch(
        `http://localhost:8000/api/bookings/${bookingToEdit.raw_id}/rooms`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ room_numbers: chosenRooms }),
        }
      );
      const assignJson = await assignRes.json();
      if (!assignRes.ok) {
        setEditError(assignJson.message || "Failed to assign rooms.");
        return;
      }
    }

     const res = await fetch(
 `http://localhost:8000/api/bookings/${bookingToEdit.raw_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(bookingToEdit),
      }
    );

    const json = await res.json();

    if (!res.ok) {
      setEditError(json.message || "Failed to update booking data");
      return;
    }

    setIsEditModalOpen(false);
    fetchBookings();

  } catch (err) {
    setEditError(err.message);
  }
};

  const toggleStatusFilter = (value) => {
    setStatusFilter((prev) => (prev === value ? "All Status" : value));
  };

  const statCardClass = (value) => {
    const isActive = statusFilter === value || (value === "All Status" && statusFilter === "All Status");
    return `bg-white rounded-xl border p-5 shadow-sm flex items-center justify-between text-left transition ${
      isActive ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200 hover:border-slate-300"
    }`;
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

  // Pagination derived state
  const totalPages = Math.max(1, Math.ceil(bookings.length / itemsPerPage));
  const paginatedBookings = bookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <AdminLayout>
      <div className="w-full space-y-6 p-1">

        {/* Statistics Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => toggleStatusFilter("All Status")}
            className={statCardClass("All Status")}
          >
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xl text-slate-700">
                <FaCalendarCheck />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Bookings</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">{stats.total}</h3>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleStatusFilter("Confirmed")}
            className={statCardClass("Confirmed")}
          >
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xl text-emerald-600">
                <FaCheckCircle />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Confirmed</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">{stats.confirmed}</h3>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleStatusFilter("Pending")}
            className={statCardClass("Pending")}
          >
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-xl text-amber-600">
                <FaUsers />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Tasks</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">{stats.pending}</h3>
              </div>
            </div>
          </button>
        </div>

        {/* Master Card Box Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">

          {/* Controls Horizontal Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-[355px] h-11">
              <input
                type="text"
                placeholder="Search guest name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:border-slate-400 box-border"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            </div>

            <div className="h-11">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-full w-34 px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:border-slate-400 box-border [color-scheme:light]"
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
                className="h-full px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:border-slate-400 box-border [color-scheme:light]"
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
            <table className="w-full table-fixed border-collapse text-left text-xs text-slate-600">
              <colgroup>
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "5%" }} />
              </colgroup>
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 font-medium">ID</th>
                  <th className="px-3 py-3 font-medium">First Name</th>
                  <th className="px-3 py-3 font-medium">Last Name</th>
                  <th className="px-3 py-3 font-medium">Room Type</th>
                  <th className="px-3 py-3 font-medium text-center">Adult</th>
                  <th className="px-3 py-3 font-medium text-center">Child</th>
                  <th className="px-3 py-3 font-medium">Check-In</th>
                  <th className="px-3 py-3 font-medium">Check-Out</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium text-center">Actions</th>
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

                {!loading && !error && paginatedBookings.map((booking, index) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                  <tr key={booking.raw_id || booking.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-3 font-mono font-medium text-slate-900 truncate" title={booking.id}>
                      {booking.id}
                    </td>

                    <td className="px-3 py-3 font-medium text-slate-900 truncate" title={booking.first_name}>
                      {booking.first_name}
                    </td>

                    <td className="px-3 py-3 font-medium text-slate-900 truncate" title={booking.last_name}>
                      {booking.last_name}
                    </td>

                    <td className="px-3 py-3 text-slate-700 truncate" title={booking.roomType}>
                      {booking.roomType}
                    </td>

                    <td className="px-3 py-3 text-center font-mono font-medium text-slate-700">
                      {booking.adult}
                    </td>

                    <td className="px-3 py-3 text-center font-mono font-medium text-slate-700">
                      {booking.child}
                    </td>

                    <td className="px-3 py-3 font-mono text-slate-500">
                      {booking.checkIn}
                    </td>

                    <td className="px-3 py-3 font-mono text-slate-500">
                      {booking.checkOut}
                    </td>

                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full font-medium inline-block ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex flex-col items-center justify-center">
                        {/* CHANGED: Action column now strictly renders the unified details button */}
                        <button
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition active:scale-95 w-full text-center"
                          title="Details"
                          onClick={() => {
                            setViewingBooking(booking);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && !error && bookings.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-2">
              <p className="text-xs text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1}
                –{Math.min(currentPage * itemsPerPage, bookings.length)} of {bookings.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-xs font-semibold rounded-lg border transition ${
                      page === currentPage
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* RENDER DYNAMIC POPUP EDIT OVERLAY SCREEN */}
      {isEditModalOpen && bookingToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 text-white rounded-xl w-full max-w-xl shadow-2xl shadow-black/60 overflow-hidden border border-slate-800 m-2">
            
            <div className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 p-5 shrink-0 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-0.5">
                  Management Portal
                </span>
                <h2 className="text-white text-xl font-black tracking-tight">
                  Edit Booking {bookingToEdit.id}
                </h2>
              </div>

              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-5 right-5 w-7 h-7 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>

            {editError && (
              <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 px-5 text-xs text-rose-400 font-medium tracking-wide">
                ⚠️ {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} noValidate className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">First Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-800/40 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-medium"
                    value={bookingToEdit.first_name || ""}
                    onChange={(e) => setBookingToEdit({ ...bookingToEdit, first_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-800/40 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-medium"
                    value={bookingToEdit.last_name || ""}
                    onChange={(e) => setBookingToEdit({ ...bookingToEdit, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full bg-slate-800/40 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono font-medium"
                    value={bookingToEdit.phone || ""}
                    onChange={(e) => setBookingToEdit({ ...bookingToEdit, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Status</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-slate-800/40 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition font-medium appearance-none cursor-pointer"
                      value={bookingToEdit.status || "Pending"}
                      onChange={(e) => setBookingToEdit({ ...bookingToEdit, status: e.target.value })}
                    >
                      <option value="Pending" className="bg-slate-900 text-slate-200">Select</option>
                      <option value="Confirmed" className="bg-slate-900 text-slate-200">Confirmed</option>
                      <option value="Cancelled" className="bg-slate-900 text-slate-200">Cancelled</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Assign Room{Number(bookingToEdit.total_room) > 1 ? "s" : ""} <span className="text-emerald-400 font-sans text-xs lowercase italic">({bookingToEdit.total_room || 1} needed)</span>
                </label>
                <div className="space-y-2">
                  {assignedRooms.map((val, i) => (
                    <div key={i} className="relative">
                      <select
                        value={val}
                        onChange={(e) =>
                          setAssignedRooms((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                        }
                        className="w-full bg-slate-800/40 border border-slate-700/40 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 transition font-medium appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">— Select room {i + 1} —</option>
                        {optionsForSlot(i).map((r) => (
                          <option key={r.room_number} value={r.room_number} className="bg-slate-900 text-slate-200">
                            Room {r.room_number} — Floor {r.floor}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs">
                        ▼
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 mt-6 border-t border-slate-800/40 bg-slate-950/20 -mx-5 -mb-5 p-5">
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition tracking-wide shadow-lg shadow-emerald-950/20 inline-flex items-center justify-center gap-1.5"
                >
                  <FaSave className="text-sm" /> Save Changes
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-2.5 px-6 border border-slate-700 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition inline-flex items-center justify-center gap-1.5"
                >
                  <FaBan /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGED: Passing the navigation function straight into the detail modal component */}
      <BookingDetailModal
        isOpen={isDetailModalOpen}
        booking={viewingBooking}
        onClose={() => setIsDetailModalOpen(false)}
        onNavigateToReservation={(reservationId) => {
          setIsDetailModalOpen(false);
          navigate(`/admin/reservations?highlight=${reservationId}`);
        }}
        onEdit={(b) => {
          setIsDetailModalOpen(false);
          setBookingToEdit({ ...b, raw_id: b.raw_id ?? viewingBooking?.raw_id, id: b.booking_number || b.id });
          setIsEditModalOpen(true);
        }}
      />

      <AddBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRoom={{ title: "New Suite Room" }}
        onSuccess={fetchBookings}
      />
    </AdminLayout>
  );
}