import { useState, useRef } from "react";
import { FaTimes, FaCalendarPlus, FaCalendarAlt } from "react-icons/fa";
import { authHeaders } from "../../utils/apiHeaders";

const inp =
  "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all disabled:text-slate-500 disabled:bg-slate-800/30 [color-scheme:dark]";
const lbl = "block text-xs font-semibold text-slate-400 mb-1.5 ml-0.5";

/**
 * Extend Stay — separate from Edit and from Move Room. On success, appends
 * new charge rows for just the added nights (existing charges untouched).
 * If the room isn't free for the extra nights, the backend responds with
 * requiresMove instead of an error; we hand off to Move Room in that case
 * rather than showing a dead-end failure.
 */
export default function ExtendStayModal({ booking, onClose, onExtended, onRequiresMove }) {
  const [checkOut, setCheckOut] = useState(booking.checkOut);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dateInputRef = useRef(null);

  const openDatePicker = () => {
    if (dateInputRef.current?.showPicker) {
      dateInputRef.current.showPicker();
    } else {
      dateInputRef.current?.focus();
    }
  };

  const submit = async () => {
    setError("");
    if (!checkOut || checkOut <= booking.checkOut) {
      setError("New check-out date must be after the current one.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/reservations/${booking.id}/extend`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ checkOut }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to extend stay.");

      if (data.requiresMove) {
        onRequiresMove({
          reason: "Extend stay — original room unavailable",
          targetCheckOut: data.checkOut || checkOut,
          message: data.message,
        });
        return;
      }

      onExtended(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl shadow-black/60 overflow-hidden">
        <div className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 p-5 border-b border-slate-800">
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-0.5">
            Extend Stay
          </span>
          <h2 className="text-white text-lg font-black tracking-tight">Extend Stay</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {booking.bookingNumber} · {booking.guestName} · Room {booking.roomNumber}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-7 h-7 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <div>
            <label className={lbl}>Current Check-Out</label>
            <input className={inp} value={booking.checkOut} disabled />
          </div>

          <div>
            <label className={lbl}>New Check-Out *</label>
            <div className="relative">
              <input
                ref={dateInputRef}
                className={inp + " pr-11 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-11 [&::-webkit-calendar-picker-indicator]:h-full"}
                type="date"
                min={booking.checkOut}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
              <FaCalendarAlt
                onClick={openDatePicker}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-sm cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <FaCalendarPlus size={12} /> {saving ? "Extending…" : "Extend Stay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}