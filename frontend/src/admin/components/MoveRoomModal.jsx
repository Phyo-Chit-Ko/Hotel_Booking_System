import { useState, useEffect } from "react";
import { FaTimes, FaExchangeAlt } from "react-icons/fa";
import { authHeaders } from "../../utils/apiHeaders";

const inp =
  "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all";
const sel =
  inp +
  " appearance-none pr-10 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat";
const lbl = "block text-xs font-semibold text-slate-400 mb-1.5 ml-0.5";

/**
 * Move Room. Accepts optional prefilledReason/targetCheckOut props for the
 * Extend Stay handoff (when the current room isn't free for the extra
 * nights) — in that case the new room search covers the extended range and
 * the move request carries the extended checkOut so the new reservation
 * picks up the extra nights in one motion.
 */
export default function MoveRoomModal({ booking, onClose, onMoved, prefilledReason = "", targetCheckOut = null }) {
  const [rooms, setRooms] = useState([]);
  const [roomNumber, setRoomNumber] = useState("");
  const [reason, setReason] = useState(prefilledReason);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const effectiveCheckOut = targetCheckOut || booking.checkOut;

  useEffect(() => {
    fetch(`/api/rooms/available?check_in=${booking.checkIn}&check_out=${effectiveCheckOut}`)
      .then((r) => r.json())
      .then((d) => setRooms((d.rooms || []).filter((r) => r.room_number !== booking.roomNumber)))
      .catch(() => setRooms([]));
  }, [booking, effectiveCheckOut]);

  const submit = async () => {
    if (!roomNumber) { setError("Please select a new room."); return; }
    if (!reason.trim()) { setError("Please enter a reason for the move."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = { roomNumber, reason: reason.trim() };
      if (targetCheckOut) payload.checkOut = targetCheckOut;

      const res = await fetch(`/api/reservations/${booking.id}/move-room`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to move room");
      onMoved(data);
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
            Move Room
          </span>
          <h2 className="text-white text-lg font-black tracking-tight">Move Room</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {booking.bookingNumber} · {booking.guestName} · Currently Room {booking.roomNumber}
          </p>
          {targetCheckOut && (
            <p className="text-xs text-amber-400 mt-1">
              Extending stay to {targetCheckOut} in the new room.
            </p>
          )}
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
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className={lbl}>New Room</label>
            <select className={sel} value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)}>
              <option value="">— Select a room —</option>
              {rooms.map((r) => (
                <option key={r.room_number} value={r.room_number}>
                  Room {r.room_number} — {r.room_type?.name} (Floor {r.floor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={lbl}>Reason *</label>
            <input
              className={inp}
              placeholder="e.g. AC issue, guest request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving}
              className="flex-1 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60">
              Cancel
            </button>
            <button type="button" onClick={submit} disabled={saving}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              <FaExchangeAlt size={12} /> {saving ? "Moving…" : "Confirm Move"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}