import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  FaPlus, FaTrash, FaSave, FaUndo, FaRedo, FaEdit,
  FaTimes, FaCheck, FaArrowsAlt, FaLayerGroup,
  FaEye, FaLock, FaLockOpen, FaSpinner, FaExclamationTriangle,
  FaSwimmingPool, FaDoorOpen,
} from "react-icons/fa";

// ── Constants ──────────────────────────────────────────────────────────────────
const COLS   = 11;
const ROWS   = 14;
const CELL_W = 72;
const CELL_H = 42;

const STATUS_COLORS = {
  Available:   "bg-emerald-400 text-emerald-950 border-emerald-500",
  Occupied:    "bg-rose-300   text-rose-900   border-rose-400",
  Cleaning:    "bg-amber-300  text-amber-900  border-amber-400",
  Reserved:    "bg-indigo-300 text-indigo-900 border-indigo-400",
  Maintenance: "bg-slate-400  text-slate-900  border-slate-500",
};

// Zone types available for adding — maps type → display style
const ZONE_TYPES = {
  pool:           { label: "Pool",           style: "bg-cyan-950/80   text-cyan-300   border-cyan-700"   },
  gym:            { label: "GYM",            style: "bg-orange-950/80 text-orange-300 border-orange-700" },
  elevator:       { label: "Elevator",       style: "bg-slate-700     text-slate-300  border-slate-600"  },
  walkway:        { label: "Walkway",        style: "bg-slate-900     text-slate-500  border-slate-800"  },
  emergency_exit: { label: "Emergency Exit", style: "bg-red-900/80    text-red-300    border-red-700"    },
  stairs:         { label: "Stairs",         style: "bg-zinc-800      text-zinc-300   border-zinc-600"   },
  reception:      { label: "Reception",      style: "bg-violet-900/80 text-violet-300 border-violet-700" },
  restaurant:     { label: "Restaurant",     style: "bg-amber-900/80  text-amber-300  border-amber-700"  },
  parking:        { label: "Parking",        style: "bg-slate-800     text-slate-400  border-slate-700"  },
  custom:         { label: "Custom",         style: "bg-teal-900/80   text-teal-300   border-teal-700"   },
};

