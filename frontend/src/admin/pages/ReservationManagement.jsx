import { useState, useEffect, useMemo } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddReservation from "../components/AddReservation";
import RecordPayment from "../components/RecordPayment";
import MoveRoomModal from "../components/MoveRoomModal";
import ChargesLedgerModal from "../components/ChargesLedgerModal";
import EditReservationModal from "../components/EditReservationModal";
import ExtendStayModal from "../components/ExtendStayModal";
import {
  FaPlus,
  FaSearch,
  FaFileExport,
  FaWindowRestore,
  FaTimes,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCalendarPlus,
  FaExchangeAlt,
  FaWallet,
  FaEdit,
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

  // Which of the 3 stat cards is currently driving the table below it.
  // null = no filter, show everything (still subject to search).
  const [activeFilter, setActiveFilter] = useState(null); // "checkin" | "checkout" | "inhouse" | null
  const [searchTerm, setSearchTerm] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomTypeFilter, setRoomTypeFilter] = useState("All Room Types");

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  // Which reservation is being checked in, if any. Presence of this id
  // switches AddReservation into "checkin" mode with prefilled data.
  const [checkinReservationId, setCheckinReservationId] = useState(null);

  // Booking row currently open in the standalone Record Payment modal.
  // Independent of check-in — can be opened from any row, any status.
  const [paymentBooking, setPaymentBooking] = useState(null);

  // Booking row currently being confirmed for check-out. We route
  // check-out through a confirm modal (instead of window.confirm) so we
  // can surface an outstanding balance warning and offer to collect
  // payment before the guest actually leaves.
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [checkoutSaving, setCheckoutSaving] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Booking row currently open in the Move Room modal, plus an optional
  // prefill ({ reason, targetCheckOut }) when it was opened as a fallback
  // from an Extend Stay that found the current room unavailable.
  const [moveRoomBooking, setMoveRoomBooking] = useState(null);
  const [moveRoomPrefill, setMoveRoomPrefill] = useState(null);

  // Booking row currently open in the Extend Stay modal.
  const [extendBooking, setExtendBooking] = useState(null);

  // Booking row currently open in the Check Balance (charges ledger) modal.
  // ledgerMode "checkout" additionally shows the "Check Out Anyway" control
  // — used when Check-Out is clicked with an outstanding balance instead of
  // the plain confirm dialog below. ledgerRefreshKey is bumped to force a
  // refetch after a payment is recorded from inside the modal.
  const [ledgerBooking, setLedgerBooking] = useState(null);
  const [ledgerMode, setLedgerMode] = useState("view");
  const [ledgerRefreshKey, setLedgerRefreshKey] = useState(0);

  // Booking row currently open in the Edit modal (name/phone/special
  // requests only — deliberately separate from Extend Stay / Move Room).
  const [editBooking, setEditBooking] = useState(null);

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

  useEffect(() => {
    fetch("/api/room-types", { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((data) => setRoomTypes(Array.isArray(data) ? data : []))
      .catch(() => setRoomTypes([]));
  }, []);

  // Reset to page 1 whenever the visible set of rows would change shape.
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
      case "No-Show":
        return "bg-red-50 text-red-600 border border-red-100 font-semibold";
      case "Checked-Out":
        return "bg-slate-50 text-slate-500 border border-slate-100 font-medium";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-100 font-medium";
    }
  };

  const stepLabels = { 1: "Guest Info", 2: "Room & Stay", 3: "Payment" };

  // ── Derived data: stats + filtering ──────────────────────────────────
  // Each reservation can produce multiple rows (primary + additional
  // guests) but they all share the same checkIn/checkOut/rawStatus, so
  // for counting *reservations* we only look at the "Primary" row.
  const primaryBookings = useMemo(
    () => bookings.filter((b) => b.guestType === "Primary"),
    [bookings]
  );

  const isInHouseOn = (b, date) =>
    b.rawStatus === "Checked-In" && b.checkIn <= date && date <= b.checkOut;

  // A reservation that got moved to a different room shows check_out_date
  // shortened to the move date, but the guest didn't actually leave — it
  // just continues under the new reservation. Exclude "Moved" here so it
  // doesn't inflate Daily Check-Outs.
  const isRealCheckOut = (b, date) => b.checkOut === date && b.rawStatus !== "Moved";

  // A reservation "has checked in" once its status is Checked-In or beyond
  // (Checked-Out/Moved both imply the guest did check in at some point).
  const hasCheckedIn = (b) => ["Checked-In", "Checked-Out", "Moved"].includes(b.rawStatus);

  const stats = useMemo(() => {
    const checkInTotal = primaryBookings.filter((b) => b.checkIn === selectedDate).length;
    const checkInDone = primaryBookings.filter((b) => b.checkIn === selectedDate && hasCheckedIn(b)).length;
    const checkOutTotal = primaryBookings.filter((b) => isRealCheckOut(b, selectedDate)).length;
    const checkOutDone = primaryBookings.filter((b) => isRealCheckOut(b, selectedDate) && b.rawStatus === "Checked-Out").length;
    const inHouse = primaryBookings.filter((b) => isInHouseOn(b, selectedDate)).length;
    return { checkInDone, checkInTotal, checkOutDone, checkOutTotal, inHouse };
  }, [primaryBookings, selectedDate]);

  const filteredBookings = useMemo(() => {
    let rows = bookings;

    if (activeFilter === "checkin") {
      rows = rows.filter((b) => b.checkIn === selectedDate);
    } else if (activeFilter === "checkout") {
      rows = rows.filter((b) => isRealCheckOut(b, selectedDate));
    } else if (activeFilter === "inhouse") {
      rows = rows.filter((b) => isInHouseOn(b, selectedDate));
    } else if (selectedDate) {
      // No stat card active — the date picker still filters the table on its
      // own, to any reservation whose check-in OR check-out falls on this date.
      rows = rows.filter((b) => b.checkIn === selectedDate || b.checkOut === selectedDate);
    }

    if (roomTypeFilter && roomTypeFilter !== "All Room Types") {
      rows = rows.filter((b) => b.roomType === roomTypeFilter);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      rows = rows.filter((b) =>
        [b.bookingNumber, b.guestName, b.roomNumber, b.roomType, b.source, b.status, String(b.id)]
          .some((field) => (field ?? "").toString().toLowerCase().includes(term))
      );
    }

    return rows;
  }, [bookings, activeFilter, selectedDate, searchTerm, roomTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const pagedBookings = useMemo(
    () => filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredBookings, page]
  );

  // Print all rows matching the current filters (search/date/room type),
  // ignoring on-screen pagination — same convention as InvoiceView.jsx's
  // window.print()-based export, no PDF/Excel library involved.
  const handleExport = () => {
    window.print();
  };

  const toggleFilter = (key) => {
    setActiveFilter((prev) => (prev === key ? null : key));
  };

  const statCardClass = (key) =>
    `bg-white rounded-xl border p-5 shadow-sm flex items-center justify-between text-left transition active:scale-98 ${
      activeFilter === key
        ? "border-amber-400 ring-2 ring-amber-200"
        : "border-slate-200 hover:border-slate-300"
    }`;

  // ── Reservation modal handlers ───────────────────────────────────────

  const handleOpenNew = () => {
    // If there's already an in-progress (minimized) session, just restore it
    // instead of clobbering its state with a fresh form.
    if (isMinimized) {
      setIsMinimized(false);
      return;
    }
    setCheckinReservationId(null); // ensure this is a fresh "new" reservation, not check-in mode
    setIsModalOpen(true);
  };

  const handleOpenCheckIn = (reservationId) => {
    setCheckinReservationId(reservationId);
    setIsModalOpen(true);
    setIsMinimized(false);
  };

  // Opens the checkout confirm modal instead of checking out immediately,
  // so we get a chance to show the outstanding balance first. If there IS
  // a balance, route through the Check Balance modal instead (so staff can
  // pay it down or explicitly override with a reason) rather than the
  // plain confirm dialog, which stays for the already-settled case.
  const handleCheckOutClick = (booking) => {
    setCheckoutError("");
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

  // Extend Stay found the current room unavailable for the extra nights —
  // hand off to Move Room, prefilled so completing it delivers the
  // extension in the new room instead of dead-ending on an error.
  const handleExtendRequiresMove = ({ reason, targetCheckOut }) => {
    const booking = extendBooking;
    setExtendBooking(null);
    setMoveRoomPrefill({ reason, targetCheckOut });
    setMoveRoomBooking(booking);
  };

  const performCheckOut = async () => {
    if (!checkoutBooking) return;
    setCheckoutSaving(true);
    setCheckoutError("");
    try {
      const res = await fetch(`/api/reservations/${checkoutBooking.id}/check-out`, {
        method: "PATCH",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to check out");
      setCheckoutBooking(null);
      await loadBookings();
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutSaving(false);
    }
  };

  // After a payment is recorded from the checkout confirm modal or the
  // Check Balance modal, refresh the balance shown there instead of closing
  // it, so staff can see it hit $0 and then check out in the same flow.
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
    // A reservation can now render as multiple rows (primary + additional
    // guests), and check-in/check-out change status server-side, so a
    // simple local prepend/patch won't reliably cover every case — just
    // refetch the full list.
    setIsModalOpen(false);
    setIsMinimized(false);
    setMinimizedStep(null);
    setCheckinReservationId(null);
    await loadBookings();
  };

  // After a room move succeeds, close the modal and refresh the table
  // so room/roomType/charges reflect the new assignment everywhere.
  const handleRoomMoved = async () => {
    setMoveRoomBooking(null);
    setMoveRoomPrefill(null);
    await loadBookings();
  };

  return (
    //form design//
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
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">In-House Today</p>
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
                className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            </div>

            <div className="h-11">
              <select
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                className="h-full w-34 px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]"
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
                className="h-full px-4 border border-slate-300 rounded-xl text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border [color-scheme:light]"
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {activeFilter && (
              <button
                type="button"
                onClick={() => setActiveFilter(null)}
                className="h-11 px-3 flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition"
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
              <button
                type="button"
                onClick={handleExport}
                className="h-full px-4 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
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
                  <th className="px-5 py-2">ID</th>
                  <th className="px-5 py-2">Guest Name</th>
                  <th className="px-5 py-2">Guest Type</th>
                  <th className="px-5 py-2">Room</th>
                  <th className="px-5 py-2">Room Type</th>
                  <th className="px-5 py-2">Check-In</th>
                  <th className="px-5 py-2">Check-Out</th>
                  <th className="px-5 py-2 text-center">Nights</th>
                  <th className="px-5 py-2 text-center">Guests</th>
                  <th className="px-5 py-2">Source</th>
                  <th className="px-5 py-2 text-center">Status</th>
                  <th className="px-5 py-2 text-right">Total Amount</th>
                  <th className="px-5 py-2 text-right">Balance</th>
                  <th className="px-5 py-2">Handled By</th>
                  <th className="px-5 py-2 text-center no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr><td colSpan={15} className="px-5 py-6 text-center text-slate-400">Loading reservations…</td></tr>
                )}
                {!loading && loadError && (
                  <tr><td colSpan={15} className="px-5 py-6 text-center text-red-500">{loadError}</td></tr>
                )}
                {!loading && !loadError && filteredBookings.length === 0 && (
                  <tr><td colSpan={15} className="px-5 py-6 text-center text-slate-400">
                    {bookings.length === 0 ? "No reservations yet." : "No reservations match this filter."}
                  </td></tr>
                )}
                {!loading && !loadError && pagedBookings.map((booking, index) => (
                  <tr key={booking.rowId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-2 text-slate-500 font-medium font-mono">{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="px-5 py-2 font-medium text-slate-900">{booking.guestName}</td>
                    <td className="px-5 py-2">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        booking.guestType === "Primary"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-slate-50 text-slate-500 border border-slate-100"
                      }`}>
                        {booking.guestType}
                      </span>
                    </td>
                    <td className="px-5 py-2 font-mono font-medium text-slate-700">{booking.roomNumber}</td>
                    <td className="px-5 py-2 text-slate-600">{booking.roomType}</td>
                    <td className="px-5 py-2 font-mono text-xs text-slate-500">{booking.checkIn}</td>
                    <td className="px-5 py-2 font-mono text-xs text-slate-500">{booking.checkOut}</td>
                    <td className="px-5 py-2 text-center font-mono text-slate-700">{booking.nights}</td>
                    <td className="px-5 py-2 text-center font-mono text-slate-700">{booking.totalGuests}</td>
                    <td className="px-5 py-2 text-slate-600">{booking.source}</td>
                    <td className="px-5 py-2 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-right font-mono font-semibold text-slate-900">{booking.totalAmount}</td>
                    <td className="px-5 py-2 text-right font-mono">
                      {booking.guestType === "Primary" ? (
                        <div className="flex items-center justify-end gap-2">
                          {booking.remainingAmount > 0 ? (
                            <span className="font-semibold text-amber-600">
                              ${booking.remainingAmount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                              Paid
                            </span>
                          )}
                          <button
                            type="button"
                            title="Check Balance"
                            onClick={() => handleOpenLedger(booking)}
                            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition no-print"
                          >
                            <FaWallet size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-2 text-slate-500">{booking.handledBy || "—"}</td>
                    <td className="px-5 py-2 text-center no-print">
                      <div className="flex flex-col items-center gap-1.5">
                        {booking.guestType === "Primary" && (booking.status === "Check-In" || booking.status === "No-Show") && (
                          <button onClick={() => handleOpenCheckIn(booking.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition w-full">
                            Check-In
                          </button>
                        )}

                        {booking.guestType === "Primary" && booking.status === "Occupied" && (
                          <button onClick={() => handleCheckOutClick(booking)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition w-full">
                            Check-Out
                          </button>
                        )}

                        {booking.guestType === "Primary" && booking.rawStatus === "Moved" && (
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-[11px] font-semibold border border-slate-200 w-full text-center">
                            {booking.movedToRoom ? `Moved to Room ${booking.movedToRoom}` : "Moved"}
                          </span>
                        )}

                        {booking.guestType === "Primary" &&
                          booking.rawStatus !== "Checked-Out" &&
                          booking.rawStatus !== "Moved" && (
                          <div className="flex gap-1 w-full">
                            {booking.remainingAmount > 0 && (
                              <button title="Record Payment" onClick={() => setPaymentBooking(booking)}
                                className="flex-1 px-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-[11px] font-semibold rounded-lg transition">
                                <FaMoneyBillWave className="mx-auto" />
                              </button>
                            )}
                            <button title="Edit" onClick={() => setEditBooking(booking)}
                              className="flex-1 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold rounded-lg transition">
                              <FaEdit className="mx-auto" />
                            </button>
                            <button title="Extend Stay" onClick={() => setExtendBooking(booking)}
                              className="flex-1 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold rounded-lg transition">
                              <FaCalendarPlus className="mx-auto" />
                            </button>
                            <button title="Move Room" onClick={() => { setMoveRoomPrefill(null); setMoveRoomBooking(booking); }}
                              className="flex-1 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold rounded-lg transition">
                              <FaExchangeAlt className="mx-auto" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  Prev
                </button>
                <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Print-only: the FULL filtered set (ignores on-screen pagination), hidden
          on screen and forced visible via @media print below. */}
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
              {["#", "Guest Name", "Room", "Room Type", "Check-In", "Check-Out", "Nights", "Guests", "Source", "Status", "Total Amount", "Balance", "Comments", "Handled By"].map((label) => (
                <th key={label} style={{ border: "1px solid #94a3b8", padding: "6px 8px", fontWeight: 700, color: "#fff" }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking, index) => (
              <tr key={booking.rowId} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f1f5f9" }}>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", fontWeight: 600 }}>{index + 1}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", fontWeight: 600 }}>{booking.guestName}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px" }}>{booking.roomNumber}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px" }}>{booking.roomType}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px" }}>{booking.checkIn}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px" }}>{booking.checkOut}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", textAlign: "center" }}>{booking.nights}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", textAlign: "center" }}>{booking.totalGuests}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px" }}>{booking.source}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px" }}>{booking.status}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", fontWeight: 600 }}>{booking.totalAmount}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px", fontWeight: 600 }}>
                  {booking.guestType === "Primary" ? `$${(booking.remainingAmount || 0).toFixed(2)}` : "—"}
                </td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px" }}>{booking.comments || "—"}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "5px 8px" }}>{booking.handledBy || "—"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "#e2e8f0", fontWeight: 700 }}>
              <td colSpan={6} style={{ border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "right" }}>
                Totals — {filteredBookings.filter((b) => b.guestType === "Primary").length} reservation(s)
              </td>
              <td style={{ border: "1px solid #94a3b8", padding: "6px 8px", textAlign: "center" }}>
                {filteredBookings.filter((b) => b.guestType === "Primary").reduce((sum, b) => sum + (b.totalGuests || 0), 0)}
              </td>
              <td style={{ border: "1px solid #94a3b8", padding: "6px 8px" }} />
              <td style={{ border: "1px solid #94a3b8", padding: "6px 8px" }} />
              <td style={{ border: "1px solid #94a3b8", padding: "6px 8px" }}>
                ${filteredBookings.filter((b) => b.guestType === "Primary").reduce((sum, b) => sum + (b.totalAmountRaw || 0), 0).toFixed(2)}
              </td>
              <td style={{ border: "1px solid #94a3b8", padding: "6px 8px" }}>
                ${filteredBookings.filter((b) => b.guestType === "Primary").reduce((sum, b) => sum + (b.remainingAmount || 0), 0).toFixed(2)}
              </td>
              <td colSpan={2} style={{ border: "1px solid #94a3b8", padding: "6px 8px" }} />
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

              {checkoutError && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {checkoutError}
                </div>
              )}

              {checkoutBooking.remainingAmount > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Outstanding balance: ${checkoutBooking.remainingAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      This guest hasn't fully paid. You can record a payment now, or check out
                      anyway and settle the balance later.
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
                    className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <FaMoneyBillWave size={12} /> Record Payment First
                  </button>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutBooking(null)}
                    disabled={checkoutSaving}
                    className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={performCheckOut}
                    disabled={checkoutSaving}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all"
                  >
                    {checkoutSaving
                      ? "Checking out…"
                      : checkoutBooking.remainingAmount > 0
                      ? "Check Out Anyway"
                      : "Confirm Check-Out"}
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
