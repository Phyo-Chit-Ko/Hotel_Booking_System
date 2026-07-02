import { useState, useEffect } from "react";
import {
  FaTimes, FaSearch, FaUser, FaBed, FaCreditCard, 
  FaUpload, FaCheck, FaStar, FaCalculator, FaChevronRight
} from "react-icons/fa";

const inp = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder-slate-400 bg-slate-50/50 hover:bg-yellow-50/40 hover:border-yellow-300 focus:bg-white";
const sel = inp + " appearance-none pr-10 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat";
const lbl = "block text-xs font-semibold text-slate-600 mb-1.5 ml-0.5";
const sec = "space-y-6";

function SectionHeader({ icon: Icon, step, title, subtitle }) {
  return (
    <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
      <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 flex-shrink-0 shadow-sm shadow-yellow-500/5">
        <Icon size={16} />
      </div>
      <div>
        <span className="inline-block text-[10px] font-bold text-yellow-700 uppercase bg-yellow-50/60 px-2 py-0.5 rounded-md mb-1">Step {step} of 3</span>
        <h3 className="text-base font-bold text-slate-800 leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

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

function SummaryRow({ label, value, highlight, bold }) {
  return (
    <div className={`flex justify-between items-center text-sm py-1 ${highlight ? "pt-3 mt-2 border-t border-slate-200" : ""}`}>
      <span className={highlight ? "font-bold text-slate-800" : "text-slate-500 font-medium"}>{label}</span>
      <span className={`${bold || highlight ? "font-bold" : "font-semibold"} ${highlight ? "text-yellow-700 text-lg" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}

const EMPTY = {
  guestSearch: "", guestId: null,
  firstName: "", lastName: "", phone: "", email: "",
  nationality: "", idType: "Passport", idNumber: "",
  idFront: null, idBack: null, isVip: false,
  roomNumber: "", roomType: "", floor: "", bedType: "",
  checkIn: "", checkOut: "", numberOfGuests: 1,
  specialRequests: "", reservationStatus: "confirmed",
  depositAmount: "", paymentMethod: "cash", paymentProof: null,
  ratePerNight: 0, nights: 0, roomCharge: 0,
  extraPersonCharge: 0, taxAmount: 0, totalAmount: 0, remainingAmount: 0,
};

export default function AddReservation({ isOpen, onClose, onSave }) {
  const [form, setForm]               = useState(EMPTY);
  const [currentStep, setCurrentStep] = useState(1);
  const [guestResults, setGuestResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    if (!form.checkIn || !form.checkOut) return;
    const nights            = Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000));
    const roomCharge        = nights * form.ratePerNight;
    const extraPersonCharge = Math.max(0, form.numberOfGuests - 2) * 20 * nights;
    const taxAmount         = (roomCharge + extraPersonCharge) * 0.1;
    const totalAmount       = roomCharge + extraPersonCharge + taxAmount;
    const remainingAmount   = Math.max(0, totalAmount - (parseFloat(form.depositAmount) || 0));
    setForm((p) => ({ ...p, nights, roomCharge, extraPersonCharge, taxAmount, totalAmount, remainingAmount }));
  }, [form.checkIn, form.checkOut, form.ratePerNight, form.numberOfGuests]);

  useEffect(() => {
    const remaining = Math.max(0, form.totalAmount - (parseFloat(form.depositAmount) || 0));
    setForm((p) => ({ ...p, remainingAmount: remaining }));
  }, [form.depositAmount]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm(EMPTY);
    setCurrentStep(1);
  };

  if (!isOpen) return null;

  const fmt = (n) => `$${(parseFloat(n) || 0).toFixed(2)}`;
  const steps = ["Guest Info", "Room & Stay", "Payment"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden max-h-[90vh] transition-all scale-100">

        {/* Dynamic Nav Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-white flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">New Reservation</h2>
            <button type="button" onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 border border-transparent transition">
              <FaTimes size={16} />
            </button>
          </div>

          {/* Stepper Timeline UI */}
          <div className="flex items-center w-full bg-slate-50 p-1.5 rounded-2xl">
            {steps.map((label, idx) => {
              const s = idx + 1;
              const isCurrent = currentStep === s;
              const isPast = s < currentStep;
              return (
                <div key={s} className="flex-1 flex items-center justify-center last:flex-none">
                  <button type="button" onClick={() => setCurrentStep(s)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all w-full justify-center md:justify-start ${
                      isCurrent ? "bg-white text-yellow-700 shadow-sm"
                      : isPast ? "text-emerald-600 hover:bg-white/50"
                      : "text-slate-400 hover:text-slate-600"
                    }`}>
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                      isCurrent ? "bg-yellow-500 text-slate-900"
                      : isPast ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-200/60 text-slate-500"
                    }`}>
                      {isPast ? <FaCheck size={9} /> : s}
                    </span>
                    <span className="hidden md:inline tracking-wide">{label}</span>
                  </button>
                  {idx < steps.length - 1 && <FaChevronRight size={10} className="mx-2 text-slate-300 hidden md:block" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* STEP 1 — Guest */}
            {currentStep === 1 && (
              <div className={sec}>

                <div>
                  <label className={lbl}>Search Profile</label>
                  <div className="relative">
                    <FaSearch
                      size={14}
                      className="text-slate-400 pointer-events-none"
                      style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", zIndex: 2 }}
                    />
                    <input
                      className={inp + " hotel-search-input"}
                      style={{ paddingLeft: "44px" }}
                      placeholder="Search by name, email, or phone…"
                      value={form.guestSearch} onChange={(e) => handleGuestSearch(e.target.value)} />
                    {searchLoading && <div className="absolute right-4 top-3 w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  {guestResults.length > 0 && (
                    <div className="mt-2 border border-slate-100 rounded-xl overflow-hidden shadow-xl bg-white max-h-48 overflow-y-auto z-10 relative">
                      {guestResults.map((g) => (
                        <button key={g.guest_id} type="button" onClick={() => selectGuest(g)}
                          className="w-full text-left px-4 py-3 hover:bg-yellow-50/50 text-sm flex justify-between items-center border-b border-slate-50 last:border-0 transition-colors">
                          <span className="font-semibold text-slate-800">{g.first_name} {g.last_name}</span>
                          <span className="text-slate-500 text-xs">{g.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 my-2">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="font-medium bg-white px-2 text-slate-400">Manual Registration</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={lbl}>First Name *</label>
                    <input className={inp} placeholder="John" value={form.firstName} onChange={field("firstName")} required /></div>
                  <div><label className={lbl}>Last Name *</label>
                    <input className={inp} placeholder="Smith" value={form.lastName} onChange={field("lastName")} required /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={lbl}>Phone Number *</label>
                    <input className={inp} type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={field("phone")} required /></div>
                  <div><label className={lbl}>Email Address</label>
                    <input className={inp} type="email" placeholder="john.smith@example.com" value={form.email} onChange={field("email")} /></div>
                </div>

                <div><label className={lbl}>Nationality</label>
                  <input className={inp} placeholder="e.g. Canadian, Japanese" value={form.nationality} onChange={field("nationality")} /></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1"><label className={lbl}>ID Type *</label>
                    <select className={sel} value={form.idType} onChange={field("idType")} required>
                      <option value="Passport">Passport</option>
                      <option value="NRC">NRC</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="National ID">National ID</option>
                    </select></div>
                  <div className="md:col-span-2"><label className={lbl}>Identification Document Number *</label>
                    <input className={inp} placeholder="Document serial identifier..." value={form.idNumber} onChange={field("idNumber")} required /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUpload label="ID Document (Front)" name="idFront" value={form.idFront} onChange={(k,v) => set(k,v)} />
                  <FileUpload label="ID Document (Back)"  name="idBack"  value={form.idBack}  onChange={(k,v) => set(k,v)} />
                </div>
              </div>
            )}

            {/* STEP 2 — Room & Stay */}
            {currentStep === 2 && (
              <div className={sec}>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={lbl}>Check-in Date *</label>
                    <input className={inp} type="date" value={form.checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={field("checkIn")} required /></div>
                  <div><label className={lbl}>Check-out Date *</label>
                    <input className={inp} type="date" value={form.checkOut}
                      min={form.checkIn || new Date().toISOString().split("T")[0]}
                      onChange={field("checkOut")} required /></div>
                </div>

                {form.nights > 0 && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-yellow-800 font-bold bg-yellow-50 border border-yellow-100 px-3 py-2 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    Calculated Term: {form.nights} night{form.nights > 1 ? "s" : ""}
                  </div>
                )}

                <div>
                  <label className={lbl}>Assigned Room Number *</label>
                  {availableRooms.length > 0 ? (
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
                  <div><label className={lbl}>Adult *</label>
                    <input className={inp} type="number" placeholder="0" value={form.phone} onChange={field("phone")} required /></div>
                  <div><label className={lbl}>Child</label>
                    <input className={inp} type="number" placeholder="0" value={form.email} onChange={field("email")} /></div>
                </div>

                <div><label className={lbl}>Special Requests & Operational Notes</label>
                  <textarea className={inp + " resize-none h-24"}
                    placeholder="text . ."
                    value={form.specialRequests} onChange={field("specialRequests")} /></div>
              </div>
            )}

            {/* STEP 3 — Payment */}
            {currentStep === 3 && (
              <div className={sec}>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={lbl}>Reservation System Status *</label>
                    <select className={sel} value={form.reservationStatus} onChange={field("reservationStatus")}>
                      <option value="pending">Pending Review</option>
                      <option value="confirmed">Confirmed / Active</option>
                      <option value="checked_in">Checked In</option>
                    </select></div>
                  <div><label className={lbl}>Settlement Method *</label>
                    <select className={sel} value={form.paymentMethod} onChange={field("paymentMethod")}>
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="bank_transfer">Direct Bank Account</option>
                      <option value="online">Mobile Bank Transfer</option>
                    </select></div>
                </div>


                {/* Ledger Breakdown Wrapper */}
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
                      <span className="text-lg text-amber-400">{fmt(form.remainingAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Bank Transfer Proof Upload — replaces Manifest Summary Check */}
                {form.paymentMethod === "online" && (
                  <FileUpload
                    label="Upload Transfer Screenshot / Receipt"
                    name="paymentProof"
                    value={form.paymentProof}
                    onChange={(k, v) => set(k, v)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Footer Control Panel */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 flex-shrink-0">
            {currentStep === 1 && (
              <button type="button" onClick={onClose}
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
            {currentStep < 3 ? (
              <button type="button" onClick={() => setCurrentStep((s) => s + 1)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-yellow-500/20">
                Continue Next
              </button>
            ) : (
              <button type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2">
                <FaCheck size={12} /> Authorize Booking
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
