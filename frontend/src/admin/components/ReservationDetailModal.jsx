import { useState, useEffect } from "react";
import { FaMoneyBillWave, FaEdit, FaCalendarPlus, FaExchangeAlt, FaWallet } from "react-icons/fa";

function Field({ label, value, span2 = false }) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 break-words">{value ?? "—"}</p>
    </div>
  );
}

export default function ReservationDetailModal({
  isOpen,
  booking,
  onClose,
  onRecordPayment,
  onEdit,
  onExtend,
  onMoveRoom,
  onCheckBalance,
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !booking) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/reservations/${booking.id}/detail`, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setDetail(data.reservation || null);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const canAct = booking.rawStatus !== "Checked-Out" && booking.rawStatus !== "Moved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Reservation {booking.bookingNumber || `#${booking.id}`}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm p-1">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-400 text-center">Loading details…</div>
        ) : (
          <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="First Name" value={detail?.firstName || booking.guestName?.split(" ")[0]} />
            <Field label="Last Name" value={detail?.lastName} />
            <Field label="Email" value={detail?.email} />
            <Field label="Phone" value={detail?.phone} />
            <Field label="Source Booking No." value={detail?.sourceBookingNumber || "—"} />
            <Field label="Booking Source" value={detail?.bookingSource || booking.source} />
            <Field label="Room Type" value={detail?.roomType || booking.roomType} />
            <Field label="Room Number" value={detail?.roomNumber || booking.roomNumber} />
            <Field label="Check-In" value={detail?.checkIn || booking.checkIn} />
            <Field label="Check-Out" value={detail?.checkOut || booking.checkOut} />
            <Field label="Nights" value={detail?.nights ?? booking.nights} />
            <Field label="Adults" value={detail?.adults} />
            <Field label="Children" value={detail?.children} />
            <Field label="Status" value={booking.status} />
            <Field label="Room Charge" value={detail ? `$${Number(detail.roomCharge).toFixed(2)}` : "—"} />
            <Field label="Extra Person Charge" value={detail ? `$${Number(detail.extraPersonCharge).toFixed(2)}` : "—"} />
            <Field label="Tax" value={detail ? `$${Number(detail.taxAmount).toFixed(2)}` : "—"} />
            <Field label="Total Amount" value={detail ? `$${Number(detail.totalAmount).toFixed(2)}` : booking.totalAmount} />
            <Field
              label="Balance"
              value={
                booking.remainingAmount > 0
                  ? `$${Number(booking.remainingAmount).toFixed(2)} due`
                  : "Paid"
              }
            />
            <Field label="Handled By" value={booking.handledBy || "—"} />
            <Field label="Special Requests" value={detail?.specialRequests || "—"} span2 />
          </div>
        )}

        {canAct && (
          <div className="flex flex-wrap gap-2 justify-end px-6 pb-6 pt-2 border-t border-slate-100">
            {booking.remainingAmount > 0 && (
              <button
                onClick={() => onRecordPayment(booking)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
              >
                <FaMoneyBillWave /> Record Payment
              </button>
            )}
            <button
              onClick={() => onCheckBalance(booking)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <FaWallet /> Check Balance
            </button>
            <button
              onClick={() => onEdit(booking)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <FaEdit /> Edit
            </button>
            <button
              onClick={() => onExtend(booking)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <FaCalendarPlus /> Extend Stay
            </button>
            <button
              onClick={() => onMoveRoom(booking)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <FaExchangeAlt /> Move Room
            </button>
          </div>
        )}

        <div className="flex justify-end px-6 pb-6">
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
