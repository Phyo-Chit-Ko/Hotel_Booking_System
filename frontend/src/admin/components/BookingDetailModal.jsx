import { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaCalendarAlt, FaUserCircle, FaReceipt, FaEye, FaEyeSlash } from "react-icons/fa";
import { formatCurrency } from "../../utils/currency";

function StatRow({ label, value, valueClassName = "text-slate-200", spanAll = false, gridCols = "col-span-3" }) {
  return (
    <div className={`flex justify-between items-center p-2 bg-slate-800/40 rounded-lg border border-slate-700/30 text-xs ${spanAll ? `${gridCols} flex-col gap-1 items-start` : ""}`}>
      <span className="text-slate-400 font-medium">{label}</span>
      <span className={`font-bold ${valueClassName} break-words ${spanAll ? "text-left w-full mt-0.5" : "text-right"}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function BookingDetailModal({ isOpen, onClose, booking, onEdit, onNavigateToReservation }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false); // Controls inline image preview tray

  useEffect(() => {
    if (!isOpen || !booking) {
      setDetail(null);
      setShowScreenshot(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    
    axios
      .get(`http://localhost:8000/api/bookings/${booking.raw_id || booking.id}`)
      .then((res) => {
        if (!cancelled) setDetail(res.data.booking);
      })
      .catch((err) => {
        console.error("Error fetching booking details:", err);
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
  const isConverted = b.rawStatus?.toLowerCase() === "converted";
  
  // Check if booking is cancelled
  const isCancelled = b.status?.toLowerCase() === "cancelled" || b.rawStatus?.toLowerCase() === "cancelled";

  let statusColor = "text-amber-400";
  if (isConverted) statusColor = "text-emerald-400";
  if (isCancelled) statusColor = "text-rose-400";

  // Adjust columns based on whether the screenshot panel is active
  const gridColumns = showScreenshot ? "grid-cols-2" : "grid-cols-3";
  const spanValue = showScreenshot ? "col-span-2" : "col-span-3";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      {/* Maximum sizing expands automatically if you choose to see the screenshot */}
      <div className={`bg-slate-900 text-white rounded-xl w-full transition-all duration-300 shadow-2xl shadow-black/60 overflow-hidden border border-slate-800 m-2 ${showScreenshot ? "max-w-5xl" : "max-w-2xl"}`}>
        
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-500 tracking-wide">Loading booking details…</div>
        ) : (
          <>
            {/* Main Header Row */}
            <div className="relative bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 p-5 shrink-0 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-0.5">
                  Reservation Document
                </span>
                <h2 className="text-white text-xl font-black tracking-tight">
                  Booking #{b.booking_number || b.id}
                </h2>
              </div>

              <div className="flex items-center gap-3 pr-8">
                <div className="inline-flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                  <span className={`w-1.5 h-1.5 rounded-full ${isConverted ? "bg-emerald-400" : isCancelled ? "bg-rose-400" : "bg-amber-400"}`} />
                  <span className="text-xs font-semibold text-slate-200">{b.status || "Pending"}</span>
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

            {/* Split Screen Container Setup */}
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800 max-h-[70vh] overflow-y-auto">
              
              {/* Left Side: Booking details */}
              <div className="p-5 space-y-4 flex-1">
                
                {/* Profile Bar Segment */}
                <div className="bg-slate-800/30 border border-slate-700/20 p-3 rounded-xl flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2.5 shrink-0">
                    <FaUserCircle className="text-emerald-400 text-xl" />
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 leading-none">Primary Contact</p>
                      <p className="text-sm font-bold text-slate-100 mt-0.5">{b.first_name} {b.last_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-hidden text-right md:text-left">
                    <div className="truncate hidden sm:block">
                      <span className="text-slate-500 block font-medium text-[10px] uppercase tracking-wider">Email</span>
                      <span className="font-semibold text-slate-300">{b.email || "—"}</span>
                    </div>
                    <div className="shrink-0">
                      <span className="text-slate-500 block font-medium text-[10px] uppercase tracking-wider">Phone</span>
                      <span className="font-semibold text-slate-300 font-mono">{b.phone || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Adaptive Density Column Data Matrix Grid */}
                <div className={`grid ${gridColumns} gap-2`}>
                  <br className="hidden" />
                  <StatRow label="Room Type" value={b.roomType} />
                  <StatRow label="Bed Preference" value={b.bed_preference} />
                  <StatRow label="Payment Method" value={b.payment_method} />
                  
                  <StatRow 
                    label="Check-In" 
                    value={<span className="inline-flex items-center gap-1 font-mono"><FaCalendarAlt className="opacity-50 text-[10px]" /> {b.checkIn}</span>} 
                  />
                  <StatRow 
                    label="Check-Out" 
                    value={<span className="inline-flex items-center gap-1 font-mono"><FaCalendarAlt className="opacity-50 text-[10px]" /> {b.checkOut}</span>} 
                  />
                  <StatRow label="Total Rooms" value={b.total_room} />

                  <StatRow label="Guests" value={`${b.adult || 0} A / ${b.child || 0} C`} />
                  <StatRow label="Deposit" value={formatCurrency(b.amount)} valueClassName="text-amber-400" />
                  
                  <StatRow 
                    label="Attachment" 
                    value={
                      b.depositScreenshot ? (
                        <button 
                          type="button"
                          onClick={() => setShowScreenshot(!showScreenshot)} 
                          className="text-emerald-400 font-bold hover:text-emerald-300 transition inline-flex items-center gap-1 focus:outline-none"
                        >
                          {showScreenshot ? <><FaEyeSlash /> Hide Receipt</> : <><FaEye /> View Receipt</>}
                        </button>
                      ) : "None Provided"
                    } 
                  />

                  {isCancelled ? (
                    <StatRow
                      label="Cancelled At"
                      value={b.created_at ? new Date(b.created_at).toLocaleDateString() : "—"}
                      valueClassName="text-rose-400"
                    />
                  ) : (
                    <StatRow label="Handled By" value={b.handledBy} />
                  )}
                  <StatRow label="Live Status" value={b.status} valueClassName={statusColor} />
                 {!isCancelled && (
                    <StatRow
                      label="Created At"
                      value={b.created_at ? new Date(b.created_at).toLocaleDateString() : null}
                      valueClassName="text-slate-400 font-mono"
                    />
                  )}
                  <StatRow label="Special Requests" value={b.special_requests || "None specified."} spanAll gridCols={spanValue} />
                </div>

                {/* System Assigned Units Layout Tray */}
                {Array.isArray(b.roomAssignments) && b.roomAssignments.length > 0 && (
                  <div className="pt-1 border-t border-slate-800/60">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <FaReceipt className="text-[9px] opacity-60" /> Assigned Spaces
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {b.roomAssignments.map((a) => (
                        <div key={a.roomNumber} className="flex items-center justify-between text-xs bg-slate-800/20 border border-slate-700/20 rounded-lg px-2.5 py-1.5">
                          <span className="font-bold text-slate-300">Room {a.roomNumber}</span>
                          {/* <span className="text-slate-500 text-[10px] font-mono">
                            {a.reservationId ? `ID: ${a.reservationId}` : "Pending"}
                          </span> */}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side Image Display Layer */}
              {showScreenshot && b.depositScreenshot && (
                <div className="flex-1 bg-slate-950 p-4 flex flex-col justify-center items-center min-h-[300px] md:max-w-md lg:max-w-lg">
                  <div className="w-full flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Deposit Screenshot</span>
                    <button 
                      type="button" 
                      onClick={() => setShowScreenshot(false)} 
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Hide Pane
                    </button>
                  </div>
                  <div className="relative w-full h-full flex items-center justify-center rounded-lg overflow-hidden border border-slate-800 bg-slate-900/50 p-2">
                    <img 
                      src={b.depositScreenshot} 
                      alt="Deposit receipt confirmation attachment proof" 
                      className="max-w-full max-h-[50vh] object-contain rounded-md"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Interface Footer Actions Container */}
            <div className="grid grid-cols-2 gap-2 pt-4 mt-6 border-t border-slate-800/40 bg-slate-950/20 -mx-5 -mb-5 p-5">
              {isConverted ? (
                <button
                  type="button"
                  onClick={() => onNavigateToReservation && onNavigateToReservation(booking.reservationId)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition tracking-wide shadow-lg shadow-emerald-950/20 inline-flex items-center justify-center gap-1.5"
                >
                  See Reservation
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isCancelled}
                  onClick={() => !isCancelled && onEdit(booking)}
                  className={`w-full py-2.5 font-bold rounded-lg text-xs transition tracking-wide inline-flex items-center justify-center gap-1.5 ${
                    isCancelled
                      ? "bg-slate-800 border border-slate-700/50 text-slate-500 cursor-not-allowed opacity-60 shadow-none"
                      : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-950/20"
                  }`}
                >
                  Edit Booking
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 border border-slate-700 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition inline-flex items-center justify-center gap-1.5"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}