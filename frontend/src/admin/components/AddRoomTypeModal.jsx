import { useState, useEffect } from "react";
import { FaTimes, FaBed, FaDollarSign, FaUsers, FaCoffee, FaHotTub } from "react-icons/fa";

export default function AddRoomTypeModal({ isOpen, onClose, onSave, roomToEdit = null }) {
  if (!isOpen) return null;

  const initialFormState = {
    name:       "",
    numOfRooms: "",   // always camelCase here — controller maps to num_of_rooms
    base_price: "",
    capacity:   "2",
    breakfast:  false,
    bathtub:    false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    setErrors({});
    if (roomToEdit) {
      setFormData({
        name:       roomToEdit.name       || "",
        // DB returns num_of_rooms — map it to numOfRooms for the form
        numOfRooms: roomToEdit.num_of_rooms ?? roomToEdit.numOfRooms ?? "",
        base_price: roomToEdit.base_price  || "",
        capacity:   String(roomToEdit.capacity || "2"),
        breakfast:  roomToEdit.breakfast === 1 || roomToEdit.breakfast === true,
        bathtub:    roomToEdit.bathtub   === 1 || roomToEdit.bathtub   === true,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [roomToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name.trim())                          tempErrors.name       = "Room type name is required.";
    else if (formData.name.trim().length < 3)           tempErrors.name       = "Name must be at least 3 characters.";
    if (!formData.numOfRooms)                           tempErrors.numOfRooms = "Room count is required.";
    else if (parseInt(formData.numOfRooms) <= 0)        tempErrors.numOfRooms = "Must be at least 1 room.";
    if (!formData.base_price)                           tempErrors.base_price = "Base price is required.";
    else if (parseFloat(formData.base_price) < 0)      tempErrors.base_price = "Price cannot be negative.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData, roomToEdit ? roomToEdit.room_type_id : null);
      onClose();
    }
  };

  const inp = (field) =>
    `pl-11 pr-4 py-2.5 bg-slate-50 border rounded-xl w-full text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
        : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 m-4">

        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 p-6 flex justify-between items-center border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {roomToEdit ? "Edit Room Type" : "Add New Room Type"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {roomToEdit ? "Modify configuration parameters." : "Configure capacity, amenities and base rate."}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border p-2.5 rounded-xl transition">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Room Type Name</label>
            <div className="relative">
              <FaBed className={`absolute left-4 top-3.5 ${errors.name ? "text-rose-400" : "text-slate-400"}`} />
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="e.g. Deluxe Suite" className={inp("name")} />
            </div>
            {errors.name && <p className="text-xs text-rose-500 mt-1.5 ml-1">{errors.name}</p>}
          </div>

          {/* Rooms count + Base price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Total Rooms</label>
              <input type="number" name="numOfRooms" value={formData.numOfRooms} onChange={handleChange}
                placeholder="e.g. 10"
                className={`px-4 py-2.5 bg-slate-50 border rounded-xl w-full text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.numOfRooms ? "border-rose-300 focus:ring-rose-500/20" : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                }`} />
              {errors.numOfRooms && <p className="text-xs text-rose-500 mt-1.5 ml-1">{errors.numOfRooms}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Base Price / Night</label>
              <div className="relative">
                <FaDollarSign className={`absolute left-4 top-3.5 ${errors.base_price ? "text-rose-400" : "text-slate-400"}`} />
                <input type="number" name="base_price" step="0.01" value={formData.base_price} onChange={handleChange}
                  placeholder="0.00" className={inp("base_price")} />
              </div>
              {errors.base_price && <p className="text-xs text-rose-500 mt-1.5 ml-1">{errors.base_price}</p>}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Max Guest Capacity</label>
            <div className="relative">
              <FaUsers className="absolute left-4 top-3.5 text-slate-400" />
              <select name="capacity" value={formData.capacity} onChange={handleChange}
                className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none">
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
                <option value="5">5 People</option>
                <option value="6">6+ People</option>
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Included Amenities</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer select-none transition ${
                formData.breakfast ? "bg-amber-50/40 border-amber-300" : "bg-slate-50/50 border-slate-200"
              }`}>
                <div className="flex items-center gap-3">
                  <FaCoffee className={formData.breakfast ? "text-amber-600" : "text-slate-400"} />
                  <span className="text-sm font-medium text-slate-700">Free Breakfast</span>
                </div>
                <input type="checkbox" name="breakfast" checked={formData.breakfast} onChange={handleChange}
                  className="w-4 h-4 accent-amber-500 rounded focus:ring-0" />
              </label>
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer select-none transition ${
                formData.bathtub ? "bg-blue-50/40 border-blue-300" : "bg-slate-50/50 border-slate-200"
              }`}>
                <div className="flex items-center gap-3">
                  <FaHotTub className={formData.bathtub ? "text-blue-600" : "text-slate-400"} />
                  <span className="text-sm font-medium text-slate-700">Luxury Bathtub</span>
                </div>
                <input type="checkbox" name="bathtub" checked={formData.bathtub} onChange={handleChange}
                  className="w-4 h-4 accent-blue-600 rounded focus:ring-0" />
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition">
              Cancel
            </button>
            <button type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition">
              {roomToEdit ? "Update Changes" : "Save Room Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
