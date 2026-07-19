import { useState, useEffect } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";

const inp = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder-slate-400 bg-slate-50/50 hover:bg-yellow-50/40 hover:border-yellow-300 focus:bg-white";
const lbl = "block text-xs font-semibold text-slate-600 mb-1.5 ml-0.5";

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
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Edit Reservation</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {booking.bookingNumber} · Room {booking.roomNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 text-center py-10">Loading…</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}
            {note && (
              <div className="bg-amber-50 border border-amber-100 text-amber-700 text-sm px-4 py-3 rounded-xl">{note}</div>
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
            <p className="text-[11px] text-slate-400 -mt-2 ml-0.5">
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
                className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
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
