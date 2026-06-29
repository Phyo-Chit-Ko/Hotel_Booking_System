import { useState, useEffect } from "react";
import {
  FaTimes, FaSearch, FaUser, FaBed, FaCalendarAlt,
  FaCreditCard, FaUpload, FaCheck, FaStar, FaCalculator,
} from "react-icons/fa";

const inp = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder-slate-300 bg-white";
const sel = inp + " appearance-none pr-10 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat";
const lbl = "block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";
const sec = "space-y-4";

function SectionHeader({ icon: Icon, step, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
        <Icon size={14} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Step {step}</p>
        <h3 className="text-sm font-bold text-slate-800 leading-tight">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function FileUpload({ label, name, value, onChange }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
        {value ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <FaCheck size={12} />
            <span className="text-xs font-semibold">{value.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-blue-400 transition-colors">
            <FaUpload size={14} />
            <span className="text-[11px] font-medium">Click to upload</span>
          </div>
        )}
        <input type="file" name={name} className="hidden" accept="image/*,.pdf"
          onChange={(e) => onChange(name, e.target.files[0])} />
      </label>
    </div>
  );
}

function SummaryRow({ label, value, highlight, bold }) {
  return (
    <div className={`flex justify-between items-center text-sm ${highlight ? "pt-2 mt-1 border-t border-slate-200" : ""}`}>
      <span className={highlight ? "font-bold text-slate-700" : "text-slate-500"}>{label}</span>
      <span className={`${bold || highlight ? "font-bold" : "font-medium"} ${highlight ? "text-blue-600 text-base" : "text-slate-700"}`}>{value}</span>
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
  depositAmount: "", paymentMethod: "cash",
  ratePerNight: 0, nights: 0, roomCharge: 0,
  extraPersonCharge: 0, taxAmount: 0, totalAmount: 0, remainingAmount: 0,
};

export default function AddReservation({ isOpen, onClose, onSave }) {
  const [form, setForm]               = useState(EMPTY);
  const [currentStep, setCurrentStep] = useState(1);
  const [guestResults, setGuestResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);

  // Auto-calc charges
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/60 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">New Reservation</h2>
            {/* <p className="text-xs text-slate-400 mt-0.5">Complete all 3 steps to confirm the booking</p> */}
          </div>
          {/* Step pills */}
          <div className="flex items-center gap-2 mr-3">
            {[1,2,3].map((s) => (
              <button key={s} type="button" onClick={() => setCurrentStep(s)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                  currentStep === s ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : s < currentStep  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-400"
                }`}>
                {s < currentStep ? <FaCheck size={10} /> : s}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition">
            <FaTimes size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">

            {/* STEP 1 — Guest */}
            {currentStep === 1 && (
              <div className={sec}>
                <SectionHeader icon={FaUser} step={1} title="Guest Information"
                  subtitle="Search for a returning guest or fill in new guest details." />

                {/* Search */}
                <div>
                  <label className={lbl}>Search Existing Guest</label>
                  <div className="relative">
                    <FaSearch size={12} className="absolute left-3.5 top-3 text-slate-400" />
                    <input className={inp + " pl-9"} placeholder="Search by name or phone…"
                      value={form.guestSearch} onChange={(e) => handleGuestSearch(e.target.value)} />
                    {searchLoading && <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  {guestResults.length > 0 && (
                    <div className="mt-1 border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-white">
                      {guestResults.map((g) => (
                        <button key={g.guest_id} type="button" onClick={() => selectGuest(g)}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm flex justify-between items-center border-b border-slate-100 last:border-0">
                          <span className="font-medium text-slate-800">{g.first_name} {g.last_name}</span>
                          <span className="text-slate-400 text-xs">{g.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span>or enter new guest details below</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>First Name *</label>
                    <input className={inp} placeholder="John" value={form.firstName} onChange={field("firstName")} required /></div>
                  <div><label className={lbl}>Last Name *</label>
                    <input className={inp} placeholder="Smith" value={form.lastName} onChange={field("lastName")} required /></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>Phone *</label>
                    <input className={inp} type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={field("phone")} required /></div>
                  <div><label className={lbl}>Email</label>
                    <input className={inp} type="email" placeholder="john@email.com" value={form.email} onChange={field("email")} /></div>
                </div>

                <div><label className={lbl}>Nationality</label>
                  <input className={inp} placeholder="e.g. American, Myanmar…" value={form.nationality} onChange={field("nationality")} /></div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>ID Type *</label>
                    <select className={sel} value={form.idType} onChange={field("idType")} required>
                      <option value="Passport">Passport</option>
                      <option value="NRC">NRC</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="National ID">National ID</option>
                    </select></div>
                  <div><label className={lbl}>ID Number *</label>
                    <input className={inp} placeholder="e.g. AB1234567" value={form.idNumber} onChange={field("idNumber")} required /></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FileUpload label="ID Front" name="idFront" value={form.idFront} onChange={(k,v) => set(k,v)} />
                  <FileUpload label="ID Back"  name="idBack"  value={form.idBack}  onChange={(k,v) => set(k,v)} />
                </div>

                {/* VIP toggle */}
                {/* <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div onClick={() => set("isVip", !form.isVip)}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-all ${form.isVip ? "bg-amber-400" : "bg-slate-200"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${form.isVip ? "translate-x-4" : ""}`} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaStar size={12} className={form.isVip ? "text-amber-400" : "text-slate-300"} />
                    <span className="text-sm font-medium text-slate-700">VIP Guest</span>
                    <span className="text-xs text-slate-400">— priority service</span>
                  </div>
                </label> */}
              </div>
            )}

            {/* STEP 2 — Room & Stay */}
            {currentStep === 2 && (
              <div className={sec}>
                <SectionHeader icon={FaBed} step={2} title="Room & Stay Details"
                  subtitle="Select check-in and check-out dates to see available rooms." />

                <div className="grid grid-cols-2 gap-3">
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
                  <p className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                    {form.nights} night{form.nights > 1 ? "s" : ""}
                  </p>
                )}

                <div>
                  <label className={lbl}>Room Number *</label>
                  {availableRooms.length > 0 ? (
                    <select className={sel} value={form.roomNumber}
                      onChange={(e) => handleRoomSelect(e.target.value)} required>
                      <option value="">— Select available room —</option>
                      {availableRooms.map((r) => (
                        <option key={r.room_number} value={r.room_number}>
                          Room {r.room_number} — {r.room_type?.name} (Floor {r.floor})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input className={inp} placeholder="Enter room number (e.g. 201)"
                      value={form.roomNumber} onChange={(e) => handleRoomSelect(e.target.value)} required />
                  )}
                </div>

                {form.roomType && (
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className={lbl}>Room Type</label>
                      <input className={inp + " bg-slate-50 text-slate-500"} value={form.roomType} readOnly /></div>
                    <div><label className={lbl}>Floor</label>
                      <input className={inp + " bg-slate-50 text-slate-500"} value={form.floor} readOnly /></div>
                    <div><label className={lbl}>Bed Type</label>
                      <input className={inp + " bg-slate-50 text-slate-500"} value={form.bedType} readOnly /></div>
                  </div>
                )}

                <div><label className={lbl}>Number of Guests *</label>
                  <input className={inp} type="number" min={1} max={10}
                    value={form.numberOfGuests} onChange={field("numberOfGuests")} required /></div>

                <div><label className={lbl}>Special Requests</label>
                  <textarea className={inp + " resize-none h-20"}
                    placeholder="e.g. High floor, extra pillows, late check-in…"
                    value={form.specialRequests} onChange={field("specialRequests")} /></div>
              </div>
            )}

            {/* STEP 3 — Payment */}
            {currentStep === 3 && (
              <div className={sec}>
                <SectionHeader icon={FaCreditCard} step={3} title="Payment & Confirmation"
                  subtitle="Review charges, set deposit amount and confirm status." />

                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>Reservation Status *</label>
                    <select className={sel} value={form.reservationStatus} onChange={field("reservationStatus")}>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                    </select></div>
                  <div><label className={lbl}>Payment Method *</label>
                    <select className={sel} value={form.paymentMethod} onChange={field("paymentMethod")}>
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="online">Online Payment</option>
                    </select></div>
                </div>

                <div><label className={lbl}>Deposit Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-400 text-sm font-medium">$</span>
                    <input className={inp + " pl-8"} type="number" min={0} step="0.01"
                      placeholder="0.00" value={form.depositAmount} onChange={field("depositAmount")} />
                  </div></div>

                {/* Charge breakdown */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCalculator size={11} className="text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Charge Breakdown</span>
                  </div>
                  <SummaryRow label={`Room (${form.nights}n × ${fmt(form.ratePerNight)})`} value={fmt(form.roomCharge)} />
                  {form.extraPersonCharge > 0 && <SummaryRow label="Extra Person" value={fmt(form.extraPersonCharge)} />}
                  <SummaryRow label="Tax (10%)" value={fmt(form.taxAmount)} />
                  <SummaryRow label="Total" value={fmt(form.totalAmount)} highlight bold />
                  <SummaryRow label="Deposit" value={`− ${fmt(form.depositAmount || 0)}`} />
                  <SummaryRow label="Remaining Balance" value={fmt(form.remainingAmount)} bold />
                </div>

                {/* Summary card */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-1.5 text-sm">
                  <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-2">Booking Summary</p>
                  <p className="text-slate-700">
                    <span className="font-semibold">Guest: </span>
                    {form.firstName} {form.lastName}
                    {form.isVip && <span className="ml-1 text-amber-500 text-xs">★ VIP</span>}
                  </p>
                  <p className="text-slate-700"><span className="font-semibold">Room: </span>{form.roomNumber} {form.roomType && `— ${form.roomType}`}</p>
                  <p className="text-slate-700"><span className="font-semibold">Stay: </span>{form.checkIn} → {form.checkOut} ({form.nights} nights)</p>
                  <p className="text-slate-700"><span className="font-semibold">Guests: </span>{form.numberOfGuests}</p>
                  <p className="text-slate-700"><span className="font-semibold">Status: </span><span className="capitalize">{form.reservationStatus}</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex gap-3 flex-shrink-0">
            {currentStep === 1 && (
              <button type="button" onClick={onClose}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl text-sm transition">
                Cancel
              </button>
            )}
            {currentStep > 1 && (
              <button type="button" onClick={() => setCurrentStep((s) => s - 1)}
                className="flex-1 border border-slate-200 hover:bg-white text-slate-700 font-semibold py-3 rounded-xl text-sm transition">
                ← Back
              </button>
            )}
            {currentStep < 3 ? (
              <button type="button" onClick={() => setCurrentStep((s) => s + 1)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg shadow-blue-500/20">
                Continue →
              </button>
            ) : (
              <button type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                <FaCheck size={12} /> Confirm Reservation
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
