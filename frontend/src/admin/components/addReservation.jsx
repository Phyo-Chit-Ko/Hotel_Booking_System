import { useState } from "react";
import { FaTimes } from "react-icons/fa";

export default function AddReservation({ isOpen, onClose, onSave }) {
  // Local form input state
  const [formData, setFormData] = useState({
    guestName: "",
    roomNumber: "",
    roomType: "Standard",
    checkIn: "",
    checkOut: "",
    nights: 1,
    source: "Direct",
    status: "Confirmed",
    totalAmount: "",
  });

  // Handle local state text input updates
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form Submission Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure total amount has a dollar sign formatted out-of-the-box
    const formattedAmount = formData.totalAmount.startsWith("$")
      ? formData.totalAmount
      : `$${formData.totalAmount}`;

    // Pass data back up to parent container logic
    onSave({
      ...formData,
      totalAmount: formattedAmount,
      nights: parseInt(formData.nights) || 1,
    });

    // Reset local data fields
    setFormData({
      guestName: "",
      roomNumber: "",
      roomType: "Standard",
      checkIn: "",
      checkOut: "",
      nights: 1,
      source: "Direct",
      status: "Confirmed",
      totalAmount: "",
    });
  };

  // Guard clause: if not open, render nothing
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-900/40 backdrop-blur-md transition-opacity">
      
      {/* Modal Central Card Container */}
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modern Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Add New Reservation</h2>
            <p className="text-sm text-slate-400 mt-0.5">Register a new guest booking details below.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 shadow-sm transition"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Input Entry Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          
          {/* Guest Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Guest Full Name</label>
            <input
              type="text"
              name="guestName"
              required
              value={formData.guestName}
              onChange={handleInputChange}
              placeholder="e.g. Liam Carter"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          {/* Room Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Room Number</label>
              <input
                type="text"
                name="roomNumber"
                required
                value={formData.roomNumber}
                onChange={handleInputChange}
                placeholder="e.g. 202, V01"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Room Type</label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleInputChange}
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Executive Room">Executive Room</option>
                <option value="Suite">Suite</option>
                <option value="Villa">Villa</option>
              </select>
            </div>
          </div>

          {/* Pricing & Length of Stay Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nights</label>
              <input
                type="number"
                name="nights"
                min="1"
                required
                value={formData.nights}
                onChange={handleInputChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Price (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 text-sm font-medium">$</span>
                <input
                  type="text"
                  name="totalAmount"
                  required
                  value={formData.totalAmount.replace('$', '')} // Handle clean numeric inputs smoothly
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check-In Date</label>
              <input
                type="date"
                name="checkIn"
                required
                value={formData.checkIn}
                onChange={handleInputChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check-Out Date</label>
              <input
                type="date"
                name="checkOut"
                required
                value={formData.checkOut}
                onChange={handleInputChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 text-slate-700"
              />
            </div>
          </div>

          {/* Channel & Status Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Channel Source</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value="Direct">Direct</option>
                <option value="Website">Website</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Phone">Phone</option>
                <option value="OTA">OTA</option>
                <option value="Airbnb">Airbnb</option>
                <option value="Booking.com">Booking.com</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Initial Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Reserved">Reserved</option>
                <option value="Checked-In">Checked-In</option>
                <option value="Checked-Out">Checked-Out</option>
              </select>
            </div>
          </div>

          {/* Action Buttons inside Form Drawer */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg shadow-blue-500/15"
            >
              Save Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}