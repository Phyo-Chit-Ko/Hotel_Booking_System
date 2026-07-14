import { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaChevronDown, FaImage, FaSpinner } from "react-icons/fa"; //

const BACKEND_URL = "http://localhost:8000";

// Move this OUTSIDE the component so it never causes a lifecycle/scope compilation error
const initialFormState = {
  name:               "",
  code:               "",
  base_price:         "",
  extra_person_rate:  "0",
  capacity:           "2",
  breakfast:          false,
  bathtub:            false,
  image:              null, // File object when a new image is picked
};

export default function AddRoomTypeModal({ isOpen, onClose, onSave, roomToEdit = null }) {
  // All hooks MUST run on every render, regardless of `isOpen`.
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [roomCount, setRoomCount] = useState(0);

  const applyRoomData = (room) => {
    setFormData({
      name:              room.name       || "",
      code:              room.code       || "",
      capacity:          String(room.capacity || "2"),
      base_price:        room.base_price || "",
      extra_person_rate: String(room.extra_person_rate ?? "0"),
      breakfast:         room.breakfast === 1 || room.breakfast === true,
      bathtub:           room.bathtub   === 1 || room.bathtub   === true,
      image:             null,
    });
    setImagePreview(room.image ? `${BACKEND_URL}/storage/${room.image}` : null);
    setRoomCount(room.num_of_rooms ?? room.numOfRooms ?? 0);
  };

  useEffect(() => {
    setErrors({});
    setFetchError(false);

    if (!isOpen) return;

    if (!roomToEdit) {
      setFormData(initialFormState);
      setImagePreview(null);
      setRoomCount(0);
      return;
    }

    // The row passed in comes from the cached list — refetch by id so the
    // form always reflects the latest server state (e.g. num_of_rooms can
    // drift via the room layout editor) rather than a possibly stale row.
    let cancelled = false;
    setIsFetching(true);
    axios.get(`/api/room-types/${roomToEdit.room_type_id}`)
      .then((res) => {
        if (cancelled) return;
        applyRoomData(res.data);
      })
      .catch((error) => {
        console.error("Error fetching room type:", error);
        if (cancelled) return;
        setFetchError(true);
        applyRoomData(roomToEdit); // fall back to the cached row so the modal is still usable
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });

    return () => { cancelled = true; };
  }, [roomToEdit, isOpen]);

  // Safe to bail out AFTER all hooks have been called.
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name.trim())                    tempErrors.name = "Room type name is required.";
    else if (formData.name.trim().length < 3)     tempErrors.name = "Name must be at least 3 characters.";
    
    if (!formData.code.trim())                    tempErrors.code = "Room code is required.";
    else if (formData.code.trim().length > 5)     tempErrors.code = "Code cannot exceed 5 characters.";

    if (!formData.base_price)                     tempErrors.base_price = "Base price is required.";
    else if (parseFloat(formData.base_price) < 0) tempErrors.base_price = "Price cannot be negative.";

    if (formData.extra_person_rate !== "" && parseFloat(formData.extra_person_rate) < 0) {
      tempErrors.extra_person_rate = "Rate cannot be negative.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const sanitizedData = {
        ...formData,
        breakfast: formData.breakfast ? 1 : 0,
        bathtub: formData.bathtub ? 1 : 0,
      };

      onSave(sanitizedData, roomToEdit ? roomToEdit.room_type_id : null);
      onClose();
    }
  };

  const inp = (field) =>
    `px-4 py-2.5 bg-slate-50 border rounded-xl w-full text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
        : "border-slate-200 focus:ring-slate-500/20 focus:border-slate-500"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 m-4">

        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 p-6 flex justify-between items-center border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {roomToEdit ? "Edit Room Type" : "Add New Room Type"}
              {isFetching && <FaSpinner className="animate-spin text-slate-400 w-4 h-4" />}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isFetching
                ? "Loading latest details..."
                : roomToEdit ? "Modify configuration parameters." : "Configure capacity, amenities and base rate."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border p-2.5 rounded-xl transition">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">

          {fetchError && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Could not refresh the latest data — showing the last known values instead.
            </p>
          )}

          <fieldset disabled={isFetching} className={isFetching ? "opacity-50 pointer-events-none space-y-5" : "space-y-5"}>

          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Room Image</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Room preview" className="w-full h-full object-cover" />
                ) : (
                  <FaImage className="text-slate-300 w-6 h-6" />
                )}
              </div>
              <label className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition cursor-pointer">
                Choose Image
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Room Type Name</label>
            <div className="relative">
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="e.g. Deluxe Suite" className={inp("name")} />
            </div>
            {errors.name && <p className="text-xs text-rose-500 mt-1.5 ml-1">{errors.name}</p>}
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Dlx"
              className={inp("code")}
            />
            {errors.code && <p className="text-xs text-rose-500 mt-1.5 ml-1">{errors.code}</p>}
            <p className="text-xs text-slate-400 mt-1.5 ml-1">
              {roomCount} room{roomCount === 1 ? "" : "s"} currently assigned — managed in the Floor Layout Editor.
            </p>
          </div>

          {/* Capacity + Base Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Max Guest Capacity</label>
              <div className="relative flex items-center">
                
                <select name="capacity" value={formData.capacity} onChange={handleChange}
                  className="px-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 appearance-none bg-white cursor-pointer">
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5">5 People</option>
                  <option value="6">6+ People</option>
                </select>
                <div className="absolute right-4 pointer-events-none text-slate-500 text-xs">
                  <FaChevronDown />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Base Price / Night</label>
              <div className="relative">
                <input type="number" name="base_price" step="0.01" value={formData.base_price} onChange={handleChange}
                  placeholder="0.00" className={inp("base_price")} />
              </div>
              {errors.base_price && <p className="text-xs text-rose-500 mt-1.5 ml-1">{errors.base_price}</p>}
            </div>
          </div>

          {/* Extra Person Rate */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Extra Person Rate</label>
            <div className="relative">
              <input type="number" name="extra_person_rate" step="0.01" value={formData.extra_person_rate} onChange={handleChange}
                placeholder="0.00" className={inp("extra_person_rate")} />
            </div>
            {errors.extra_person_rate && <p className="text-xs text-rose-500 mt-1.5 ml-1">{errors.extra_person_rate}</p>}
            <p className="text-xs text-slate-400 mt-1.5 ml-1">
              Charged per extra guest beyond double occupancy, per night.
            </p>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Included Amenities</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer select-none transition ${
                formData.breakfast ? "bg-amber-50/40 border-amber-300" : "bg-slate-50/50 border-slate-200"
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">Free Breakfast</span>
                </div>
                <input type="checkbox" name="breakfast" checked={formData.breakfast} onChange={handleChange}
                  className="w-4 h-4 accent-amber-500 rounded focus:ring-0" />
              </label>
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer select-none transition ${
                formData.bathtub ? "bg-blue-50/40 border-blue-300" : "bg-slate-50/50 border-slate-200"
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">Luxury Bathtub</span>
                </div>
                <input type="checkbox" name="bathtub" checked={formData.bathtub} onChange={handleChange}
                  className="w-4 h-4 accent-blue-600 rounded focus:ring-0" />
              </label>
            </div>
          </div>

          </fieldset>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition">
              Cancel
            </button>
            <button type="submit" disabled={isFetching}
              className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-sm transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
              {roomToEdit ? "Update Changes" : "Save Room Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}