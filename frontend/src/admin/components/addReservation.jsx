import { useState, useEffect } from "react";
import {
  FaTimes, FaMinus, FaSearch, FaUpload, FaCheck, FaCalculator, FaChevronRight
} from "react-icons/fa";

const inp = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder-slate-400 bg-slate-50/50 hover:bg-yellow-50/40 hover:border-yellow-300 focus:bg-white";
const sel = inp + " appearance-none pr-10 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat";
const lbl = "block text-xs font-semibold text-slate-600 mb-1.5 ml-0.5";
const sec = "space-y-6";

function FileUpload({ label, name, value, onChange }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-yellow-500 hover:bg-yellow-50/30 transition-all group relative bg-slate-50/50 overflow-hidden">
        {value ? (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
            <FaCheck size={12} />
            <span className="text-xs font-semibold max-w-[150px] truncate">{value.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-slate-400 group-hover:text-yellow-600 transition-colors">
            <FaUpload size={16} className="group-hover:-translate-y-0.5 transition-transform" />
            <span className="text-xs font-medium">Upload Document</span>
            <span className="text-[10px] text-slate-400">PDF, PNG, JPG</span>
          </div>
        )}
        <input type="file" name={name} accept="image/*,.pdf"
          onChange={(e) => onChange(name, e.target.files[0])}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
      </label>
    </div>
  );
}

const EMPTY = {
  // step 1 -> guests table
  guestSearch: "", guestId: null,
  firstName: "", lastName: "", phone: "", email: "",
  nationality: "", idType: "Passport", idNumber: "",
  idFront: null, idBack: null, isVip: false,

  // step 2 -> reservations table
  reservationId: null,
  roomNumber: "", roomType: "", floor: "", bedType: "", ratePerNight: 0,
  checkIn: "", checkOut: "", adults: 1, children: 0,
  bookingSource: "Direct", specialRequests: "", reservationStatus: "Confirmed",
  nights: 0, roomCharge: 0, extraPersonCharge: 0, taxAmount: 0, totalAmount: 0,

  // step 3 -> payments table
  depositAmount: "", paymentMethod: "cash", transactionNo: "", paymentProof: null,
};