// ── Small helpers ──────────────────────────────────────────────────────────────
function Spinner({ size = 14 }) {
  return <FaSpinner size={size} className="animate-spin" />;
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold border ${
      toast.type === "success"
        ? "bg-emerald-900 border-emerald-700 text-emerald-200"
        : "bg-rose-900 border-rose-700 text-rose-200"
    }`}>
      {toast.type === "success" ? <FaCheck size={12} /> : <FaExclamationTriangle size={12} />}
      {toast.message}
    </div>
  );
}

// ── Add Zone Modal ─────────────────────────────────────────────────────────────
function AddZoneModal({ targetCell, onAdd, onClose }) {
  const [form, setForm] = useState({
    type: "emergency_exit", label: "", col: targetCell.col, row: targetCell.row,
    w: 1, h: 1, vertical: false,
  });
  const [error, setError] = useState("");
  const f   = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const iCls = "w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500";
  const lCls = "block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1";

  // Auto-fill label when type changes
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setForm((p) => ({ ...p, type, label: ZONE_TYPES[type]?.label || "" }));
  };

  const handleAdd = () => {
    if (!form.label.trim()) return setError("Label is required.");
    setError("");
    onAdd({ ...form, w: parseInt(form.w), h: parseInt(form.h), vertical: form.vertical === true || form.vertical === "true" });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Add Zone / Area</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Position: col {targetCell.col}, row {targetCell.row}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><FaTimes /></button>
        </div>
        <div className="p-4 space-y-3">
          {error && <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className={lCls}>Zone Type</label>
            <select className={iCls} value={form.type} onChange={handleTypeChange}>
              {Object.entries(ZONE_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={lCls}>Display Label *</label>
            <input className={iCls} placeholder="e.g. Emergency Exit A"
              value={form.label} onChange={f("label")} autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lCls}>Width (cols)</label>
              <input className={iCls} type="number" min={1} max={11} value={form.w} onChange={f("w")} />
            </div>
            <div>
              <label className={lCls}>Height (rows)</label>
              <input className={iCls} type="number" min={1} max={14} value={form.h} onChange={f("h")} />
            </div>
          </div>

          {/* Vertical text toggle — useful for walkways */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => setForm((p) => ({ ...p, vertical: !p.vertical }))}
              className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all ${form.vertical ? "bg-emerald-500" : "bg-slate-700"}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${form.vertical ? "translate-x-4" : ""}`} />
            </div>
            <span className="text-xs text-slate-300">Rotate label text vertically</span>
          </label>

          {/* Preview */}
          <div className={`rounded-lg p-2 flex items-center justify-center text-[11px] font-bold uppercase tracking-widest border ${ZONE_TYPES[form.type]?.style}`}>
            {form.label || ZONE_TYPES[form.type]?.label}
          </div>
        </div>
        <div className="p-4 border-t border-slate-800 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-bold text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800">Cancel</button>
          <button onClick={handleAdd} className="flex-1 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg flex items-center justify-center gap-1.5">
            <FaPlus size={10} /> Add Zone
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Zone Modal ────────────────────────────────────────────────────────────
function EditZoneModal({ zone, onSave, onClose }) {
  const [form, setForm] = useState({ ...zone });
  const f   = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const iCls = "w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500";
  const lCls = "block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Edit Zone</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><FaTimes /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className={lCls}>Zone Type</label>
            <select className={iCls} value={form.type} onChange={f("type")}>
              {Object.entries(ZONE_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lCls}>Display Label</label>
            <input className={iCls} value={form.label} onChange={f("label")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lCls}>Col</label><input className={iCls} type="number" min={1} max={11} value={form.col} onChange={f("col")} /></div>
            <div><label className={lCls}>Row</label><input className={iCls} type="number" min={1} max={14} value={form.row} onChange={f("row")} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lCls}>Width</label><input className={iCls} type="number" min={1} max={11} value={form.w} onChange={f("w")} /></div>
            <div><label className={lCls}>Height</label><input className={iCls} type="number" min={1} max={14} value={form.h} onChange={f("h")} /></div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => setForm((p) => ({ ...p, vertical: !p.vertical }))}
              className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all ${form.vertical ? "bg-emerald-500" : "bg-slate-700"}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${form.vertical ? "translate-x-4" : ""}`} />
            </div>
            <span className="text-xs text-slate-300">Vertical label</span>
          </label>
        </div>
        <div className="p-4 border-t border-slate-800 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-bold text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800">Cancel</button>
          <button onClick={() => onSave({ ...form, col: parseInt(form.col), row: parseInt(form.row), w: parseInt(form.w), h: parseInt(form.h) })}
            className="flex-1 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg flex items-center justify-center gap-1.5">
            <FaCheck size={10} /> Save Zone
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Room Modal ─────────────────────────────────────────────────────────────
function AddRoomModal({ targetCell, roomTypes, onAdd, onClose }) {
  const typeCodes = Object.keys(roomTypes);
  const [form, setForm] = useState({
    roomNumber: "", type: typeCodes[0] || "", status: "Available",
    bedType: "Single", w: 1, h: 1,
  });
  const [error, setError] = useState("");
  const f   = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const iCls = "w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500";
  const lCls = "block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1";

  const handleAdd = () => {
    if (!form.roomNumber.trim()) return setError("Room number is required.");
    if (!form.type) return setError("No room types available. Add one in Room Type Management first.");
    setError("");
    onAdd({ id: `r-${Date.now()}`, roomNumber: form.roomNumber.trim(), type: form.type,
      status: form.status, bedType: form.bedType,
      col: targetCell.col, row: targetCell.row, w: parseInt(form.w), h: parseInt(form.h) });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Add Room</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Col {targetCell.col}, Row {targetCell.row}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><FaTimes /></button>
        </div>
        <div className="p-4 space-y-3">
          {error && <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800 px-3 py-2 rounded-lg">{error}</p>}
          <div><label className={lCls}>Room Number *</label>
            <input className={iCls} placeholder="e.g. 301" value={form.roomNumber} onChange={f("roomNumber")} autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lCls}>Room Type</label>
              <select className={iCls} value={form.type} onChange={f("type")}>
                {typeCodes.length === 0 && <option value="">No types — add in Room Type Management</option>}
                {typeCodes.map((k) => <option key={k} value={k}>{roomTypes[k].label} ({k})</option>)}
              </select>
            </div>
            <div><label className={lCls}>Status</label>
              <select className={iCls} value={form.status} onChange={f("status")}>
                {Object.keys(STATUS_COLORS).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lCls}>Bed Type</label>
              <select className={iCls} value={form.bedType} onChange={f("bedType")}>
                {["Single","Double","Queen","King","Twin"].map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div><label className={lCls}>Width</label><input className={iCls} type="number" min={1} max={4} value={form.w} onChange={f("w")} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lCls}>Height</label><input className={iCls} type="number" min={1} max={4} value={form.h} onChange={f("h")} /></div>
          </div>
          {form.type && roomTypes[form.type] && (
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-2.5 flex justify-between text-xs">
              <span className="text-slate-400">Nightly rate</span>
              <span className="font-bold text-amber-400">${roomTypes[form.type].rate}/night</span>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-800 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-bold text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800">Cancel</button>
          <button onClick={handleAdd} className="flex-1 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg flex items-center justify-center gap-1.5">
            <FaPlus size={10} /> Add Room
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Room Modal ────────────────────────────────────────────────────────────
function EditRoomModal({ room, roomTypes, onSave, onClose }) {
  const typeCodes = Object.keys(roomTypes);
  const [form, setForm] = useState({ ...room });
  const f   = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const iCls = "w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500";
  const lCls = "block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Edit Room {room.roomNumber}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><FaTimes /></button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lCls}>Room Type</label>
              <select className={iCls} value={form.type} onChange={f("type")}>
                {typeCodes.map((k) => <option key={k} value={k}>{roomTypes[k].label}</option>)}
              </select>
            </div>
            <div><label className={lCls}>Status</label>
              <select className={iCls} value={form.status} onChange={f("status")}>
                {Object.keys(STATUS_COLORS).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lCls}>Bed Type</label>
              <select className={iCls} value={form.bedType || "Single"} onChange={f("bedType")}>
                {["Single","Double","Queen","King","Twin"].map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div><label className={lCls}>Width</label><input className={iCls} type="number" min={1} max={4} value={form.w} onChange={f("w")} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={lCls}>Height</label><input className={iCls} type="number" min={1} max={4} value={form.h} onChange={f("h")} /></div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-800 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-bold text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-800">Cancel</button>
          <button onClick={() => onSave({ ...form, w: parseInt(form.w), h: parseInt(form.h) })}
            className="flex-1 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg flex items-center justify-center gap-1.5">
            <FaCheck size={10} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cell click picker — Room or Zone? ─────────────────────────────────────────
function CellPickerModal({ targetCell, onPickRoom, onPickZone, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xs shadow-2xl p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">What to add?</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><FaTimes /></button>
        </div>
        <p className="text-[11px] text-slate-500">Col {targetCell.col}, Row {targetCell.row}</p>
        <button onClick={onPickRoom}
          className="w-full py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-all">
          🛏 Add Room
        </button>
        <button onClick={onPickZone}
          className="w-full py-3 rounded-xl text-sm font-bold bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-2 transition-all">
          <FaSwimmingPool size={13} /> Add Zone / Area
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function RoomLayoutEditor() {
  const [activeFloor, setActiveFloor] = useState("2");

  // Rooms state
  const [rooms, setRooms]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving]         = useState(false);

  // Zones/amenities state — now loaded from DB
  const [zones, setZones]               = useState([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [savingZone, setSavingZone]     = useState(false);

  // Room types from DB
  const [roomTypes, setRoomTypes]           = useState({});
  const [roomTypesLoading, setRoomTypesLoading] = useState(true);

  // UI state
  const [editMode, setEditMode]         = useState(false);
  const [selected, setSelected]         = useState(null);      // room id
  const [selectedZone, setSelectedZone] = useState(null);      // zone id
  const [editingRoom, setEditingRoom]   = useState(null);
  const [editingZone, setEditingZone]   = useState(null);

  // Cell click picker
  const [pickerCell, setPickerCell]     = useState(null);      // { col, row }
  const [addRoomCell, setAddRoomCell]   = useState(null);
  const [addZoneCell, setAddZoneCell]   = useState(null);

  // Undo/redo (rooms only)
  const [history, setHistory]         = useState([]);
  const [historyIdx, setHistoryIdx]   = useState(-1);
  const [dragState, setDragState]     = useState(null);
  const [toast, setToast]             = useState(null);

  const gridRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load room types ──────────────────────────────────────────────────────────
  const loadRoomTypes = useCallback(async () => {
    setRoomTypesLoading(true);
    try {
      const res  = await fetch("/api/room-types");
      const raw  = await res.json();
      const list = Array.isArray(raw) ? raw : (raw.data ?? raw.room_types ?? []);
      const map  = {};
      list.forEach((rt) => {
        if (rt.code) {
          map[rt.code] = { code: rt.code, label: rt.name, rate: Number(rt.base_price), capacity: rt.capacity };
        }
      });
      setRoomTypes(map);
    } catch (err) {
      console.error("Failed to load room types:", err);
    } finally {
      setRoomTypesLoading(false);
    }
  }, []);

  // ── Load zones from DB ───────────────────────────────────────────────────────
  const loadZones = useCallback(async (floor) => {
    setZonesLoading(true);
    try {
      const res  = await fetch(`/api/floor-layout?floor=${floor}`);
      const data = await res.json();
      setZones(data.success ? data.cells : []);
    } catch (err) {
      console.error("Failed to load zones:", err);
      setZones([]);
    } finally {
      setZonesLoading(false);
    }
  }, []);

  // ── Load rooms from DB ───────────────────────────────────────────────────────
  const loadLayout = useCallback(async (floor) => {
    setLoading(true); setFetchError(null); setSelected(null);
    try {
      const res  = await fetch(`/api/rooms/layout?floor=${floor}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setRooms(data.rooms);
      setHistory([data.rooms]);
      setHistoryIdx(0);
    } catch (err) {
      setFetchError(err.message || "Failed to load rooms.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRoomTypes(); }, [loadRoomTypes]);
  useEffect(() => { loadZones(activeFloor); loadLayout(activeFloor); }, [activeFloor, loadZones, loadLayout]);

  // ── Save rooms ───────────────────────────────────────────────────────────────
  const saveLayout = async () => {
    setSaving(true);
    try {
      const res  = await fetch("/api/rooms/layout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ floor: activeFloor, rooms }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast("success", `Saved — ${data.count} rooms updated.`);
    } catch (err) { showToast("error", err.message || "Save failed."); }
    finally { setSaving(false); }
  };

  // ── Zone CRUD (each change goes to DB immediately) ───────────────────────────
  const handleAddZone = async (zoneData) => {
    setSavingZone(true);
    try {
      const res  = await fetch("/api/floor-layout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...zoneData, floor: activeFloor }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to add zone.");
      showToast("success", `Zone "${zoneData.label}" added.`);
      await loadZones(activeFloor);
    } catch (err) { showToast("error", err.message); }
    finally { setSavingZone(false); setAddZoneCell(null); }
  };

  const handleSaveZone = async (updated) => {
    setSavingZone(true);
    try {
      const res  = await fetch(`/api/floor-layout/${updated.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to update zone.");
      showToast("success", `Zone "${updated.label}" updated.`);
      await loadZones(activeFloor);
    } catch (err) { showToast("error", err.message); }
    finally { setSavingZone(false); setEditingZone(null); }
  };

  const handleDeleteZone = async (id, label) => {
    if (!window.confirm(`Delete zone "${label}"?`)) return;
    try {
      const res  = await fetch(`/api/floor-layout/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      showToast("success", `Zone "${label}" removed.`);
      setSelectedZone(null);
      await loadZones(activeFloor);
    } catch (err) { showToast("error", err.message); }
  };

  // ── Room history/undo ────────────────────────────────────────────────────────
  const pushHistory = useCallback((newRooms) => {
    setHistory((h) => [...h.slice(0, historyIdx + 1), newRooms]);
    setHistoryIdx((i) => i + 1);
    setRooms(newRooms);
  }, [historyIdx]);

  const undo = () => { if (historyIdx <= 0) return; const i = historyIdx-1; setRooms(history[i]); setHistoryIdx(i); setSelected(null); };
  const redo = () => { if (historyIdx >= history.length-1) return; const i = historyIdx+1; setRooms(history[i]); setHistoryIdx(i); };

  // ── Drag rooms ───────────────────────────────────────────────────────────────
  const handleRoomMouseDown = (e, room) => {
    if (!editMode) return;
    e.preventDefault(); e.stopPropagation(); setSelected(room.id); setSelectedZone(null);
    const rect = gridRef.current.getBoundingClientRect();
    setDragState({
      id: room.id,
      offsetCol: Math.floor((e.clientX - rect.left) / CELL_W) + 1 - room.col,
      offsetRow: Math.floor((e.clientY - rect.top)  / CELL_H) + 1 - room.row,
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragState || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const col  = Math.max(1, Math.min(COLS, Math.floor((e.clientX - rect.left) / CELL_W) + 1 - dragState.offsetCol));
    const row  = Math.max(1, Math.min(ROWS, Math.floor((e.clientY - rect.top)  / CELL_H) + 1 - dragState.offsetRow));
    setRooms((prev) => prev.map((r) => r.id === dragState.id ? { ...r, col, row } : r));
  }, [dragState]);

  const handleMouseUp = useCallback(() => {
    if (!dragState) return; pushHistory([...rooms]); setDragState(null);
  }, [dragState, rooms, pushHistory]);

  useEffect(() => {
    if (dragState) { window.addEventListener("mousemove", handleMouseMove); window.addEventListener("mouseup", handleMouseUp); }
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
  }, [dragState, handleMouseMove, handleMouseUp]);

  // ── Occupation helpers ───────────────────────────────────────────────────────
  const isOccupiedByZone = (col, row) =>
    zones.some((a) => col >= a.col && col < a.col + a.w && row >= a.row && row < a.row + a.h);
  const isOccupiedByRoom = (col, row) =>
    rooms.some((r) => col >= r.col && col < r.col + r.w && row >= r.row && row < r.row + r.h);

  // ── Cell click → show picker ─────────────────────────────────────────────────
  const handleCellClick = (col, row) => {
    if (!editMode) return;
    if (isOccupiedByRoom(col, row) || isOccupiedByZone(col, row)) return;
    setPickerCell({ col, row });
    setSelected(null); setSelectedZone(null);
  };

  // ── Room CRUD ────────────────────────────────────────────────────────────────
  const handleAddRoom  = (r) => { pushHistory([...rooms, r]); setAddRoomCell(null); };
  const handleSaveRoom = (r) => { pushHistory(rooms.map((x) => x.id === r.id ? r : x)); setEditingRoom(null); };
  const handleDeleteRoom = (id) => {
    if (!window.confirm("Delete this room?")) return;
    pushHistory(rooms.filter((r) => r.id !== id)); setSelected(null);
  };

  const selectedRoom = rooms.find((r) => r.id === selected);
  const selectedZoneObj = zones.find((z) => z.id === selectedZone);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      <Toast toast={toast} />

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <FaLayerGroup className="text-emerald-400" size={16} />
          <div>
            <h1 className="text-sm font-black tracking-tight">Floor Layout Editor</h1>
            <p className="text-[10px] text-slate-500">
              {loading ? "Loading…" : `Floor ${activeFloor} · ${rooms.length} rooms · ${zones.length} zones`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            {["1","2","3","4"].map((f) => (
              <button key={f} onClick={() => setActiveFloor(f)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeFloor === f ? "bg-slate-600 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                Flr {f}
              </button>
            ))}
          </div>
          {editMode && (
            <>
              <button onClick={undo} disabled={historyIdx <= 0} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"><FaUndo size={12}/></button>
              <button onClick={redo} disabled={historyIdx >= history.length-1} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"><FaRedo size={12}/></button>
            </>
          )}
          <div className="hidden lg:flex items-center gap-1.5">
            {Object.entries(STATUS_COLORS).map(([s, cls]) => (
              <span key={s} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${cls}`}>{s}</span>
            ))}
          </div>
          <button onClick={() => { setEditMode((e) => !e); setSelected(null); setSelectedZone(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${editMode ? "bg-amber-500 text-slate-950" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>
            {editMode ? <><FaLockOpen size={11}/> Editing</> : <><FaLock size={11}/> View Only</>}
          </button>
          {editMode && (
            <button onClick={saveLayout} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-60">
              {saving ? <><Spinner size={11}/> Saving…</> : <><FaSave size={11}/> Save Rooms</>}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Grid */}
        <div className="flex-1 overflow-auto p-6">
          {editMode && (
            <div className="mb-4 flex items-center gap-2 text-xs text-amber-400/80 bg-amber-950/30 border border-amber-900/40 rounded-xl px-4 py-2.5 w-fit">
              <FaArrowsAlt size={11}/>
              <span>
                <strong>Drag rooms</strong> to move ·
                <strong> Click empty cell</strong> → choose Room or Zone ·
                <strong> Click zone</strong> to select and edit it
              </span>
            </div>
          )}

          {loading && <div className="flex items-center justify-center h-64 text-slate-500 gap-2 text-sm"><Spinner/> Loading…</div>}

          {fetchError && !loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-rose-400 text-sm">
              <FaExclamationTriangle size={24}/>
              <p className="font-bold">{fetchError}</p>
              <button onClick={() => loadLayout(activeFloor)} className="text-xs bg-rose-950/40 border border-rose-800 px-3 py-1.5 rounded-lg">Retry</button>
            </div>
          )}

          {!loading && !fetchError && (
            <div ref={gridRef}
              className="relative border border-slate-700 rounded-xl overflow-hidden select-none bg-slate-900"
              style={{ width: COLS*CELL_W, height: ROWS*CELL_H, minWidth: COLS*CELL_W }}>

              {/* Background cells */}
              {Array.from({ length: ROWS }, (_, ri) => Array.from({ length: COLS }, (_, ci) => {
                const col = ci+1, row = ri+1;
                const free = !isOccupiedByZone(col,row) && !isOccupiedByRoom(col,row);
                return (
                  <div key={`bg-${col}-${row}`}
                    onClick={() => handleCellClick(col, row)}
                    className={`absolute border border-slate-800/50 ${editMode && free ? "hover:bg-slate-700/40 cursor-crosshair" : ""}`}
                    style={{ left: ci*CELL_W, top: ri*CELL_H, width: CELL_W, height: CELL_H }} />
                );
              }))}

              {/* + hints */}
              {editMode && Array.from({ length: ROWS }, (_, ri) => Array.from({ length: COLS }, (_, ci) => {
                const col = ci+1, row = ri+1;
                if (isOccupiedByZone(col,row) || isOccupiedByRoom(col,row)) return null;
                return (
                  <div key={`plus-${col}-${row}`}
                    className="absolute flex items-center justify-center text-slate-700 pointer-events-none"
                    style={{ left: ci*CELL_W, top: ri*CELL_H, width: CELL_W, height: CELL_H }}>
                    <FaPlus size={9}/>
                  </div>
                );
              }))}

              {/* Zones (from DB) */}
              {zones.map((z) => {
                const typeInfo  = ZONE_TYPES[z.type] || ZONE_TYPES.custom;
                const isSelZone = selectedZone === z.id;
                return (
                  <div key={`zone-${z.id}`}
                    onClick={(e) => { if (!editMode) return; e.stopPropagation(); setSelectedZone(z.id); setSelected(null); }}
                    className={`absolute flex items-center justify-center text-[10px] font-bold uppercase tracking-widest border transition-all
                      ${typeInfo.style}
                      ${editMode ? "cursor-pointer" : ""}
                      ${isSelZone ? "ring-2 ring-white z-20" : "z-10"}
                    `}
                    style={{ left:(z.col-1)*CELL_W, top:(z.row-1)*CELL_H, width:z.w*CELL_W, height:z.h*CELL_H }}>
                    <span style={z.vertical ? { writingMode:"vertical-rl", transform:"rotate(180deg)" } : {}}>
                      {z.label}
                    </span>
                    {/* Emergency exit special icon */}
                    {z.type === "emergency_exit" && (
                      <FaDoorOpen size={11} className="ml-1 opacity-70" />
                    )}
                  </div>
                );
              })}

              {/* Rooms */}
              {rooms.map((room) => {
                const isSelected = selected === room.id;
                const isDragging = dragState?.id === room.id;
                const cls = STATUS_COLORS[room.status] || STATUS_COLORS.Available;
                return (
                  <div key={room.id}
                    onMouseDown={(e) => handleRoomMouseDown(e, room)}
                    onClick={(e) => { e.stopPropagation(); if (!dragState) { setSelected(room.id); setSelectedZone(null); } }}
                    className={`absolute flex flex-col items-center justify-center text-center rounded-sm border-2
                      ${cls}
                      ${editMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
                      ${isSelected ? "!border-white shadow-[0_0_0_2px_rgba(255,255,255,0.5)] z-20" : "hover:brightness-110 z-10"}
                      ${isDragging ? "opacity-75 shadow-2xl z-30 scale-105" : ""}`}
                    style={{ left:(room.col-1)*CELL_W+2, top:(room.row-1)*CELL_H+2, width:room.w*CELL_W-4, height:room.h*CELL_H-4,
                      transition: isDragging ? "none" : "box-shadow 0.1s" }}>
                    <span className="text-[9px] font-bold uppercase opacity-70 leading-none">{roomTypes[room.type]?.label ?? room.type}</span>
                    <span className="text-xs font-black leading-tight mt-0.5">{room.roomNumber}</span>
                    {room.h > 1 && <span className="text-[9px] opacity-60 mt-0.5">{room.status}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-64 bg-slate-900 border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto">

          {/* Selected Room */}
          {(selectedRoom || (!selectedRoom && !selectedZoneObj)) && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${selectedRoom ? "bg-amber-400 animate-pulse" : "bg-slate-700"}`}/>
                Selected Room
              </p>
              {selectedRoom ? (
                <div className="space-y-3">
                  <div className={`rounded-xl p-3 text-center border-2 ${STATUS_COLORS[selectedRoom.status]}`}>
                    <p className="text-[10px] font-bold uppercase opacity-70">{roomTypes[selectedRoom.type]?.label ?? selectedRoom.type}</p>
                    <p className="text-2xl font-black">{selectedRoom.roomNumber}</p>
                    <p className="text-[10px] font-bold opacity-80">{selectedRoom.status}</p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {[
                      ["Position", `Col ${selectedRoom.col}, Row ${selectedRoom.row}`],
                      ["Size",     `${selectedRoom.w} × ${selectedRoom.h} cells`],
                      ["Bed Type", selectedRoom.bedType || "—"],
                      ["Rate",     roomTypes[selectedRoom.type]?.rate != null ? `$${roomTypes[selectedRoom.type].rate}/night` : "—"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between p-2 bg-slate-800/60 rounded-lg border border-slate-700/30">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-slate-200 font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                  {editMode && (
                    <div className="space-y-2">
                      <button onClick={() => setEditingRoom(selectedRoom)}
                        className="w-full py-2 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-1.5">
                        <FaEdit size={10}/> Edit Room
                      </button>
                      <button onClick={() => handleDeleteRoom(selectedRoom.id)}
                        className="w-full py-2 rounded-lg text-xs font-bold bg-rose-900/40 hover:bg-rose-900/70 text-rose-300 border border-rose-800/40 flex items-center justify-center gap-1.5">
                        <FaTrash size={10}/> Delete Room
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-600 space-y-1">
                  <FaEye size={18} className="mx-auto opacity-30"/>
                  <p className="text-[11px]">{editMode ? "Click a cell to add,\nor select a room/zone." : "Click to inspect."}</p>
                </div>
              )}
            </div>
          )}

          {/* Selected Zone */}
          {selectedZoneObj && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"/>
                Selected Zone
              </p>
              <div className="space-y-3">
                <div className={`rounded-xl p-3 text-center border ${ZONE_TYPES[selectedZoneObj.type]?.style || ""}`}>
                  <p className="text-[10px] font-bold uppercase opacity-70">{ZONE_TYPES[selectedZoneObj.type]?.label}</p>
                  <p className="text-lg font-black">{selectedZoneObj.label}</p>
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    ["Position", `Col ${selectedZoneObj.col}, Row ${selectedZoneObj.row}`],
                    ["Size",     `${selectedZoneObj.w} × ${selectedZoneObj.h} cells`],
                    ["Vertical", selectedZoneObj.vertical ? "Yes" : "No"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between p-2 bg-slate-800/60 rounded-lg border border-slate-700/30">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-200 font-bold">{value}</span>
                    </div>
                  ))}
                </div>
                {editMode && (
                  <div className="space-y-2">
                    <button onClick={() => setEditingZone(selectedZoneObj)}
                      className="w-full py-2 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-1.5">
                      <FaEdit size={10}/> Edit Zone
                    </button>
                    <button onClick={() => handleDeleteZone(selectedZoneObj.id, selectedZoneObj.label)}
                      className="w-full py-2 rounded-lg text-xs font-bold bg-rose-900/40 hover:bg-rose-900/70 text-rose-300 border border-rose-800/40 flex items-center justify-center gap-1.5">
                      <FaTrash size={10}/> Delete Zone
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floor stats */}
          <div className="border-t border-slate-800 pt-4 mt-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Floor {activeFloor}</p>
            {Object.keys(STATUS_COLORS).map((s) => {
              const count = rooms.filter((r) => r.status === s).length;
              if (!count) return null;
              return (
                <div key={s} className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500">{s}</span>
                  <span className="font-bold text-slate-300">{count}</span>
                </div>
              );
            })}
            <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-800">
              <span className="text-slate-400 font-bold">Rooms</span>
              <span className="font-black text-white">{rooms.length}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-slate-400 font-bold">Zones</span>
              <span className="font-black text-white">{zones.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {pickerCell && (
        <CellPickerModal
          targetCell={pickerCell}
          onPickRoom={() => { setAddRoomCell(pickerCell); setPickerCell(null); }}
          onPickZone={() => { setAddZoneCell(pickerCell); setPickerCell(null); }}
          onClose={() => setPickerCell(null)}
        />
      )}
      {addRoomCell && !roomTypesLoading &&
        <AddRoomModal targetCell={addRoomCell} roomTypes={roomTypes} onAdd={handleAddRoom} onClose={() => setAddRoomCell(null)} />}
      {addZoneCell &&
        <AddZoneModal targetCell={addZoneCell} onAdd={handleAddZone} onClose={() => setAddZoneCell(null)} />}
      {editingRoom &&
        <EditRoomModal room={editingRoom} roomTypes={roomTypes} onSave={handleSaveRoom} onClose={() => setEditingRoom(null)} />}
      {editingZone &&
        <EditZoneModal zone={editingZone} onSave={handleSaveZone} onClose={() => setEditingZone(null)} />}
    </div>
  );
}
