import { useState, useEffect, useMemo } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddReservation from "../components/addReservation";
import RecordPayment from "../components/RecordPayment";
import MoveRoomModal from "../components/MoveRoomModal";
import ChargesLedgerModal from "../components/ChargesLedgerModal";
import EditReservationModal from "../components/EditReservationModal";
import ExtendStayModal from "../components/ExtendStayModal";
import ReservationDetailModal from "../components/ReservationDetailModal";
import {
  FaPlus,
  FaSearch,
  FaFileExport,
  FaWindowRestore,
  FaTimes,
  FaMoneyBillWave,
  FaExclamationTriangle,
} from "react-icons/fa";
import { formatCurrency } from "../../utils/currency";
import { authHeaders } from "../../utils/apiHeaders";
import Swal from "sweetalert2";

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
  const [selectedDate, setSelectedDate] = useState("");
  const TODAY = getTodayDateString();

  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomTypeFilter, setRoomTypeFilter] = useState("All Room Types");

  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);

  const [checkinReservationId, setCheckinReservationId] = useState(null);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [checkoutSaving, setCheckoutSaving] = useState(false);
  const [moveRoomBooking, setMoveRoomBooking] = useState(null);
  const [moveRoomPrefill, setMoveRoomPrefill] = useState(null);
  const [extendBooking, setExtendBooking] = useState(null);
  const [ledgerBooking, setLedgerBooking] = useState(null);
  const [ledgerMode, setLedgerMode] = useState("view");
  const [ledgerRefreshKey, setLedgerRefreshKey] = useState(0);
  const [editBooking, setEditBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState(null);

  const [apiStats, setApiStats] = useState({
    daily_check_in: { completed: 0, due: 0 },
    daily_check_out: { completed: 0, due: 0 },
    occupied_rooms: 0,
  });

  const loadBookings = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/reservations", { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load reservations");
      const data = await res.json();
      setBookings(data.bookings || []);
      if (data.stats) setApiStats(data.stats);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    fetch("/api/room-types", { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((data) => setRoomTypes(Array.isArray(data) ? data : []))
      .catch(() => setRoomTypes([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, selectedDate, searchTerm, roomTypeFilter]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Occupied":
        return "bg-green-50 text-green-700 border border-green-100 font-medium";
      case "Confirmed":
        return "bg-cyan-50 text-cyan-700 border border-cyan-100 font-medium";
      case "Reserved":
        return "bg-blue-50 text-blue-700 border border-blue-100 font-medium";
      case "Check-In":
        return "bg-amber-50 text-amber-700 border border-amber-200 font-semibold";
      case "Check-Out":
        return "bg-orange-50 text-orange-700 border border-orange-200 font-semibold";
      case "No-Show":
        return "bg-red-50 text-red-600 border border-red-100 font-semibold";
      case "Checked-Out":
        return "bg-slate-50 text-slate-500 border border-slate-100 font-medium";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-100 font-medium";
    }
  };

  const stepLabels = { 1: "Guest Info", 2: "Room & Stay", 3: "Payment" };

  const primaryBookings = useMemo(
    () => bookings.filter((b) => b.guestType === "Primary"),
    [bookings]
  );

  const isInHouseOn = (b, date) =>
    b.rawStatus === "Checked-In" && b.checkIn <= date && date <= b.checkOut;

  const isRealCheckOut = (b, date) => b.checkOut === date && b.rawStatus !== "Moved";

  // Backend-computed (see Api\ReservationController::index()'s `stats` block).
  const stats = {
    checkInDone: apiStats.daily_check_in?.completed ?? 0,
    checkInTotal: apiStats.daily_check_in?.due ?? 0,
    checkOutDone: apiStats.daily_check_out?.completed ?? 0,
    checkOutTotal: apiStats.daily_check_out?.due ?? 0,
    inHouse: apiStats.occupied_rooms ?? 0,
  };

  const filteredBookings = useMemo(() => {
    // Every guest sharing a reservation gets their own row now.
    let rows = bookings;
    const cardDate = selectedDate || TODAY;

    if (activeFilter === "checkin") {
      rows = rows.filter((b) => b.checkIn === cardDate);
    } else if (activeFilter === "checkout") {
      rows = rows.filter((b) => isRealCheckOut(b, cardDate));
    } else if (activeFilter === "inhouse") {
      rows = rows.filter((b) => isInHouseOn(b, cardDate));
    } else if (selectedDate) {
      rows = rows.filter((b) => b.checkIn === selectedDate || b.checkOut === selectedDate);
    }

    if (roomTypeFilter && roomTypeFilter !== "All Room Types") {
      rows = rows.filter((b) => b.roomType === roomTypeFilter);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      rows = rows.filter((b) =>
        [b.bookingNumber, b.sourceBookingNumber, b.guestName, b.roomNumber, b.roomType, b.source, b.status, String(b.id)]
          .some((field) => (field ?? "").toString().toLowerCase().includes(term))
      );
    }

    return rows;
  }, [primaryBookings, activeFilter, selectedDate, searchTerm, roomTypeFilter, TODAY]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const pagedBookings = useMemo(
    () => filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredBookings, page]
  );

  const handleExport = () => {
    window.print();
  };

  const toggleFilter = (key) => {
    setActiveFilter((prev) => (prev === key ? null : key));
  };

  const statCardClass = (key) =>
    `bg-white rounded-xl border p-5 shadow-sm flex items-center justify-between text-left transition focus:outline-none focus:ring-0 ${
      activeFilter === key
        ? "border-slate-400"
        : "border-slate-200 hover:border-slate-300"
    }`;

  const handleOpenNew = () => {
    if (isMinimized) {
      setIsMinimized(false);
      return;
    }
    setCheckinReservationId(null);
    setIsModalOpen(true);
  };

  const handleOpenCheckIn = (reservationId) => {
    setCheckinReservationId(reservationId);
    setIsModalOpen(true);
    setIsMinimized(false);
  };

  const handleCheckOutClick = (booking) => {
    if (booking.remainingAmount > 0) {
      setLedgerMode("checkout");
      setLedgerBooking(booking);
    } else {
      setCheckoutBooking(booking);
    }
  };

  const handleOpenLedger = (booking) => {
    setLedgerMode("view");
    setLedgerBooking(booking);
  };

  const handleCloseLedger = () => {
    setLedgerBooking(null);
    setLedgerMode("view");
  };

  const handleLedgerCheckedOut = async () => {
    setLedgerBooking(null);
    setLedgerMode("view");
    await loadBookings();
  };

  const handleEditSaved = async () => {
    setEditBooking(null);
    await loadBookings();
  };

  const handleExtended = async () => {
    setExtendBooking(null);
    await loadBookings();
  };

  const handleExtendRequiresMove = ({ reason, targetCheckOut }) => {
    const booking = extendBooking;
    setExtendBooking(null);
    setMoveRoomPrefill({ reason, targetCheckOut });
    setMoveRoomBooking(booking);
  };

  const performCheckOut = async () => {
    if (!checkoutBooking) return;
    if (checkoutBooking.remainingAmount > 0) {
      Swal.fire({
        icon: "error",
        title: "Balance not fully settled",
        text: `Cannot check out — ${formatCurrency(checkoutBooking.remainingAmount)} is still outstanding. Record the remaining payment first.`,
      });
      return;
    }
    setCheckoutSaving(true);
    try {
      const res = await fetch(`/api/reservations/${checkoutBooking.id}/check-out`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Cannot check out", text: data.message || "Failed to check out." });
        return;
      }
      setCheckoutBooking(null);
      await loadBookings();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Cannot check out", text: err.message });
    } finally {
      setCheckoutSaving(false);
    }
  };

  const handlePaymentSaved = async (updatedBooking) => {
    setPaymentBooking(null);
    await loadBookings();
    if (checkoutBooking && updatedBooking && updatedBooking.id === checkoutBooking.id) {
      setCheckoutBooking(updatedBooking);
    }
    if (ledgerBooking && updatedBooking && updatedBooking.id === ledgerBooking.id) {
      setLedgerRefreshKey((k) => k + 1);
    }
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
    setCheckinReservationId(null);
  };

  const handleSaveReservation = async () => {
    setIsModalOpen(false);
    setIsMinimized(false);
    setMinimizedStep(null);
    setCheckinReservationId(null);
    await loadBookings();
  };

  const handleRoomMoved = async () => {
    setMoveRoomBooking(null);
    setMoveRoomPrefill(null);
    await loadBookings();
  };

  return (
    <AdminLayout>
      <div className="w-full space-y-6 p-1">

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <button
            type="button"
            onClick={() => toggleFilter("checkin")}
            className={statCardClass("checkin")}
          >
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Daily Check-Ins</p>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">
                {loading ? "…" : `${stats.checkInDone}/${stats.checkInTotal}`}
              </h3>
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleFilter("checkout")}
            className={statCardClass("checkout")}
          >
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Daily Check-Outs</p>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">
                {loading ? "…" : `${stats.checkOutDone}/${stats.checkOutTotal}`}
              </h3>
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleFilter("inhouse")}
            className={statCardClass("inhouse")}
          >
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Occupied Rooms</p>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">
                {loading ? "…" : stats.inHouse}
              </h3>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">

          <div className="flex items-center gap-3">
            <div className="relative w-[355px] h-11">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search visible columns..."
                className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 box-border"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            </div>

            <div className="h-11">
              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                className="h-full w-34 px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 box-border [color-scheme:light]"
              >
                <option>All Room Types</option>
                {roomTypes.map((rt) => (
                  <option key={rt.room_type_id ?? rt.id ?? rt.name} value={rt.name}>{rt.name}</option>
                ))}
              </select>
            </div>

            <div className="h-11">
              <input
                type="date"
                value={selectedDate}
                className="h-full px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-0 focus:border-slate-300 box-border [color-scheme:light]"
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="h-11 px-3 flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition focus:outline-none focus:ring-0"
              >
                <FaTimes className="text-[10px]" />
                Clear date
              </button>
            )}

            {activeFilter && (
              <button
                type="button"
                onClick={() => setActiveFilter(null)}
                className="h-11 px-3 flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition focus:outline-none focus:ring-0"
              >
                <FaTimes className="text-[10px]" />
                Clear filter
              </button>
            )}

            <div className="flex-1" />

            {isMinimized && (
              <div className="h-11">
                <button
                  onClick={handleContinue}
                  className="h-full px-4 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-sm font-semibold text-amber-700 flex items-center justify-center gap-2 shadow-sm transition active:scale-95 focus:outline-none focus:ring-0"
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
              <button
                type="button"
                onClick={handleExport}
                className="h-full px-4 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 flex items-center justify-center gap-2 shadow-sm transition active:scale-95 focus:outline-none focus:ring-0"
              >
                <FaFileExport className="text-slate-400 text-sm" />
                <span>Export</span>
              </button>
            </div>

            <div className="h-11">
              <button
                onClick={handleOpenNew}
                className="h-full px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 focus:outline-none focus:ring-0"
              >
                <FaPlus className="text-sm" />
                <span>Add New</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full table-fixed text-left text-xs text-slate-600 border-collapse">
              <colgroup>
                <col style={{ width: "5%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "7%" }} />
              </colgroup>
              <thead>
                <tr className="text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">First Name</th>
                  <th className="px-3 py-2">Last Name</th>
                  <th className="px-3 py-2">Room</th>
                  <th className="px-3 py-2">Room Type</th>
                  <th className="px-3 py-2">Check-In</th>
                  <th className="px-3 py-2">Check-Out</th>
                  <th className="px-3 py-2 text-center">Nights</th>
                  <th className="px-3 py-2 text-center">Guests</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-center no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr><td colSpan={11} className="px-5 py-6 text-center text-slate-400">Loading reservations…</td></tr>
                )}
                {!loading && loadError && (
                  <tr><td colSpan={11} className="px-5 py-6 text-center text-red-500">{loadError}</td></tr>
                )}
                {!loading && !loadError && filteredBookings.length === 0 && (
                  <tr><td colSpan={11} className="px-5 py-6 text-center text-slate-400">
                    {bookings.length === 0 ? "No reservations yet." : "No reservations match this filter."}
                  </td></tr>
                )}
                {!loading && !loadError && pagedBookings.map((booking, index) => {
                  const [fallbackFirst, ...fallbackRest] = (booking.guestName || "").split(" ");
                  const firstName = booking.firstName || fallbackFirst || "";
                  const lastName = booking.lastName || fallbackRest.join(" ") || "";
                  return (
                  <tr key={booking.rowId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2 text-slate-500 font-medium font-mono">{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="px-3 py-2 font-medium text-slate-900 truncate" title={firstName}>{firstName}</td>
                    <td className="px-3 py-2 font-medium text-slate-900 truncate" title={lastName}>{lastName}</td>
                    <td className="px-3 py-2 font-mono font-medium text-slate-700">{booking.roomNumber}</td>
                    <td className="px-3 py-2 text-slate-600 truncate" title={booking.roomType}>{booking.roomType}</td>
                    <td className="px-3 py-2 font-mono text-slate-500">{booking.checkIn}</td>
                    <td className="px-3 py-2 font-mono text-slate-500">{booking.checkOut}</td>
                    <td className="px-3 py-2 text-center font-mono text-slate-700">{booking.nights}</td>
                    <td className="px-3 py-2 text-center font-mono text-slate-700">{booking.totalGuests}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full font-medium inline-block ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center no-print">
  <div className="flex flex-col items-center justify-center">
    <button
      onClick={() => { setDetailBooking(booking); setIsDetailOpen(true); }}
      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg transition w-full max-w-[100px] focus:outline-none focus:ring-0"
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

          {!loading && !loadError && filteredBookings.length > 0 && (
            <div className="flex items-center justify-between pt-1 no-print">
              <p className="text-xs text-slate-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredBookings.length)} of {filteredBookings.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition focus:outline-none focus:ring-0"
                >
                  Prev
                </button>
                <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition focus:outline-none focus:ring-0"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <div id="printable-reservations" className="hidden" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
        <div style={{ borderBottom: "2px solid #0f172a", paddingBottom: "10px", marginBottom: "14px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#0f172a" }}>Reservation Report</h1>
          <p style={{ fontSize: "11px", color: "#475569", margin: "4px 0 0" }}>
            {selectedDate ? `Date: ${selectedDate}` : "All Dates"}
            {roomTypeFilter && roomTypeFilter !== "All Room Types" ? ` · Room Type: ${roomTypeFilter}` : ""}
            {` · Generated ${new Date().toLocaleString()}`}
          </p>
        </div>

        <table className="w-full text-left" style={{ borderCollapse: "collapse", border: "1px solid #94a3b8", fontSize: "11px" }}>
          <thead>
            <tr style={{ backgroundColor: "#0f172a" }}>
              {["#", "Guest Name", "Room", "Room Type", "Check-In", "Check-Out", "Nights", "Guests", "Source", "Status", "Total Amount", "Balance", "Handled By"].map((label) => (
                <th key={label} style={{ border: "1px solid #94a3b8", padding: "6px 8px", fontWeight: 700, color: "#fff" }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
  {filteredBookings.map((booking, index) => (
    <tr key={booking.rowId} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f1f5f9" }}>
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", fontWeight: 600, color: "#0f172a" }}>{index + 1}</td>
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", fontWeight: 600, color: "#0f172a" }}>{booking.guestName}</td>
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", color: "#0f172a" }}>{booking.roomNumber}</td>
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", color: "#0f172a" }}>{booking.roomType}</td>
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", color: "#0f172a" }}>{booking.checkIn}</td>
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", color: "#0f172a" }}>{booking.checkOut}</td>
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", textAlign: "center", color: "#0f172a" }}>{booking.nights}</td>
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", textAlign: "center", color: "#0f172a" }}>{booking.totalGuests}</td>
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", color: "#0f172a" }}>{booking.source}</td>
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", color: "#0f172a" }}>{booking.status}</td>
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", fontWeight: 600, color: "#0f172a" }}>{booking.totalAmount}</td>
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", fontWeight: 600, color: "#0f172a" }}>
        {booking.guestType === "Primary" ? formatCurrency(booking.remainingAmount) : "—"}
      </td>
      {/* <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", color: "#0f172a" }}>{booking.comments || "—"}</td> */}
      <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", color: "#0f172a" }}>{booking.handledBy || "—"}</td>
    </tr>
  ))}
</tbody>
<tfoot>
  <tr style={{ backgroundColor: "#e2e8f0", fontWeight: 700 }}>
    <td colSpan={6} style={{ border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "right", color: "#0f172a" }}>
      Totals — {filteredBookings.filter((b) => b.guestType === "Primary").length} reservation(s)
    </td>
    <td style={{ border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center", color: "#0f172a" }}>
      {filteredBookings.filter((b) => b.guestType === "Primary").reduce((sum, b) => sum + (b.totalGuests || 0), 0)}
    </td>
    <td style={{ border: "1px solid #94a3b8", padding: "6px 8px", color: "#0f172a" }} />
    <td style={{ border: "1px solid #94a3b8", padding: "6px 8px", color: "#0f172a" }} />
    <td style={{ border: "1px solid #94a3b8", padding: "6px 8px", color: "#0f172a" }}>
      {formatCurrency(filteredBookings.filter((b) => b.guestType === "Primary").reduce((sum, b) => sum + (b.totalAmountRaw || 0), 0))}
    </td>
    <td style={{ border: "1px solid #94a3b8", padding: "6px 8px", color: "#0f172a" }}>
      {formatCurrency(filteredBookings.filter((b) => b.guestType === "Primary").reduce((sum, b) => sum + (b.remainingAmount || 0), 0))}
    </td>
    <td colSpan={2} style={{ border: "1px solid #94a3b8", padding: "6px 8px", color: "#0f172a" }} />
  </tr>
</tfoot>
        </table>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-reservations, #printable-reservations * { visibility: visible; }
          #printable-reservations { display: block !important; position: fixed; inset: 0; margin: 0; padding: 24px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <AddReservation
        isOpen={isModalOpen}
        isMinimized={isMinimized}
        mode={checkinReservationId ? "checkin" : "new"}
        reservationId={checkinReservationId}
        onClose={handleCloseModal}
        onMinimize={handleMinimize}
        onSave={handleSaveReservation}
      />

      {/* Look for this instance near the bottom of your ReservationManagement.jsx file */}
{/* <ReservationDetailModal
  isOpen={isDetailOpen}
  booking={detailBooking}
  onClose={() => setIsDetailOpen(false)}
  onRecordPayment={(b) => { setIsDetailOpen(false); setPaymentBooking(b); }}
  onEdit={(b) => { setIsDetailOpen(false); setEditBooking(b); }}
  onExtend={(b) => { setIsDetailOpen(false); setExtendBooking(b); }}
  onMoveRoom={(b) => { setIsDetailOpen(false); setMoveRoomPrefill(null); setMoveRoomBooking(b); }}
  onCheckBalance={(b) => { setIsDetailOpen(false); handleOpenLedger(b); }}
  onCheckInClick={(id) => { setIsDetailOpen(false); handleOpenCheckIn(id); }}
  onCheckOutClick={(b) => { setIsDetailOpen(false); handleCheckOutClick(b); }}
/> */}

      {paymentBooking && (
        <RecordPayment
          booking={paymentBooking}
          onClose={() => setPaymentBooking(null)}
          onSaved={handlePaymentSaved}
        />
      )}

      {moveRoomBooking && (
        <MoveRoomModal
          booking={moveRoomBooking}
          onClose={() => { setMoveRoomBooking(null); setMoveRoomPrefill(null); }}
          onMoved={handleRoomMoved}
          prefilledReason={moveRoomPrefill?.reason || ""}
          targetCheckOut={moveRoomPrefill?.targetCheckOut || null}
        />
      )}

      {ledgerBooking && (
        <ChargesLedgerModal
          booking={ledgerBooking}
          onClose={handleCloseLedger}
          onMakePayment={(b) => setPaymentBooking(b)}
          refreshKey={ledgerRefreshKey}
          mode={ledgerMode}
          onCheckedOut={handleLedgerCheckedOut}
        />
      )}

      {editBooking && (
        <EditReservationModal
          booking={editBooking}
          onClose={() => setEditBooking(null)}
          onSaved={handleEditSaved}
        />
      )}

      {extendBooking && (
        <ExtendStayModal
          booking={extendBooking}
          onClose={() => setExtendBooking(null)}
          onExtended={handleExtended}
          onRequiresMove={handleExtendRequiresMove}
        />
      )}

<ReservationDetailModal
        isOpen={isDetailOpen}
        booking={detailBooking}
        onClose={() => setIsDetailOpen(false)}
        onRecordPayment={(b) => { setPaymentBooking(b); }}
        onEdit={(b) => { setEditBooking(b); }}
        onExtend={(b) => { setExtendBooking(b); }}
        onMoveRoom={(b) => { setMoveRoomPrefill(null); setMoveRoomBooking(b); }}
        onCheckBalance={(b) => { handleOpenLedger(b); }}
        onCheckInClick={(id) => { handleOpenCheckIn(id); }}
        onCheckOutClick={(b) => { handleCheckOutClick(b); }}
      />
      {checkoutBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Confirm Check-Out</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {checkoutBooking.bookingNumber} · {checkoutBooking.guestName}
                </p>
              </div>

              {checkoutBooking.remainingAmount > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Outstanding balance: {formatCurrency(checkoutBooking.remainingAmount)}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Checkout is blocked until this guest's room charges and extra charges are
                      fully paid. Record the remaining payment to proceed.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  Balance is fully settled. Ready to check this guest out.
                </p>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {checkoutBooking.remainingAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setPaymentBooking(checkoutBooking)}
                    className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-0"
                  >
                    <FaMoneyBillWave size={12} /> Record Payment First
                  </button>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutBooking(null)}
                    disabled={checkoutSaving}
                    className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60 focus:outline-none focus:ring-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={performCheckOut}
                    disabled={checkoutSaving || checkoutBooking.remainingAmount > 0}
                    title={checkoutBooking.remainingAmount > 0 ? "Settle the outstanding balance before checking out" : undefined}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-0"
                  >
                    {checkoutSaving ? "Checking out…" : "Confirm Check-Out"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
