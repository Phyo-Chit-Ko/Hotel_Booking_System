import { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaImage, FaMugHot, FaBath, FaUserCircle, FaCalendarAlt, FaUsers } from "react-icons/fa";
import { STATUS_META, FALLBACK_STATUS_META } from "../constants/roomStatus";
import { formatCurrency } from "../../utils/currency";

const BACKEND_URL = "http://localhost:8000";

// Unit Inspector-style stat row (ported from the now-retired Available_rooms.jsx
// "Unit Inspector" panel so the eye-icon modal shares the same visual language).
function StatRow({ label, value, valueClassName = "text-slate-200" }) {
  return (
    <div className="flex justify-between p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/30">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold ${valueClassName}`}>{value}</span>
    </div>
  );
}

export default function RoomDetailModal({ isOpen, onClose, roomNumber }) {
  const [room, setRoom] = useState(null);
  const [currentStay, setCurrentStay] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isOpen || !roomNumber) {
      setRoom(null);
      setCurrentStay(null);
      setLoadError(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);
    axios.get(`/api/rooms/${roomNumber}`)
      .then((res) => {
        if (cancelled) return;
        setRoom(res.data.room);
        setCurrentStay(res.data.current_stay || null);
      })
      .catch((error) => {
        console.error("Error fetching room detail:", error);
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [isOpen, roomNumber]);

  if (!isOpen) return null;

  const type = room?.room_type;
  const meta = room ? (STATUS_META[room.status] || FALLBACK_STATUS_META) : FALLBACK_STATUS_META;
  const amenities = [
    type?.breakfast ? { icon: FaMugHot, label: "Breakfast" } : null,
    type?.bathtub ? { icon: FaBath, label: "Bathtub" } : null,
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-slate-900 text-white rounded-xl w-full max-w-md shadow-xl shadow-black/40 overflow-hidden border border-slate-800 m-4 max-h-[90vh] overflow-y-auto">

        {loadError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-400">Could not load this room's details. Please try again.</p>
            <button type="button" onClick={onClose}
              className="mt-4 px-4 py-2 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition">
              Close
            </button>
          </div>
        ) : isLoading || !room ? (
          <div className="py-24 text-center text-sm text-slate-500">Loading room details…</div>
        ) : (
          <>
            {/* Image banner */}
            <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-950 shrink-0">
              

              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

              {/* status pill, floating on the photo */}
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-white/10">
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                <span className="text-xs font-medium text-slate-100">{room.status}</span>
              </div>

              <button type="button" onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition">
                <FaTimes className="w-3.5 h-3.5" />
              </button>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent px-5 pt-14 pb-4">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">Selected Block</span>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-white text-2xl font-black tracking-tight leading-tight">Room {roomNumber}</h2>
                  {type?.code && <span className="text-white/50 text-xs font-mono">{type.code}</span>}
                </div>
              </div>
            </div>

            {/* Unit Inspector-style body */}
            <div className="p-5 space-y-5">
              {/* Current Resident card — only when occupied and a linked reservation was found */}
              {room.status === "Occupied" && currentStay && (
                <div className="bg-rose-950/40 border border-rose-900/50 p-3.5 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <FaUserCircle className="text-rose-400 text-lg" />
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-wider text-rose-300 leading-none">Current Resident</p>
                      <p className="text-sm font-bold text-slate-100 mt-0.5">{currentStay.guest_name || "Guest"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rose-900/30 text-[11px]">
                    <div>
                      <span className="text-rose-300 block font-medium">Check-In:</span>
                      <span className="text-slate-200 font-mono font-bold flex items-center gap-1 mt-0.5">
                        <FaCalendarAlt className="text-[10px] opacity-60" /> {currentStay.check_in_date}
                      </span>
                    </div>
                    <div>
                      <span className="text-rose-300 block font-medium">Check-Out:</span>
                      <span className="text-slate-200 font-mono font-bold flex items-center gap-1 mt-0.5">
                        <FaCalendarAlt className="text-[10px] opacity-60" /> {currentStay.check_out_date}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {room.status === "Occupied" && !currentStay && (
                <div className="bg-slate-800/50 border border-slate-700/40 p-3 rounded-xl text-[11px] text-slate-400">
                  Marked Occupied, but no checked-in reservation was found for this room.
                </div>
              )}

              <div className="space-y-2 text-xs">
                <StatRow label="Class Type" value={`${type?.name || "Unknown Type"}${type?.code ? ` (${type.code})` : ""}`} />
                <StatRow
                  label="Base Cost"
                  value={type?.base_price ? `${formatCurrency(type.base_price)}/night` : "—"}
                  valueClassName="text-amber-400"
                />
                <StatRow
                  label="Capacity"
                  value={<span className="inline-flex items-center gap-1"><FaUsers className="inline" /> {type?.capacity ? `${type.capacity} Guests` : "—"}</span>}
                />
                <StatRow label="Floor" value={room.floor === "0" || room.floor === 0 ? "Ground Floor" : `Floor ${room.floor}`} />
                <StatRow label="Bed Type" value={room.bed_type || "—"} />
                <StatRow label="Extra Person Rate" value={formatCurrency(type?.extra_person_rate ?? 0)} />
                <StatRow
                  label="Amenities"
                  value={
                    amenities.length ? (
                      <span className="inline-flex items-center gap-3">
                        {amenities.map((a) => {
                          const Icon = a.icon;
                          return (
                            <span key={a.label} className="inline-flex items-center gap-1 text-slate-200">
                              <Icon className="w-3 h-3 text-slate-400" /> {a.label}
                            </span>
                          );
                        })}
                      </span>
                    ) : (
                      <span className="text-slate-500">Standard</span>
                    )
                  }
                />
                <StatRow
                  label="Live Status"
                  value={room.status}
                  valueClassName={room.status === "Available" ? "text-emerald-400" : room.status === "Occupied" ? "text-rose-400" : "text-slate-200"}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-1">
              <button type="button" onClick={onClose}
                className="w-full py-2.5 border border-slate-700 hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-200 transition">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