export default function AddReservation({
  isOpen, isMinimized = false, mode = "new", reservationId = null,
  onClose, onMinimize, onSave,
}) {
  const [form, setForm]               = useState(EMPTY);
  const [currentStep, setCurrentStep] = useState(1);
  const [additionalGuests, setAdditionalGuests] = useState([]);
  const [guestResults, setGuestResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [stepError, setStepError] = useState("");

  // Tracks records that THIS session created (vs. an existing guest picked
  // from search, or a reservation that already had a payment). Only records
  // flagged here get rolled back if the user cancels out of the flow.
  const [guestCreatedThisSession, setGuestCreatedThisSession] = useState(false);
  const [reservationCreatedThisSession, setReservationCreatedThisSession] = useState(false);

  // CHECK-IN MODE: load the existing reservation + guests and prefill the form.
  useEffect(() => {
    if (mode !== "checkin" || !reservationId || !isOpen) return;

    const loadDetail = async () => {
      setSaving(true);
      setStepError("");
      try {
        const res = await fetch(`/api/reservations/${reservationId}/detail`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Failed to load reservation for check-in");
        const data = await res.json();
        const r = data.reservation;

        setForm((p) => ({
          ...p,
          guestId: r.guestId, guestSearch: `${r.firstName} ${r.lastName}`,
          firstName: r.firstName, lastName: r.lastName, phone: r.phone,
          email: r.email, nationality: r.nationality, idType: r.idType,
          idNumber: r.idNumber, isVip: r.isVip,
          reservationId: r.reservationId,
          roomNumber: r.roomNumber, roomType: r.roomType, ratePerNight: r.ratePerNight,
          checkIn: r.checkIn, checkOut: r.checkOut, adults: r.adults, children: r.children,
          bookingSource: r.bookingSource, specialRequests: r.specialRequests,
          reservationStatus: r.reservationStatus,
          nights: r.nights, roomCharge: r.roomCharge, extraPersonCharge: r.extraPersonCharge,
          taxAmount: r.taxAmount, totalAmount: r.totalAmount,
        }));

        setAdditionalGuests((data.additionalGuests || []).map((g) => ({
          localId: `existing_${g.guestId}`,
          guestId: g.guestId, guestSearch: `${g.firstName} ${g.lastName}`,
          firstName: g.firstName, lastName: g.lastName, phone: g.phone,
          email: g.email, nationality: g.nationality, idNumber: g.idNumber,
          idType: "Passport", guestType: g.guestType,
          idFront: null, idBack: null,
          saved: true, savedGuestId: g.guestId, createdThisSession: false, error: "",
          guestResults: [],
        })));

        setCurrentStep(1);
      } catch (err) {
        setStepError(err.message);
      } finally {
        setSaving(false);
      }
    };

    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, reservationId, isOpen]);

  // live client-side preview only — server recalculates authoritatively on step 2 submit
  useEffect(() => {
    if (!form.checkIn || !form.checkOut) return;
    const nights      = Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000));
    const totalGuests = (parseInt(form.adults) || 0) + (parseInt(form.children) || 0);
    const roomCharge  = nights * form.ratePerNight;
    const extra       = Math.max(0, totalGuests - 2) * 20 * nights;
    const tax         = (roomCharge + extra) * 0.1;
    const total       = roomCharge + extra + tax;
    setForm((p) => ({ ...p, nights, roomCharge, extraPersonCharge: extra, taxAmount: tax, totalAmount: total }));
  }, [form.checkIn, form.checkOut, form.ratePerNight, form.adults, form.children]);

  const remainingAmount = Math.max(0, form.totalAmount - (parseFloat(form.depositAmount) || 0));

  const set   = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const field = (key) => (e) => set(key, e.target.value);

  const handleGuestSearch = async (query) => {
    set("guestSearch", query);
    if (query.length < 2) return setGuestResults([]);
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/guests/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setGuestResults(data.guests || []);
    } catch { setGuestResults([]); }
    finally { setSearchLoading(false); }
  };

  const selectGuest = (guest) => {
    setForm((p) => ({
      ...p,
      guestSearch: `${guest.first_name} ${guest.last_name}`,
      guestId: guest.guest_id, firstName: guest.first_name,
      lastName: guest.last_name, phone: guest.phone,
      email: guest.email, nationality: guest.nationality,
      idNumber: guest.id_number, isVip: guest.is_vip || false,
    }));
    setGuestResults([]);
    // Picked an existing guest — nothing created this session for them.
    setGuestCreatedThisSession(false);
  };

  const handleRoomSelect = async (roomNumber) => {
    set("roomNumber", roomNumber);
    if (!roomNumber) return;
    try {
      const res  = await fetch(`/api/rooms/${roomNumber}`);
      const data = await res.json();
      if (data.room) {
        setForm((p) => ({
          ...p, roomNumber,
          roomType:     data.room.room_type?.name || "",
          floor:        data.room.floor,
          bedType:      data.room.bed_type,
          ratePerNight: parseFloat(data.room.room_type?.base_price) || 0,
        }));
      }
    } catch {}
  };

  useEffect(() => {
    if (!form.checkIn || !form.checkOut) return;
    fetch(`/api/rooms/available?check_in=${form.checkIn}&check_out=${form.checkOut}`)
      .then((r) => r.json())
      .then((d) => setAvailableRooms(d.rooms || []))
      .catch(() => setAvailableRooms([]));
  }, [form.checkIn, form.checkOut]);

  // STEP 1 -> POST /api/guests
  const submitStep1 = async () => {
    setStepError("");
    if (form.guestId) { setCurrentStep(2); return; } // already picked an existing guest

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("firstName", form.firstName);
      payload.append("lastName", form.lastName);
      payload.append("phone", form.phone);
      if (form.email) payload.append("email", form.email);
      if (form.nationality) payload.append("nationality", form.nationality);
      payload.append("idType", form.idType);
      payload.append("idNumber", form.idNumber);
      payload.append("isVip", form.isVip ? "1" : "0");
      if (form.idFront) payload.append("idFront", form.idFront);
      if (form.idBack) payload.append("idBack", form.idBack);

      const res = await fetch("/api/guests", { method: "POST", headers: { Accept: "application/json" }, body: payload });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to save guest");
      const data = await res.json();

      set("guestId", data.guest.guest_id);
      setGuestCreatedThisSession(true); // we created this guest — eligible for rollback on cancel
      setCurrentStep(2);
    } catch (err) {
      setStepError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // STEP 2 -> POST /api/reservations (skipped in checkin mode, reservation already exists)
  const submitStep2 = async () => {
    setStepError("");
    setSaving(true);
    try {
      let reservationIdLocal = form.reservationId;

      if (!reservationIdLocal) {
        const res = await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            guestId: form.guestId,
            roomNumber: form.roomNumber,
            checkIn: form.checkIn,
            checkOut: form.checkOut,
            adults: form.adults,
            children: form.children,
            bookingSource: form.bookingSource,
            specialRequests: form.specialRequests,
            reservationStatus: form.reservationStatus,
          }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to save reservation");
        const data = await res.json();

        reservationIdLocal = data.reservation.reservationId;
        setForm((p) => ({
          ...p,
          reservationId: reservationIdLocal,
          nights: data.reservation.nights,
          roomCharge: data.reservation.roomCharge,
          extraPersonCharge: data.reservation.extraPersonCharge,
          taxAmount: data.reservation.taxAmount,
          totalAmount: data.reservation.totalAmount,
        }));
        setReservationCreatedThisSession(true);
      }

      // persist any additional guests sharing this room
      for (const g of additionalGuests) {
        if (g.saved) continue;
        if (!g.guestId && (!g.firstName || !g.lastName || !g.phone || !g.idNumber)) {
          throw new Error("Please complete all required fields for each added guest, or remove them.");
        }

        const gPayload = new FormData();
        if (g.guestId) {
          gPayload.append("guestId", g.guestId);
        } else {
          gPayload.append("firstName", g.firstName);
          gPayload.append("lastName", g.lastName);
          gPayload.append("phone", g.phone);
          if (g.email) gPayload.append("email", g.email);
          if (g.nationality) gPayload.append("nationality", g.nationality);
          gPayload.append("idType", g.idType);
          gPayload.append("idNumber", g.idNumber);
          if (g.idFront) gPayload.append("idFront", g.idFront);
          if (g.idBack) gPayload.append("idBack", g.idBack);
        }
        gPayload.append("guestType", g.guestType);

        const gRes = await fetch(`/api/reservations/${reservationIdLocal}/guests`, {
          method: "POST", headers: { Accept: "application/json" }, body: gPayload,
        });
        if (!gRes.ok) throw new Error((await gRes.json().catch(() => ({}))).message || "Failed to add additional guest");
        const gData = await gRes.json();

        setAdditionalGuests((prev) => prev.map((row) => (row.localId === g.localId
          ? { ...row, saved: true, savedGuestId: gData.guest.guest_id, createdThisSession: gData.guestCreated }
          : row)));
      }

      setCurrentStep(3);
    } catch (err) {
      setStepError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // STEP 3 -> POST /api/payments (new mode) OR POST /api/reservations/{id}/check-in (checkin mode)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStepError("");
    setSaving(true);
    try {
      const endpoint = mode === "checkin"
        ? `/api/reservations/${form.reservationId}/check-in`
        : "/api/payments";

      const payload = new FormData();
      if (mode !== "checkin") payload.append("reservationId", form.reservationId);
      if (mode === "checkin" && form.guestId) payload.append("guestId", form.guestId);
      payload.append("depositAmount", form.depositAmount || 0);
      payload.append("paymentMethod", form.paymentMethod);
      if (form.transactionNo) payload.append("transactionNo", form.transactionNo);
      if (form.paymentProof) payload.append("paymentProof", form.paymentProof);

      const res = await fetch(endpoint, { method: "POST", headers: { Accept: "application/json" }, body: payload });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to save");
      const data = await res.json();
      onSave(data.booking);
      setForm(EMPTY);
      setAdditionalGuests([]);
      setCurrentStep(1);
      setGuestCreatedThisSession(false);
      setReservationCreatedThisSession(false);
    } catch (err) {
      setStepError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Minimize: just tell the parent, nothing else changes. The component
  // stays mounted (parent hides it with a CSS class), so all state
  // (currentStep, guestId, reservationId, every field) survives untouched.
  const handleMinimize = () => {
    onMinimize?.(currentStep);
  };

  // Cancel / X: roll back anything THIS session committed but never
  // finished, then reset and close for real. In checkin mode nothing new
  // was created (we're editing an existing reservation), so no rollback runs.
  const handleClose = async () => {
    setSaving(true);
    try {
      if (mode !== "checkin") {
        for (const g of additionalGuests) {
          if (g.createdThisSession && g.savedGuestId) {
            await fetch(`/api/guests/${g.savedGuestId}`, {
              method: "DELETE", headers: { Accept: "application/json" },
            }).catch(() => {});
          }
        }

        if (guestCreatedThisSession && form.guestId) {
          await fetch(`/api/guests/${form.guestId}`, {
            method: "DELETE", headers: { Accept: "application/json" },
          }).catch(() => {});
        } else if (reservationCreatedThisSession && form.reservationId) {
          await fetch(`/api/reservations/${form.reservationId}`, {
            method: "DELETE", headers: { Accept: "application/json" },
          }).catch(() => {});
        }
      }
    } finally {
      setForm(EMPTY);
      setAdditionalGuests([]);
      setCurrentStep(1);
      setGuestCreatedThisSession(false);
      setReservationCreatedThisSession(false);
      setStepError("");
      setSaving(false);
      onClose();
    }
  };

  const makeGuestRow = () => ({
    localId: `g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    guestId: null, guestSearch: "", guestResults: [],
    firstName: "", lastName: "", phone: "", email: "", nationality: "",
    idType: "Passport", idNumber: "", guestType: "Adult",
    idFront: null, idBack: null,
    saved: false, savedGuestId: null, createdThisSession: false, error: "",
  });

  const addGuestRow    = () => setAdditionalGuests((p) => [...p, makeGuestRow()]);
  const removeGuestRow = (localId) => setAdditionalGuests((p) => p.filter((g) => g.localId !== localId));
  const updateGuestRow = (localId, key, val) =>
    setAdditionalGuests((p) => p.map((g) => (g.localId === localId ? { ...g, [key]: val, error: "" } : g)));

  const searchGuestForRow = async (localId, query) => {
    updateGuestRow(localId, "guestSearch", query);
    if (query.length < 2) { updateGuestRow(localId, "guestResults", []); return; }
    try {
      const res = await fetch(`/api/guests/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setAdditionalGuests((p) => p.map((g) => (g.localId === localId ? { ...g, guestResults: data.guests || [] } : g)));
    } catch {
      setAdditionalGuests((p) => p.map((g) => (g.localId === localId ? { ...g, guestResults: [] } : g)));
    }
  };

  const selectGuestForRow = (localId, guest) => {
    setAdditionalGuests((p) => p.map((g) => (g.localId === localId ? {
      ...g,
      guestId: guest.guest_id, guestSearch: `${guest.first_name} ${guest.last_name}`,
      firstName: guest.first_name, lastName: guest.last_name, phone: guest.phone,
      email: guest.email, nationality: guest.nationality, idNumber: guest.id_number,
      guestResults: [],
    } : g)));
  };

  if (!isOpen) return null;

  const fmt = (n) => `$${(parseFloat(n) || 0).toFixed(2)}`;
  const steps = ["Guest Info", "Room & Stay", "Payment"];
  const isCheckin = mode === "checkin";

  return (
    <div className={`fixed inset-0 z-50 ${isMinimized ? "hidden" : "flex"} items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity`}>
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden max-h-[90vh] transition-all scale-100">

        <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-white flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isCheckin ? "Guest Check-In" : "New Reservation"}
            </h2>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={handleMinimize} title="Minimize"
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 border border-transparent transition">
                <FaMinus size={14} />
              </button>
              <button type="button" onClick={handleClose} title="Cancel"
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 border border-transparent transition">
                <FaTimes size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center w-full bg-slate-50 p-1.5 rounded-2xl">
            {steps.map((label, idx) => {
              const s = idx + 1;
              const isCurrent = currentStep === s;
              const isPast = s < currentStep;
              return (
                <div key={s} className="flex-1 flex items-center justify-center last:flex-none">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold w-full justify-center md:justify-start ${
                      isCurrent ? "bg-white text-yellow-700 shadow-sm"
                      : isPast ? "text-emerald-600"
                      : "text-slate-400"
                    }`}>
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isCurrent ? "bg-yellow-500 text-slate-900"
                      : isPast ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-200/60 text-slate-500"
                    }`}>
                      {isPast ? <FaCheck size={9} /> : s}
                    </span>
                    <span className="hidden md:inline tracking-wide">{label}</span>
                  </div>
                  {idx < steps.length - 1 && <FaChevronRight size={10} className="mx-2 text-slate-300 hidden md:block" />}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {stepError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
                {stepError}
              </div>
            )}

            {currentStep === 1 && (
              <div className={sec}>
                <div>
                  <label className={lbl}>Search Profile</label>
                  <div className="relative">
                    <FaSearch size={14} className="text-slate-400 pointer-events-none"
                      style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", zIndex: 2 }} />
                    <input className={inp} style={{ paddingLeft: "44px" }}
                      placeholder="Search by name, email, or phone…"
                      value={form.guestSearch} onChange={(e) => handleGuestSearch(e.target.value)}
                      disabled={isCheckin} />
                    {searchLoading && <div className="absolute right-4 top-3 w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  {guestResults.length > 0 && (
                    <div className="mt-2 border border-slate-100 rounded-xl overflow-hidden shadow-xl bg-white max-h-48 overflow-y-auto z-10 relative">
                      {guestResults.map((g) => (
                        <button key={g.guest_id} type="button" onClick={() => selectGuest(g)}
                          className="w-full text-left px-4 py-3 hover:bg-yellow-50/50 text-sm flex justify-between items-center border-b border-slate-50 last:border-0">
                          <span className="font-semibold text-slate-800">{g.first_name} {g.last_name}</span>
                          <span className="text-slate-500 text-xs">{g.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {form.guestId && (
                    <p className="text-xs text-emerald-600 font-semibold mt-2">
                      ✓ {isCheckin ? "Existing reservation guest" : "Using existing guest profile"} — manual fields below are ignored.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 my-2">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="font-medium bg-white px-2 text-slate-400">Manual Registration</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={lbl}>First Name *</label>
                    <input className={inp} placeholder="John" value={form.firstName} onChange={field("firstName")} required disabled={!!form.guestId} /></div>
                  <div><label className={lbl}>Last Name *</label>
                    <input className={inp} placeholder="Smith" value={form.lastName} onChange={field("lastName")} required disabled={!!form.guestId} /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={lbl}>Phone Number *</label>
                    <input className={inp} type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={field("phone")} required disabled={!!form.guestId} /></div>
                  <div><label className={lbl}>Email Address</label>
                    <input className={inp} type="email" placeholder="john.smith@example.com" value={form.email} onChange={field("email")} disabled={!!form.guestId} /></div>
                </div>

                <div><label className={lbl}>Nationality</label>
                  <input className={inp} placeholder="e.g. Canadian, Japanese" value={form.nationality} onChange={field("nationality")} disabled={!!form.guestId} /></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1"><label className={lbl}>ID Type *</label>
                    <select className={sel} value={form.idType} onChange={field("idType")} required disabled={!!form.guestId}>
                      <option value="Passport">Passport</option>
                      <option value="NRC">NRC</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="National ID">National ID</option>
                    </select></div>
                  <div className="md:col-span-2"><label className={lbl}>Identification Document Number *</label>
                    <input className={inp} placeholder="Document serial identifier..." value={form.idNumber} onChange={field("idNumber")} required disabled={!!form.guestId} /></div>
                </div>

                {!form.guestId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FileUpload label="ID Document (Front)" name="idFront" value={form.idFront} onChange={(k,v) => set(k,v)} />
                    <FileUpload label="ID Document (Back)"  name="idBack"  value={form.idBack}  onChange={(k,v) => set(k,v)} />
                  </div>
                )}

                {form.guestId && !isCheckin && (
                  <button type="button" onClick={() => setForm((p) => ({ ...p, guestId: null, guestSearch: "" }))}
                    className="text-xs font-semibold text-slate-500 underline">
                    Clear selection and enter a different guest
                  </button>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className={sec}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={lbl}>Check-in Date *</label>
                    <input className={inp} type="date" value={form.checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={field("checkIn")} required disabled={isCheckin} /></div>
                  <div><label className={lbl}>Check-out Date *</label>
                    <input className={inp} type="date" value={form.checkOut}
                      min={form.checkIn || new Date().toISOString().split("T")[0]}
                      onChange={field("checkOut")} required disabled={isCheckin} /></div>
                </div>

                {form.nights > 0 && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-yellow-800 font-bold bg-yellow-50 border border-yellow-100 px-3 py-2 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    Calculated Term: {form.nights} night{form.nights > 1 ? "s" : ""}
                  </div>
                )}

                <div>
                  <label className={lbl}>Assigned Room Number *</label>
                  {isCheckin ? (
                    <input className={inp} value={form.roomNumber} disabled />
                  ) : availableRooms.length > 0 ? (
                    <select className={sel} value={form.roomNumber}
                      onChange={(e) => handleRoomSelect(e.target.value)} required>
                      <option value="">— Select an available unit —</option>
                      {availableRooms.map((r) => (
                        <option key={r.room_number} value={r.room_number}>
                          Room {r.room_number} — {r.room_type?.name} (Floor {r.floor})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input className={inp} placeholder="Enter room index manually (e.g. 304)"
                      value={form.roomNumber} onChange={(e) => handleRoomSelect(e.target.value)} required />
                  )}
                </div>

                {form.roomType && (
                  <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div><span className="block text-[10px] font-bold text-slate-400 uppercase">Type</span>
                      <span className="text-sm font-semibold text-slate-700">{form.roomType}</span></div>
                    <div><span className="block text-[10px] font-bold text-slate-400 uppercase">Floor</span>
                      <span className="text-sm font-semibold text-slate-700">{form.floor}</span></div>
                    <div><span className="block text-[10px] font-bold text-slate-400 uppercase">Beds</span>
                      <span className="text-sm font-semibold text-slate-700">{form.bedType}</span></div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={lbl}>Adults *</label>
                    <input className={inp} type="number" min="1" placeholder="1" value={form.adults} onChange={field("adults")} required disabled={isCheckin} /></div>
                  <div><label className={lbl}>Children</label>
                    <input className={inp} type="number" min="0" placeholder="0" value={form.children} onChange={field("children")} disabled={isCheckin} /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={lbl}>Booking Source</label>
                    <select className={sel} value={form.bookingSource} onChange={field("bookingSource")} disabled={isCheckin}>
                      <option value="Direct">Direct</option>
                      <option value="Website">Website</option>
                      <option value="Walk-in">Walk-in</option>
                      <option value="Phone">Phone</option>
                      <option value="OTA">OTA</option>
                      <option value="Airbnb">Airbnb</option>
                      <option value="Booking.com">Booking.com</option>
                    </select></div>
                  <div><label className={lbl}>Reservation Status *</label>
                    <select className={sel} value={form.reservationStatus} onChange={field("reservationStatus")} disabled={isCheckin}>
                      <option value="Reserved">Reserved</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked-In">Checked In</option>
                    </select></div>
                </div>

                <div><label className={lbl}>Special Requests & Operational Notes</label>
                  <textarea className={inp + " resize-none h-24"}
                    placeholder="text . ."
                    value={form.specialRequests} onChange={field("specialRequests")} disabled={isCheckin} /></div>

                {((parseInt(form.adults) || 0) + (parseInt(form.children) || 0)) > 1 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <label className={lbl + " mb-0"}>Additional Guests in This Room</label>
                      <button type="button" onClick={addGuestRow}
                        className="text-xs font-bold text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 px-3 py-1.5 rounded-lg transition">
                        + Add New Guest
                      </button>
                    </div>

                    {additionalGuests.length === 0 && (
                      <p className="text-xs text-slate-400">No additional guests added yet.</p>
                    )}

                    <div className="space-y-4">
                      {additionalGuests.map((g, idx) => (
                        <div key={g.localId} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 relative">
                          <button type="button" onClick={() => removeGuestRow(g.localId)} disabled={g.saved}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 disabled:opacity-30">
                            <FaTimes size={14} />
                          </button>

                          <div className="flex items-center justify-between mb-3 pr-6">
                            <span className="text-xs font-bold text-slate-500">Guest #{idx + 2}</span>
                            {g.saved && <span className="text-[10px] font-bold text-emerald-600">✓ Saved</span>}
                          </div>

                          {g.error && <p className="text-xs text-red-600 mb-2">{g.error}</p>}

                          <div className="relative mb-3">
                            <FaSearch size={12} className="text-slate-400 pointer-events-none"
                              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                            <input className={inp + " py-2.5"} style={{ paddingLeft: "38px" }}
                              placeholder="Search existing guest…" value={g.guestSearch} disabled={g.saved}
                              onChange={(e) => searchGuestForRow(g.localId, e.target.value)} />
                            {g.guestResults?.length > 0 && (
                              <div className="mt-1 border border-slate-100 rounded-xl overflow-hidden shadow-lg bg-white max-h-40 overflow-y-auto absolute w-full z-10">
                                {g.guestResults.map((res) => (
                                  <button key={res.guest_id} type="button" onClick={() => selectGuestForRow(g.localId, res)}
                                    className="w-full text-left px-3 py-2 hover:bg-yellow-50/50 text-xs flex justify-between border-b border-slate-50 last:border-0">
                                    <span className="font-semibold text-slate-800">{res.first_name} {res.last_name}</span>
                                    <span className="text-slate-500">{res.phone}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {g.guestId ? (
                            <p className="text-xs text-emerald-600 font-semibold mb-2">
                              Using existing profile: {g.firstName} {g.lastName}
                            </p>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input className={inp + " py-2.5"} placeholder="First Name *" value={g.firstName} disabled={g.saved}
                                  onChange={(e) => updateGuestRow(g.localId, "firstName", e.target.value)} />
                                <input className={inp + " py-2.5"} placeholder="Last Name *" value={g.lastName} disabled={g.saved}
                                  onChange={(e) => updateGuestRow(g.localId, "lastName", e.target.value)} />
                                <input className={inp + " py-2.5"} placeholder="Phone *" value={g.phone} disabled={g.saved}
                                  onChange={(e) => updateGuestRow(g.localId, "phone", e.target.value)} />
                                <input className={inp + " py-2.5"} placeholder="Email" value={g.email} disabled={g.saved}
                                  onChange={(e) => updateGuestRow(g.localId, "email", e.target.value)} />
                                <input className={inp + " py-2.5"} placeholder="Nationality" value={g.nationality} disabled={g.saved}
                                  onChange={(e) => updateGuestRow(g.localId, "nationality", e.target.value)} />
                                <select className={sel + " py-2.5"} value={g.idType} disabled={g.saved}
                                  onChange={(e) => updateGuestRow(g.localId, "idType", e.target.value)}>
                                  <option value="Passport">Passport</option>
                                  <option value="NRC">NRC</option>
                                  <option value="Driver's License">Driver's License</option>
                                  <option value="National ID">National ID</option>
                                </select>
                              </div>

                              {!g.saved && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                  <FileUpload label="ID Document (Front)" name="idFront"
                                    value={g.idFront} onChange={(k, v) => updateGuestRow(g.localId, k, v)} />
                                  <FileUpload label="ID Document (Back)" name="idBack"
                                    value={g.idBack} onChange={(k, v) => updateGuestRow(g.localId, k, v)} />
                                </div>
                              )}
                            </>
                          )}

                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              className={inp + " py-2.5"}
                              placeholder="ID Number *"
                              value={g.idNumber}
                              disabled={g.saved}
                              onChange={(e) => updateGuestRow(g.localId, "idNumber", e.target.value)}
                            />

                            <select
                              className={sel + " py-2.5"}
                              value={g.guestType}
                              disabled={g.saved}
                              onChange={(e) => updateGuestRow(g.localId, "guestType", e.target.value)}
                            >
                              <option value="Adult">Adult</option>
                              <option value="Child">Child</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className={sec}>
                <div><label className={lbl}>Settlement Method *</label>
                  <select className={sel} value={form.paymentMethod} onChange={field("paymentMethod")}>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Direct Bank Account</option>
                    <option value="online">Mobile Bank Transfer</option>
                  </select></div>

                <div><label className={lbl}>{isCheckin ? "Additional Payment" : "Deposit Amount"}</label>
                  <input className={inp} type="number" min="0" step="0.01" placeholder="0.00"
                    value={form.depositAmount} onChange={field("depositAmount")} /></div>

                {form.paymentMethod !== "cash" && (
                  <div><label className={lbl}>Transaction / Reference No.</label>
                    <input className={inp} placeholder="e.g. TXN-00234"
                      value={form.transactionNo} onChange={field("transactionNo")} /></div>
                )}

                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-inner">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <FaCalculator size={12} className="text-yellow-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ledger Summary</span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Room base cost ({form.nights}n)</span>
                      <span>{fmt(form.roomCharge)}</span>
                    </div>
                    {form.extraPersonCharge > 0 && (
                      <div className="flex justify-between text-slate-300">
                        <span>Surplus Headcount Surcharge</span>
                        <span>{fmt(form.extraPersonCharge)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-300">
                      <span>Standard Tax (10%)</span>
                      <span>{fmt(form.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-yellow-400 font-bold text-base pt-2 border-t border-slate-800">
                      <span>Gross Total Amount</span>
                      <span>{fmt(form.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Processed Pre-Deposit</span>
                      <span>− {fmt(form.depositAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800">
                      <span>Remaining Outstanding Balance</span>
                      <span className="text-lg text-amber-400">{fmt(remainingAmount)}</span>
                    </div>
                  </div>
                </div>

                {form.paymentMethod === "online" && (
                  <FileUpload label="Upload Transfer Screenshot / Receipt" name="paymentProof"
                    value={form.paymentProof} onChange={(k, v) => set(k, v)} />
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 flex-shrink-0">
            {currentStep === 1 && (
              <button type="button" onClick={handleClose}
                className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all">
                Dismiss File
              </button>
            )}
            {currentStep > 1 && (
              <button type="button" onClick={() => setCurrentStep((s) => s - 1)}
                className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all">
                Previous Step
              </button>
            )}
            {currentStep === 1 && (
              <button type="button" disabled={saving} onClick={submitStep1}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-slate-900 font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-yellow-500/20">
                {saving ? "Saving guest…" : "Continue Next"}
              </button>
            )}
            {currentStep === 2 && (
              <button type="button" disabled={saving} onClick={submitStep2}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-slate-900 font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-yellow-500/20">
                {saving ? "Saving reservation…" : "Continue Next"}
              </button>
            )}
            {currentStep === 3 && (
              <button type="submit" disabled={saving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2">
                <FaCheck size={12} /> {saving ? "Saving…" : isCheckin ? "Confirm Check-In" : "Authorize Booking"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}