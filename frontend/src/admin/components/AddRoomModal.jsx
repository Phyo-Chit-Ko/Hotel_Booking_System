import { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";

export default function AddRoomModal({ isOpen, onClose, onSave, roomToEdit = null, roomTypes = [] }) {
  if (!isOpen) return null;

  // Cleaned: Removed base_price and housekeeping_status to match your database exactly
  const initialFormState = {
    room_number: "",
    room_type_id: "",
    floor: "Ground",
    capacity: "2",
    bed_type: "Single",
    extra_person_rate: "0",
    status: "Available",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors({});
    if (roomToEdit) {
      setFormData({
        room_number: roomToEdit.room_number || "",
        room_type_id: String(roomToEdit.room_type_id || ""),
        floor: roomToEdit.floor || "Ground",
        capacity: String(roomToEdit.capacity || "2"),
        bed_type: roomToEdit.bed_type || "Single",
        extra_person_rate: String(roomToEdit.extra_person_rate || "0"),
        status: roomToEdit.status || "Available",
      });
    } else {
      setFormData({
        ...initialFormState,
        room_type_id: roomTypes.length > 0 ? String(roomTypes[0].room_type_id) : "",
      });
    }
  }, [roomToEdit, isOpen, roomTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.room_number.trim()) tempErrors.room_number = "Room number is required.";
    if (!formData.room_type_id) tempErrors.room_type_id = "Please select a room type.";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData, !!roomToEdit);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 m-4 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 p-6 flex justify-between items-center border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {roomToEdit ? "Edit Room" : "Add New Room"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {roomToEdit ? "Modify operational tracking settings." : "Register room instance parameters."}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border p-2.5 rounded-xl transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Body - Dual Column Grid */}
        <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Room Number */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Room Number / Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="room_number"
                disabled={!!roomToEdit}
                value={formData.room_number}
                onChange={handleChange}
                placeholder="e.g., 101"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all disabled:bg-slate-100 ${
                  errors.room_number 
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" 
                    : "border-slate-200 focus:ring-slate-500/20 focus:border-slate-500"
                }`}
              />
              {errors.room_number && <p className="text-xs font-medium text-rose-500 mt-1.5 ml-1">{errors.room_number}</p>}
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Room Type</label>
              <select
                name="room_type_id"
                value={formData.room_type_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              >
                {roomTypes.map((type) => (
                  <option key={type.room_type_id} value={type.room_type_id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Floor */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Floor</label>
              <select
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              >
                <option value="Ground">Ground</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
                <option value="3rd Floor">3rd Floor</option>
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
            </div>

            {/* Bed Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Bed Type</label>
              <select
                name="bed_type"
                value={formData.bed_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="King Size">King Size</option>
                <option value="Twin Beds">Twin Beds</option>
              </select>
            </div>

            {/* Extra Person Rate */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Extra Person Rate</label>
              <input
                type="number"
                name="extra_person_rate"
                value={formData.extra_person_rate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
            </div>

            {/* Current Status — Fixed value keys to be unique */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Current Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              >
                <option value="Available">Available</option>
                <option value="Clean">Clean</option>
                <option value="Dirty">Dirty</option>
                <option value="Check-in">Check-in</option>
                <option value="Check-out">Check-out</option>
                <option value="Occupied">Occupied</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>

          </div>

          {/* Action Footer Buttons inside Form tag boundaries */}
          <div className="flex gap-3 justify-end pt-6 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition"
            >
              Cancel
            </button>
          
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center gap-2"
            >
              <FaSave /> Save Room
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}