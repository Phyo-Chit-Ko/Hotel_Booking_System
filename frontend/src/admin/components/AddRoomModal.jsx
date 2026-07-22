import { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";
import { STATUS_ORDER } from "../constants/roomStatus";

const initialFormState = {
  room_number: "",
  room_type_id: "",
  floor: "",
  bed_type: "Single",
  status: "Available",
};

export default function AddRoomModal({ isOpen, onClose, onSave, roomToEdit = null, roomTypes = [], floors = [] }) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors({});
    if (roomToEdit) {
      setFormData({
        room_number: roomToEdit.room_number || "",
        room_type_id: String(roomToEdit.room_type_id || ""),
        floor: roomToEdit.floor || "",
        bed_type: roomToEdit.bed_type || "Single",
        status: roomToEdit.status || "Available",
      });
    } else {
      setFormData({
        ...initialFormState,
        room_type_id: roomTypes.length > 0 ? String(roomTypes[0].room_type_id) : "",
      });
    }
  }, [roomToEdit, isOpen, roomTypes]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.room_number.trim()) tempErrors.room_number = "Room number is required.";
    if (!formData.room_type_id) tempErrors.room_type_id = "Please select a room type.";
    if (!formData.floor.trim()) tempErrors.floor = "Floor is required.";

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
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 flex justify-between items-center border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {roomToEdit ? "Edit Room" : "Add New Room"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {roomToEdit ? "Modify operational tracking settings." : "Register room instance parameters."}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border p-2.5 rounded-xl transition flex items-center justify-center"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Form Body - Updated Focus Rings to be very thin and soft */}
        <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Room Number */}
            <div className="sm:col-span-2 flex flex-col gap-2">
              <label className="block text-sm font-semibold text-slate-700">
                Room Number / Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="room_number"
                disabled={!!roomToEdit}
                value={formData.room_number}
                onChange={handleChange}
                placeholder="e.g., 101"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all disabled:bg-slate-50 font-semibold text-slate-800 ${
                  errors.room_number 
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" 
                    : "border-slate-200 focus:ring-slate-100 focus:border-slate-300"
                }`}
              />
              {errors.room_number && <p className="text-xs font-medium text-rose-500 mt-1.5 ml-1">{errors.room_number}</p>}
            </div>

            {/* Room Type */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-slate-700">Room Type</label>
              <select
                name="room_type_id"
                value={formData.room_type_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 font-bold text-slate-700 cursor-pointer"
              >
                {roomTypes.map((type) => (
                  <option key={type.room_type_id} value={type.room_type_id}>{type.name}</option>
                ))}
              </select>
            </div>

            {/* Floor */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-slate-700">Floor</label>
              <input
                type="text"
                name="floor"
                list="existing-floors"
                value={formData.floor}
                onChange={handleChange}
                placeholder="e.g., 2"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-semibold text-slate-800 ${
                  errors.floor
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-200 focus:ring-slate-100 focus:border-slate-300"
                }`}
              />
              <datalist id="existing-floors">
                {floors.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
              {errors.floor && <p className="text-xs font-medium text-rose-500 mt-1.5 ml-1">{errors.floor}</p>}
            </div>

            {/* Bed Type */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-slate-700">Bed Type</label>
              <select
                name="bed_type"
                value={formData.bed_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 font-bold text-slate-700 cursor-pointer"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="King Size">King Size</option>
                <option value="Twin Beds">Twin Beds</option>
              </select>
            </div>

            {/* Current Status */}
            <div className=" flex flex-col gap-2">
              <label className="block text-sm font-semibold text-slate-700">Current Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 font-bold text-slate-700 cursor-pointer"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Action Footer */}
          <div className="flex gap-3 justify-end pt-5 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition"
            >
              Cancel
            </button>
          
            <button
              type="submit"
              className="px-6 py-2.5 bg-black hover:bg-slate-900 active:scale-95 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center gap-2"
            >
              <FaSave /> Save Room
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}