import { useState, useEffect } from "react";
import { FaTimes, FaBed, FaDollarSign, FaUsers, FaCoffee, FaHotTub } from "react-icons/fa";

export default function AddRoomTypeModal({ isOpen, onClose, onSave, roomToEdit = null }) {
  if (!isOpen) return null;

  const initialFormState = {
    name: "",
    numOfRooms: "",
    base_price: "",
    capacity: "2",
    breakfast: false,
    bathtub: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  
  // NEW: State tracking object for explicit validation errors
  const [errors, setErrors] = useState({});

  // Reset errors and sync form when modal state changes
  useEffect(() => {
    setErrors({}); // Wipe away old validation markers
    if (roomToEdit) {
      setFormData({
        name: roomToEdit.name || "",
        numOfRooms: roomToEdit.numOfRooms || "",
        base_price: roomToEdit.base_price || "",
        capacity: String(roomToEdit.capacity || "2"),
        breakfast: roomToEdit.breakfast === 1 || roomToEdit.breakfast === true,
        bathtub: roomToEdit.bathtub === 1 || roomToEdit.bathtub === true,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [roomToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // SMART USER FEEL: Instantly remove error text as soon as user starts correcting the input
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // NEW: Handcoded Form Validation Rule Mapping Engine
  const validateForm = () => {
    const tempErrors = {};

    if (!formData.name.trim()) {
      tempErrors.name = "Room type name cannot be empty.";
    } else if (formData.name.trim().length < 3) {
      tempErrors.name = "Room name must be at least 3 characters long.";
    }

    if (!formData.numOfRooms) {
      tempErrors.numOfRooms = "Please specify the total room count.";
    } else if (parseInt(formData.numOfRooms) <= 0) {
      tempErrors.numOfRooms = "Total rooms count must be 1 or greater.";
    }

    if (!formData.base_price) {
      tempErrors.base_price = "Base room operational rate is required.";
    } else if (parseFloat(formData.base_price) < 0) {
      tempErrors.base_price = "Price cannot be a negative value.";
    }

    setErrors(tempErrors);
    
    // Returns true only if the error mapping tracking object remains completely empty
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Safely stop the default browser HTML form submission bubble

    // Only commit processing data up stream if explicit validations pass
    if (validateForm()) {
      onSave(formData, roomToEdit ? roomToEdit.room_type_id : null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 m-4">
        
        {/* Dynamic Modal Header */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 p-6 flex justify-between items-center border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {roomToEdit ? "Edit Room Type" : "Add New Room Type"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {roomToEdit ? "Modify configuration parameters." : "Configure structural rules and base amenities."}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border p-2.5 rounded-xl transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Body - 'noValidate' suppresses native HTML browser popups */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          
          {/* Room Type Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Room Type Name</label>
            <div className="relative">
              <FaBed className={`absolute left-4 top-3.5 transition-colors ${errors.name ? 'text-rose-400' : 'text-slate-400'}`} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Deluxe Suite"
                className={`pl-11 pr-4 py-2.5 bg-slate-50 border rounded-xl w-full text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.name 
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10" 
                    : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
            </div>
            {/* DYNAMIC INLINE ERROR TEXT */}
            {errors.name && <p className="text-xs font-medium text-rose-500 mt-1.5 ml-1">{errors.name}</p>}
          </div>

          {/* Number of Rooms & Base Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Rooms Input Block */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Total Rooms</label>
              <input
                type="number"
                name="numOfRooms"
                value={formData.numOfRooms}
                onChange={handleChange}
                className={`px-4 py-2.5 bg-slate-50 border rounded-xl w-full text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.numOfRooms 
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10" 
                    : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
              />
              {errors.numOfRooms && <p className="text-xs font-medium text-rose-500 mt-1.5 ml-1">{errors.numOfRooms}</p>}
            </div>

            {/* Base Rate Input Block */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Base Price per Night</label>
              <div className="relative">
                <FaDollarSign className={`absolute left-4 top-3.5 transition-colors ${errors.base_price ? 'text-rose-400' : 'text-slate-400'}`} />
                <input
                  type="number"
                  name="base_price"
                  step="0.01"
                  value={formData.base_price}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl w-full text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.base_price 
                      ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10" 
                      : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                />
              </div>
              {errors.base_price && <p className="text-xs font-medium text-rose-500 mt-1.5 ml-1">{errors.base_price}</p>}
            </div>
          </div>

          {/* Max Capacity */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Max Guest Capacity</label>
            <div className="relative">
              <FaUsers className="absolute left-4 top-3.5 text-slate-400" />
              <select
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
              >
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
                <option value="5">5+ Family Setup</option>
              </select>
            </div>
          </div>

          {/* Amenities Checkboxes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Included Services</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer select-none transition ${formData.breakfast ? "bg-amber-50/40 border-amber-300" : "bg-slate-50/50 border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  <FaCoffee className={formData.breakfast ? "text-amber-600" : "text-slate-400"} />
                  <span className="text-sm font-medium text-slate-700">Free Breakfast</span>
                </div>
                <input
                  type="checkbox"
                  name="breakfast"
                  checked={formData.breakfast}
                  onChange={handleChange}
                  className="w-4 h-4 accent-amber-500 rounded focus:ring-0"
                />
              </label>

              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer select-none transition ${formData.bathtub ? "bg-blue-50/40 border-blue-300" : "bg-slate-50/50 border-slate-200"}`}>
                <div className="flex items-center gap-3">
                  <FaHotTub className={formData.bathtub ? "text-blue-600" : "text-slate-400"} />
                  <span className="text-sm font-medium text-slate-700">Luxury Bathtub</span>
                </div>
                <input
                  type="checkbox"
                  name="bathtub"
                  checked={formData.bathtub}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-600 rounded focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              {roomToEdit ? "Update Changes" : "Save Room Type"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}