import { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaImage, FaMugHot, FaBath } from "react-icons/fa";
import { STATUS_META, FALLBACK_STATUS_META } from "../constants/roomStatus";

const BACKEND_URL = "http://localhost:8000";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

export default function RoomDetailModal({ isOpen, onClose, roomNumber }) {
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isOpen || !roomNumber) {
      setRoom(null);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 m-4">

        {loadError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">Could not load this room's details. Please try again.</p>
            <button type="button" onClick={onClose}
              className="mt-4 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
              Close
            </button>
          </div>
        ) : isLoading || !room ? (
          <div className="py-24 text-center text-sm text-slate-400">Loading room details…</div>
        ) : (
          <>
            {/* Image banner */}
            <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
              {type?.image ? (
                <img src={`${BACKEND_URL}/storage/${type.image}`} alt={type.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                  <FaImage className="text-slate-300 w-9 h-9" />
                  <span className="text-slate-400 text-xs font-medium">No photo available</span>
                </div>
              )}

              {/* top scrim, keeps the close button legible on light photos */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />

              {/* status pill, floating on the photo */}
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                <span className="text-xs font-medium text-slate-700">{room.status}</span>
              </div>

              <button type="button" onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition">
                <FaTimes className="w-3.5 h-3.5" />
              </button>

              {/* bottom scrim + identity */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent px-5 pt-14 pb-4">
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{type?.name || "Unknown Type"}</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-white text-2xl font-bold leading-tight">Room {roomNumber}</h2>
                  {type?.code && <span className="text-white/60 text-xs font-mono">{type.code}</span>}
                </div>
              </div>
            </div>

            {/* Definition list */}
            <div className="px-5 pt-4 pb-1">
              <dl className="divide-y divide-slate-100">
                <Row label="Floor" value={room.floor === "0" || room.floor === 0 ? "Ground Floor" : `Floor ${room.floor}`} />
                <Row label="Bed Type" value={room.bed_type || "—"} />
                <Row label="Capacity" value={type?.capacity ? `${type.capacity} Pax` : "—"} />
                <Row label="Base Rate" value={type?.base_price ? `$${type.base_price} / night` : "—"} />
                <Row label="Extra Person Rate" value={`$${type?.extra_person_rate ?? "0.00"}`} />
                <Row
                  label="Amenities"
                  value={
                    amenities.length ? (
                      <span className="inline-flex items-center gap-3">
                        {amenities.map((a) => {
                          const Icon = a.icon;
                          return (
                            <span key={a.label} className="inline-flex items-center gap-1 text-slate-700">
                              <Icon className="w-3 h-3 text-slate-400" /> {a.label}
                            </span>
                          );
                        })}
                      </span>
                    ) : (
                      <span className="text-slate-400">Standard</span>
                    )
                  }
                />
              </dl>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-3">
              <button type="button" onClick={onClose}
                className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700 transition">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
