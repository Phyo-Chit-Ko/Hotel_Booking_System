import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
function Field({ label, value, span2 = false }) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 break-words">{value ?? "—"}</p>
    </div>
  );
}

export default function BookingDetailModal({ isOpen, onClose, booking, onEdit }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !booking) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    axios
      .get(`API_BASE_URL/api/bookings/${booking.raw_id || booking.id}`)
      .then((res) => {
        if (!cancelled) setDetail(res.data.booking);
      })
      .catch(() => {
        if (!cancelled) setDetail(booking);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const b = detail || booking;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Booking {b.booking_number || b.id}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm p-1">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-400 text-center">Loading details…</div>
        ) : (
          <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="First Name" value={b.first_name} />
            <Field label="Last Name" value={b.last_name} />
            <Field label="Email" value={b.email} />
            <Field label="Phone" value={b.phone} />
            <Field label="Room Type" value={b.roomType} />
            <Field label="Bed Preference" value={b.bed_preference} />
            <Field label="Check-In" value={b.checkIn} />
            <Field label="Check-Out" value={b.checkOut} />
            <Field label="Total Rooms" value={b.total_room} />
            <Field label="Adults" value={b.adult} />
            <Field label="Children" value={b.child} />
            <Field label="Deposit" value={`$${Number(b.amount || 0).toFixed(2)}`} />
            <Field
              label="Deposit Screenshot"
              value={
                b.depositScreenshot ? (
                  <a
                    href={b.depositScreenshot}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 underline"
                  >
                    View
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Field label="Payment Method" value={b.payment_method} />
            <Field label="Special Requests" value={b.special_requests || "—"} span2 />
            <Field label="Status" value={b.status} />
            <Field label="Handled By" value={b.handledBy || "—"} />
            <Field label="Created At" value={b.created_at} />

            {Array.isArray(b.roomAssignments) && b.roomAssignments.length > 0 && (
              <div className="col-span-2 pt-2 border-t border-slate-100 mt-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Assigned Rooms
                </p>
                <div className="space-y-1">
                  {b.roomAssignments.map((a) => (
                    <div
                      key={a.roomNumber}
                      className="flex items-center justify-between text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5"
                    >
                      <span className="font-medium text-slate-700">Room {a.roomNumber}</span>
                      <span className="text-slate-400 text-xs">
                        {a.reservationId ? `Reservation #${a.reservationId}` : "Not converted yet"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 px-6 pb-6 pt-2">
          {b.rawStatus?.toLowerCase() !== "converted" && (
            <button
              onClick={() => onEdit(b)}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
            >
              Edit
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
