import { useState, useEffect } from "react";

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
        headers: { "Content-Type": "application/json", Accept: "application/json" },
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
      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Move Room</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {booking.bookingNumber} · {booking.guestName} · Currently Room {booking.roomNumber}
          </p>
          {targetCheckOut && (
            <p className="text-xs text-amber-600 mt-1">
              Extending stay to {targetCheckOut} in the new room.
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">New Room</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 bg-white"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
          >
            <option value="">— Select a room —</option>
            {rooms.map((r) => (
              <option key={r.room_number} value={r.room_number}>
                Room {r.room_number} — {r.room_type?.name} (Floor {r.floor})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Reason *</label>
          <input
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
            placeholder="e.g. AC issue, guest request"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving}
            className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl text-sm">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={saving}
            className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm">
            {saving ? "Moving…" : "Confirm Move"}
          </button>
        </div>
      </div>
    </div>
  );
}
