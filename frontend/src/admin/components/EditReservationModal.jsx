import { useState, useEffect } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";

const inp =
  "w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all";
const lbl = "block text-xs font-semibold text-slate-400 mb-1.5 ml-0.5";

/**
 * "Edit" — guest name, phone, special requests, and now guest counts
 * (adults/children — e.g. more people joining an existing stay). Still
 * deliberately kept separate from Extend Stay / Move Room: no availability
 * check, no date changes. Raising the guest count may add a new
 * extra-person charge for the remaining nights — the backend handles that
 * and we just surface a note if it happened.
 */
export default function EditReservationModal({ booking, onClose, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [note, setNote] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/reservations/${booking.id}/detail`, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setFirstName(d.reservation?.firstName || "");
        setLastName(d.reservation?.lastName || "");
        setPhone(d.reservation?.phone || "");
        setSpecialRequests(d.reservation?.specialRequests || "");
        setAdults(d.reservation?.adults || 1);
        setChildren(d.reservation?.children || 0);
      })
      .catch(() => setError("Failed to load reservation details."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [booking.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNote("");
    try {
      const res = await fetch(`/api/reservations/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          guestName: `${firstName} ${lastName}`.trim(),
          guestPhone: phone,
          specialRequests,
          adults: Number(adults),
          children: Number(children),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update reservation.");
      if (data.chargeAdded?.amount > 0) {
        setNote(
          `Added a $${data.chargeAdded.amount.toFixed(2)} extra-person charge for ${data.chargeAdded.nights} remaining night(s).`
        );
      }
      onSaved(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl shadow-black/60 overflow-hidden">
        <div className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 p-5 border-b border-slate-800">
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-0.5">
            Edit
          </span>
          <h2 className="text-white text-lg font-black tracking-tight">Edit Reservation</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {booking.bookingNumber} · Room {booking.roomNumber}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-7 h-7 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 text-center py-10">Loading…</p>
        ) : (
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}
            {note && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm px-4 py-3 rounded-xl">{note}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>First Name</label>
                <input className={inp} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Last Name</label>
                <input className={inp} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div>
              <label className={lbl}>Phone</label>
              <input className={inp} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Adults</label>
                <input
                  type="number"
                  min={1}
                  className={inp}
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                />
              </div>
              <div>
                <label className={lbl}>Children</label>
                <input
                  type="number"
                  min={0}
                  className={inp}
                  value={children}
                  onChange={(e) => setChildren(e.target.value)}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 -mt-2 ml-0.5">
              Increasing guest count adds an extra-person charge for the remaining nights only.
            </p>

            <div>
              <label className={lbl}>Special Requests</label>
              <textarea
                className={inp}
                rows={3}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
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
                type="submit"
                disabled={saving}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                <FaCheck size={12} /> {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}