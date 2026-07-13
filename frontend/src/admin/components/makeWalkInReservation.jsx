import React, { useState } from "react";
import { FaUserPlus, FaCalendarAlt, FaDollarSign, FaTimes, FaClipboardList } from "react-icons/fa";

export default function MakeWalkInReservation({ selectedRoom, onClose, onSaveSuccess }) {
  // Form state structured to align cleanly with your Laravel migration schema
  const [formData, setFormData] = useState({
    // Guest creation attributes
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    
    // Reservation table schema attributes
    check_in_date: new Date().toISOString().split("T")[0], // default to today
    check_out_date: "",
    deposit_amount: "0.00",
    reservation_status: "Confirmed", // Walk-ins are usually instantly confirmed
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Context payload prepared directly for your backend endpoint
    const payload = {
      ...formData,
      room_number: selectedRoom.id,       // structural link field
      room_type_id: selectedRoom.typeId, // explicit constraint FK
    };

    try {
        console.log(payload);
const response = await fetch('http://127.0.0.1:8000/api/reservations/walk-in', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json' // This forces Laravel to respond with JSON data
  },
  body: JSON.stringify(payload)
});

const result = await response.json();

if (!response.ok) {
  console.log("Laravel Error:", result);

  throw new Error(
    JSON.stringify(result)
  );
}

// Success! Call parents to refresh the UI maps
if (onSaveSuccess) onSaveSuccess();
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      if (onClose) onClose();
      
      alert(`Walk-in reservation verified and saved for Room ${selectedRoom.id}!`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to establish reservation record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-2xl mx-auto">
      {/* Form Header */}
      <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <FaUserPlus size={18} />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight">Walk-In Registration Matrix</h3>
            <p className="text-xs text-slate-400 font-medium">
              Target Unit: <span className="text-white font-bold">Room {selectedRoom?.id}</span> ({selectedRoom?.name})
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <FaTimes size={18} />
          </button>
        )}
      </div>

      {/* Booking Constraints Banner */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 px-6 py-3 border-b border-slate-100 text-xs font-bold text-slate-600">
        <div>Base Cost: <span className="text-amber-600">${selectedRoom?.rate?.toFixed(2)}/night</span></div>
        <div className="text-right">Capacity Cap: <span className="text-slate-900">{selectedRoom?.capacity} Guests</span></div>
      </div>

      {/* Main Interactive Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* SECTION 1: Guest Master Data */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> 1. Guest Core Profile
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                type="text" required name="first_name" value={formData.first_name} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text" required name="last_name" value={formData.last_name} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email" required name="email" value={formData.email} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel" required name="phone" value={formData.phone} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Reservation Migration Target Columns */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> 2. Allocation Parameters
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <FaCalendarAlt size={11} className="opacity-60" /> Check-In Date *
              </label>
              <input
                type="date" required name="check_in_date" value={formData.check_in_date} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <FaCalendarAlt size={11} className="opacity-60" /> Check-Out Date *
              </label>
              <input
                type="date" required name="check_out_date" value={formData.check_out_date} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-0.5">
                <FaDollarSign size={10} className="opacity-60" /> Deposit Amount ($) *
              </label>
              <input
                type="number" step="0.01" min="0" required name="deposit_amount" value={formData.deposit_amount} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <FaClipboardList size={11} className="opacity-60" /> Operational Status *
              </label>
              <select
                name="reservation_status" value={formData.reservation_status} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              >
                <option value="Confirmed">Confirmed (Arrived/Checked-In)</option>
                <option value="Pending">Pending Deposit Clearance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interactive Action Control Panel */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
          {onClose && (
            <button
              type="button" onClick={onClose} disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider disabled:opacity-50"
            >
              Back to Layout
            </button>
          )}
          <button
            type="submit" disabled={loading}
            className="px-5 py-2.5 text-xs font-black bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-200 text-slate-950 disabled:text-slate-400 rounded-lg shadow-sm transition-all uppercase tracking-wider active:scale-[0.98]"
          >
            {loading ? "Processing Database Triggers..." : "Commit Walk-In Reservation"}
          </button>
        </div>
      </form>
    </div>
  );
}