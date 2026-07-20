import { useState, useEffect } from "react";
import { 
  FaMoneyBillWave, 
  FaEdit, 
  FaCalendarPlus, 
  FaExchangeAlt, 
  FaWallet, 
  FaTimes, 
  FaBan,
  FaCheckCircle,
  FaDoorOpen,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBed,
  FaCalendarAlt,
  FaMoon,
  FaReceipt
} from "react-icons/fa";

// Matched perfectly with BookingDetail's cell aesthetic
function DataCell({ label, value, icon: Icon, spanClass = "col-span-1" }) {
  return (
    <div className={`flex justify-between items-center p-2 bg-slate-800/40 rounded-lg border border-slate-700/30 text-xs ${spanClass}`}>
      <div className="flex items-center gap-1.5 truncate">
        {Icon && <Icon className="text-slate-500 text-[10px] shrink-0" />}
        <span className="text-slate-400 font-medium truncate">{label}</span>
      </div>
      <span className="font-bold text-slate-200 text-right truncate pl-2" title={value ?? "—"}>
        {value ?? "—"}
      </span>
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
  onCheckInClick,
  onCheckOutClick,
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
  const isPaid = !(booking.remainingAmount > 0);

  return (
    /* Uniform Blur and Overlay setup matched perfectly with Booking Detail */
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 text-white rounded-xl w-full max-w-4xl shadow-2xl shadow-black/60 overflow-hidden border border-slate-800 transform transition-all m-2">
        
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-500 tracking-wide">Loading reservation details…</div>
        ) : (
          <>
            {/* Header Block Sync */}
            <div className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 p-5 shrink-0 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-0.5">
                  Reservation Console
                </span>
                <h2 className="text-white text-xl font-black tracking-tight">
                  Reservation <span className="font-mono text-slate-400 font-medium text-lg">{booking.bookingNumber || `#${booking.id}`}</span>
                </h2>
              </div>

              {/* Status Badge alignment */}
              <div className="flex items-center gap-3 pr-8">
                <div className="inline-flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                  <span className={`w-1.5 h-1.5 rounded-full ${booking.status?.toLowerCase() === "occupied" ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <span className="text-xs font-semibold text-slate-200">{booking.status || "Pending"}</span>
                </div>
              </div>

              <button 
                type="button" 
                onClick={onClose}
                className="absolute top-5 right-5 w-7 h-7 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>

            {/* Split Screen Container Setup - Configured strictly for no scroll layout pages */}
            <div className="p-5 space-y-3 max-h-[75vh] overflow-y-auto no-scrollbar">
              
              {/* Content Grid Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <DataCell icon={FaUser} label="First Name" value={detail?.firstName || booking.guestName?.split(" ")[0]} />
                <DataCell icon={FaUser} label="Last Name" value={detail?.lastName} />
                <DataCell icon={FaEnvelope} label="Email" value={detail?.email} />
                <DataCell icon={FaPhone} label="Phone" value={detail?.phone} />
                
                <DataCell icon={FaReceipt} label="Source No." value={detail?.sourceBookingNumber || "—"} />
                <DataCell icon={FaReceipt} label="Booking Source" value={detail?.bookingSource || booking.source} />
                <DataCell icon={FaBed} label="Room Type" value={detail?.roomType || booking.roomType} />
                <DataCell icon={FaBed} label="Room Number" value={detail?.roomNumber || booking.roomNumber} />
                
                <DataCell 
                  icon={FaCalendarAlt} 
                  label="Check-In" 
                  value={<span className="inline-flex items-center gap-1 font-mono"><FaCalendarAlt className="opacity-50 text-[10px]" /> {detail?.checkIn || booking.checkIn}</span>} 
                />
                <DataCell 
                  icon={FaCalendarAlt} 
                  label="Check-Out" 
                  value={<span className="inline-flex items-center gap-1 font-mono"><FaCalendarAlt className="opacity-50 text-[10px]" /> {detail?.checkOut || booking.checkOut}</span>} 
                />
                <DataCell icon={FaMoon} label="Nights" value={detail?.nights ?? booking.nights} />
                <DataCell icon={FaUser} label="Guests" value={`${detail?.adults || 0} A / ${detail?.children || 0} C`} />
                
                <DataCell label="Room Charge" value={detail ? `$${Number(detail.roomCharge).toFixed(2)}` : "—"} />
                <DataCell label="Extra Guest" value={detail ? `$${Number(detail.extraPersonCharge).toFixed(2)}` : "—"} />
                <DataCell label="Tax" value={detail ? `$${Number(detail.taxAmount).toFixed(2)}` : "—"} />
                
                <DataCell label="Total Amount" value={detail ? `$${Number(detail.totalAmount).toFixed(2)}` : booking.totalAmount} valueClassName="text-emerald-400" />
                <DataCell icon={FaUser} label="Handled By" value={booking.handledBy || "—"} />

                <div className="flex justify-between items-center p-2 bg-slate-800/40 rounded-lg border border-slate-700/30 text-xs">
                  <span className="text-slate-400 font-medium">Balance Status</span>
                  <span className={`font-bold ${isPaid ? "text-emerald-400" : "text-amber-400"}`}>
                    {booking.remainingAmount > 0 ? `$${Number(booking.remainingAmount).toFixed(2)} due` : "Fully Paid"}
                  </span>
                </div>

                {/* Full span special request container */}
                <div className="flex flex-col gap-1 items-start p-2 bg-slate-800/40 rounded-lg border border-slate-700/30 text-xs col-span-1 sm:col-span-2 md:col-span-3">
                  <span className="text-slate-400 font-medium">Special Requests</span>
                  <span className="font-bold text-slate-200 text-left w-full mt-0.5 break-words">
                    {detail?.specialRequests || "None specified."}
                  </span>
                </div>
              </div>

              {/* Minimal Action Trays */}
              {canAct && (
                <div className="pt-2 border-t border-slate-800/60">
                  <div className="flex flex-wrap gap-1.5">
                    {booking.remainingAmount > 0 && (
                      <button
                        onClick={() => onRecordPayment(booking)}
                        className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-lg transition-all duration-200 inline-flex items-center gap-1"
                      >
                        <FaMoneyBillWave /> Record Payment
                      </button>
                    )}
                    <button
                      onClick={() => onCheckBalance(booking)}
                      className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 text-slate-300 text-xs font-bold rounded-lg transition-all duration-200 inline-flex items-center gap-1"
                    >
                      <FaWallet /> Check Balance
                    </button>
                    <button
                      onClick={() => onEdit(booking)}
                      className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 text-slate-300 text-xs font-bold rounded-lg transition-all duration-200 inline-flex items-center gap-1"
                    >
                      <FaEdit /> Edit Booking
                    </button>
                    <button
                      onClick={() => onExtend(booking)}
                      className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 text-slate-300 text-xs font-bold rounded-lg transition-all duration-200 inline-flex items-center gap-1"
                    >
                      <FaCalendarPlus /> Extend Stay
                    </button>
                    <button
                      onClick={() => onMoveRoom(booking)}
                      className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 text-slate-300 text-xs font-bold rounded-lg transition-all duration-200 inline-flex items-center gap-1"
                    >
                      <FaExchangeAlt /> Move Room
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Interface Footer Actions Container matching Booking Detail's style exactly */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800/40 bg-slate-950/20 p-5">
              <div>
                {(booking.status === "Check-In" || booking.status === "No-Show") && (
                  <button
                    type="button"
                    onClick={() => onCheckInClick(booking.id)}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition tracking-wide shadow-lg shadow-emerald-950/20 inline-flex items-center justify-center gap-1.5"
                  >
                    <FaCheckCircle className="w-3.5 h-3.5" /> CHECK-IN GUEST
                  </button>
                )}

                {(booking.status === "Occupied" || booking.status === "Check-Out") && (
                  <button
                    type="button"
                    onClick={() => onCheckOutClick(booking)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition tracking-wide shadow-lg shadow-amber-950/20 inline-flex items-center justify-center gap-1.5"
                  >
                    <FaDoorOpen className="w-3.5 h-3.5" /> CHECK-OUT GUEST
                  </button>
                )}

                {booking.rawStatus === "Moved" && (
                  <div className="w-full py-2.5 bg-slate-800 border border-slate-700/50 text-slate-400 font-bold rounded-lg text-xs text-center flex items-center justify-center gap-2 uppercase tracking-wide">
                    {booking.movedToRoom ? `Moved to ${booking.movedToRoom}` : "Moved"}
                  </div>
                )}

                {booking.rawStatus === "Checked-Out" && (
                  <div className="w-full py-2.5 bg-slate-800/40 border border-slate-700/30 text-slate-500 font-bold rounded-lg text-xs text-center flex items-center justify-center gap-2 uppercase tracking-wide">
                    Checked-Out
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 border border-slate-700 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition inline-flex items-center justify-center gap-1.5"
              >
                <FaBan className="w-3.5 h-3.5" /> Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}