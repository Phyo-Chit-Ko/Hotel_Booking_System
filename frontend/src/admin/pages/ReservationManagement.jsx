import { useState, useEffect, useMemo } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddReservation from "../components/AddReservation";
import RecordPayment from "../components/RecordPayment";
import MoveRoomModal from "../components/MoveRoomModal";
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

  // Booking row currently open in the Move Room modal.
  const [moveRoomBooking, setMoveRoomBooking] = useState(null);

  // Booking row currently open in the Extend Stay modal.
  // NOTE: ExtendStayModal isn't built yet — this state exists so the
  // "Extend Stay" button doesn't throw, but clicking it won't open
  // anything until that modal is added.
  const [extendBooking, setExtendBooking] = useState(null);

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

  const stats = useMemo(() => {
    const checkIns = primaryBookings.filter((b) => b.checkIn === selectedDate).length;
    const checkOuts = primaryBookings.filter((b) => b.checkOut === selectedDate).length;
    const inHouse = primaryBookings.filter((b) => isInHouseOn(b, selectedDate)).length;
    return { checkIns, checkOuts, inHouse };
  }, [primaryBookings, selectedDate]);

  const filteredBookings = useMemo(() => {
    let rows = bookings;

    if (activeFilter === "checkin") {
      rows = rows.filter((b) => b.checkIn === selectedDate);
    } else if (activeFilter === "checkout") {
      rows = rows.filter((b) => b.checkOut === selectedDate);
    } else if (activeFilter === "inhouse") {
      rows = rows.filter((b) => isInHouseOn(b, selectedDate));
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      rows = rows.filter((b) =>
        [b.bookingNumber, b.guestName, b.roomNumber, b.roomType, b.source, b.status, String(b.id)]
          .some((field) => (field ?? "").toString().toLowerCase().includes(term))
      );
    }

    return rows;
  }, [bookings, activeFilter, selectedDate, searchTerm]);

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
  // so we get a chance to show the outstanding balance first.
  const handleCheckOutClick = (booking) => {
    setCheckoutError("");
    setCheckoutBooking(booking);
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

  // After a payment is recorded from the checkout confirm modal, refresh
  // the balance shown there instead of closing it, so staff can see it
  // hit $0 and then check out in the same flow.
  const handlePaymentSaved = async (updatedBooking) => {
    setPaymentBooking(null);
    await loadBookings();
    if (checkoutBooking && updatedBooking && updatedBooking.id === checkoutBooking.id) {
      setCheckoutBooking(updatedBooking);
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
                {loading ? "…" : stats.checkIns}
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
                {loading ? "…" : stats.checkOuts}
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
                  <th className="px-5 py-3.5 text-right">Balance</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr><td colSpan={14} className="px-5 py-6 text-center text-slate-400">Loading reservations…</td></tr>
                )}
                {!loading && loadError && (
                  <tr><td colSpan={14} className="px-5 py-6 text-center text-red-500">{loadError}</td></tr>
                )}
                {!loading && !loadError && filteredBookings.length === 0 && (
                  <tr><td colSpan={14} className="px-5 py-6 text-center text-slate-400">
                    {bookings.length === 0 ? "No reservations yet." : "No reservations match this filter."}
                  </td></tr>
                )}
                {!loading && !loadError && filteredBookings.map((booking) => (
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
                    <td className="px-5 py-4 text-right font-mono">
                      {booking.guestType === "Primary" ? (
                        booking.remainingAmount > 0 ? (
                          <span className="font-semibold text-amber-600">
                            ${booking.remainingAmount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                            Paid
                          </span>
                        )
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
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

                        {booking.guestType === "Primary" && booking.rawStatus !== "Checked-Out" && (
                          <div className="flex gap-1 w-full">
                            {booking.remainingAmount > 0 && (
                              <button title="Record Payment" onClick={() => setPaymentBooking(booking)}
                                className="flex-1 px-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-[11px] font-semibold rounded-lg transition">
                                <FaMoneyBillWave className="mx-auto" />
                              </button>
                            )}
                            <button title="Extend Stay" onClick={() => setExtendBooking(booking)}
                              className="flex-1 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold rounded-lg transition">
                              <FaCalendarPlus className="mx-auto" />
                            </button>
                            <button title="Move Room" onClick={() => setMoveRoomBooking(booking)}
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

        </div>
      </div>

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
          onClose={() => setMoveRoomBooking(null)}
          onMoved={handleRoomMoved}
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
