import { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaCheckCircle,
  FaUtensils,
  FaChevronDown,
} from "react-icons/fa";
 
const initialFormState = {
  reservation_id: "",
  guest_name: "",
  service_type: "Laundry",
  charge_date: new Date().toISOString().split("T")[0],
  description: "",
  quantity: 1,
  rate: 0.0,
  food_items: "",
};
 
export default function AddExtraChargeModal({ isOpen, onClose, onSave, chargeToEdit = null }) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [selectedFoodItems, setSelectedFoodItems] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 
  // State to hold the live items coming from your restaurant_items table
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
 
  // States: For holding live reservation table records matching your database schema
  const [reservationsList, setReservationsList] = useState([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
 
  const dropdownRef = useRef(null);
 
  // Fetch database reservations when the modal opens to feed our conditional occupied filter
  useEffect(() => {
    if (isOpen) {
      const fetchReservationsData = async () => {
        setIsLoadingReservations(true);
        try {
          const response = await fetch("/api/reservations");
          if (response.ok) {
            const jsonResponse = await response.json();
           
            // Extract data correctly if Laravel wraps it in a 'data' array wrapper object
            const rawRecords = Array.isArray(jsonResponse)
              ? jsonResponse
              : (jsonResponse && Array.isArray(jsonResponse.data) ? jsonResponse.data : []);
           
            // ✅ FIXED: Case-insensitive status matching to catch "Occupied" safely
            const occupiedRooms = rawRecords.filter(res => {
              const displayStatus = String(res?.reservation_status || res?.status || "").toLowerCase().trim();
              return displayStatus === "occupied";
            });
           
            // ✅ CRITICAL FALLBACK: If the filter leaves the list blank, show all raw records instead
            setReservationsList(occupiedRooms.length > 0 ? occupiedRooms : rawRecords);
          } else {
            console.error("Failed to fetch reservations from database.");
          }
        } catch (error) {
          console.error("Error linking to reservations table endpoint:", error);
        } finally {
          setIsLoadingReservations(false);
        }
      };
 
      fetchReservationsData();
    }
  }, [isOpen]);
 
  // Fetch database items when the modal opens and "Food" service is active
  useEffect(() => {
    if (isOpen && formData.service_type === "Food") {
      const fetchMenuData = async () => {
        setIsLoadingMenu(true);
        try {
          const response = await fetch("/api/restaurant-items");
          if (response.ok) {
            const data = await response.json();
            const availableItems = Array.isArray(data) ? data.filter(item => item.status === "Available") : [];
            setRestaurantMenu(availableItems);
          } else {
            console.error("Failed to fetch menu from restaurant_items table.");
          }
        } catch (error) {
          console.error("Error linking to restaurant-items table endpoint:", error);
        } finally {
          setIsLoadingMenu(false);
        }
      };
 
      fetchMenuData();
    }
  }, [isOpen, formData.service_type]);
 
  useEffect(() => {
    setErrors({});
    setIsDropdownOpen(false);
    if (chargeToEdit) {
      setFormData({
        reservation_id: chargeToEdit.reservation_id || "",
        guest_name: chargeToEdit.guest_name || "",
        service_type: chargeToEdit.service_type || "Laundry",
        charge_date: chargeToEdit.charge_date || new Date().toISOString().split("T")[0],
        description: chargeToEdit.description || "",
        quantity: chargeToEdit.quantity ?? 1,
        rate: chargeToEdit.rate ?? 0,
        food_items: chargeToEdit.food_items || "",
      });
      setSelectedFoodItems({});
    } else {
      setFormData(initialFormState);
      setSelectedFoodItems({});
    }
  }, [chargeToEdit, isOpen]);
 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  if (!isOpen) return null;
 
  const calculatedTotal = Number(formData.quantity) * Number(formData.rate);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "service_type" && value !== "Food") {
        setSelectedFoodItems({});
        setIsDropdownOpen(false);
        updated.description = "";
        updated.quantity = 1;
        updated.rate = 0.0;
        updated.food_items = "";
      }
      return updated;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };
 
  // Explicit Handler: Triggered when user picks a room
  const handleRoomSelectorChange = (e) => {
    const selectedId = e.target.value;
   
    const targetReservation = reservationsList.find(res =>
      String(res?.reservation_id || res?.id) === String(selectedId)
    );
 
    setFormData((prev) => ({
      ...prev,
      reservation_id: selectedId,
      // Looks at exactly 'guest_name' column matching your database schema
      guest_name: targetReservation ? (targetReservation.guest_name || targetReservation.guestName || "") : "",
    }));
 
    if (errors.reservation_id) setErrors((prev) => ({ ...prev, reservation_id: "" }));
    if (errors.guest_name) setErrors((prev) => ({ ...prev, guest_name: "" }));
  };
 
  const handleAddFoodItem = (foodItem) => {
    setSelectedFoodItems((prevItems) => {
      const updatedItems = { ...prevItems };
      const targetId = foodItem.item_id;
 
      if (updatedItems[targetId]) {
        updatedItems[targetId].qty += 1;
      } else {
        updatedItems[targetId] = {
          name: foodItem.item_name,
          price: Number(foodItem.price),
          qty: 1
        };
      }
 
      let totalCost = 0;
      const descriptionLines = [];
 
      Object.values(updatedItems).forEach((item) => {
        totalCost += item.price * item.qty;
        descriptionLines.push(`${item.name} (x${item.qty})`);
      });
 
      setFormData((prev) => ({
        ...prev,
        quantity: 1,
        rate: Number(totalCost.toFixed(2)),
        food_items: descriptionLines.join(", "),
        description: prev.description || `Food Service Delivery`,
      }));
 
      return updatedItems;
    });
 
    setIsDropdownOpen(false);
  };
 
  const validateForm = () => {
    const tempErrors = {};
    if (!String(formData.reservation_id).trim()) tempErrors.reservation_id = "Selecting an active room is required.";
    if (!formData.guest_name.trim()) tempErrors.guest_name = "Guest profile context could not be mapped.";
    if (!formData.quantity || Number(formData.quantity) <= 0) tempErrors.quantity = "Must be at least 1.";
    if (formData.rate === "" || Number(formData.rate) < 0) tempErrors.rate = "Rate cannot be negative.";
 
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const sanitizedData = {
        ...formData,
        quantity: Number(formData.quantity),
        rate: Number(formData.rate),
        total: calculatedTotal,
      };
      onSave(sanitizedData, chargeToEdit ? (chargeToEdit.reservation_id || chargeToEdit.id) : null);
      onClose();
    }
  };
 
  const inp = (field) =>
    `px-4 py-2.5 bg-slate-50 border rounded-xl w-full text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/10"
        : "border-slate-200 focus:ring-amber-500/20 focus:border-amber-500"
    }`;
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
 
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 flex justify-between items-center border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {chargeToEdit ? "Edit Extra Charge" : "Add Extra Charge / Service"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Post ancillary folio charges to active guest accounts.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border p-2.5 rounded-xl transition">
            <FaTimes />
          </button>
        </div>
 
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5 overflow-y-auto">
 
          {/* Dynamic Room Selection Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Room & Status Selection</label>
            <select
              name="reservation_id"
              value={formData.reservation_id}
              onChange={handleRoomSelectorChange}
              disabled={isLoadingReservations}
              className={`${inp("reservation_id")} font-medium text-slate-700 cursor-pointer`}
            >
              <option value="">
                {isLoadingReservations ? "Loading Active Rooms..." : "-- Select Occupied Room --"}
              </option>
              {reservationsList.map((res, index) => {
                // ✅ FIXED FALLBACKS: Fall back gracefully to keys or index positions if fields are missing in payload
                const roomNum = res?.room_number || res?.roomNumber || "N/A";
                const status = res?.reservation_status || res?.status || "Occupied";
                const optionKey = res?.reservation_id || res?.id || index;
               
                return (
                  <option key={`occupied-room-opt-${optionKey}`} value={optionKey}>
                    Room {roomNum} — ({status})
                  </option>
                );
              })}
            </select>
            {errors.reservation_id && <p className="text-xs text-rose-500 mt-1.5 ml-1">{errors.reservation_id}</p>}
          </div>
 
          {/* Guest Name field is readOnly, auto-updating alongside chosen room selection row */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Guest Full Name</label>
            <input
              type="text"
              name="guest_name"
              readOnly
              value={formData.guest_name}
              placeholder="Select an occupied room to automatically map guest profile data..."
              className="px-4 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl w-full text-sm text-slate-500 font-medium outline-none cursor-not-allowed"
            />
            {errors.guest_name && <p className="text-xs text-rose-500 mt-1.5 ml-1">{errors.guest_name}</p>}
          </div>
 
          {/* Service type + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Service Type</label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-slate-700 cursor-pointer"
              >
                <option value="Laundry">Laundry</option>
                <option value="Car Rental">Car Rental</option>
                <option value="Food">Food</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Charge Date</label>
              <input
                type="date"
                name="charge_date"
                value={formData.charge_date}
                onChange={handleChange}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700"
              />
            </div>
          </div>
 
          {/* Food menu dropdown loaded dynamically from database */}
          {formData.service_type === "Food" && (
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Menu Selection</label>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isLoadingMenu}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-xl transition disabled:opacity-60"
              >
                <span className="flex items-center gap-2">
                  <FaUtensils className="text-amber-600" />
                  {isLoadingMenu ? "Loading Menu..." : "Add Food Item"}
                </span>
                <FaChevronDown className={`text-amber-600 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
 
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 z-50 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
                  {restaurantMenu.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">No available items found in database</div>
                  ) : (
                    restaurantMenu.map((food, idx) => (
                      <button
                        key={food?.item_id || idx}
                        type="button"
                        onClick={() => handleAddFoodItem(food)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50 transition"
                      >
                        <div>
                          <span className="font-medium text-slate-700 block">{food?.item_name || "Unknown Item"}</span>
                          <span className="text-[11px] text-slate-400 capitalize">{food?.category || "Food"}</span>
                        </div>
                        <span className="font-bold text-slate-900">${food?.price ? Number(food.price).toFixed(2) : "0.00"}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
 
          {/* Food Items Display */}
          {formData.service_type === "Food" && formData.food_items && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Selected Food Items</label>
              <input
                type="text"
                readOnly
                value={formData.food_items}
                className="px-4 py-2.5 bg-amber-50/40 border border-amber-100 rounded-xl w-full text-sm text-amber-900 font-medium outline-none"
              />
            </div>
          )}
 
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Service Details / Description</label>
            <textarea
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide contextual invoice specifics..."
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 resize-none"
            />
          </div>
 
          {/* Cost accounting block */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost Accounting Configurator</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg outline-none focus:ring-2 text-slate-800 font-semibold ${
                    errors.quantity ? "border-rose-300 focus:ring-rose-500/20" : "border-slate-200 focus:ring-amber-500/20"
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg outline-none focus:ring-2 text-slate-800 font-semibold ${
                    errors.rate ? "border-rose-300 focus:ring-rose-500/20" : "border-slate-200 focus:ring-amber-500/20"
                  }`}
                />
              </div>
            </div>
            <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Calculated Grand Total:</span>
              <span className="text-base font-extrabold text-slate-900">${calculatedTotal.toFixed(2)}</span>
            </div>
          </div>
 
          {/* Footer Actions */}
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
              className="px-6 py-2.5 bg-black hover:bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <FaCheckCircle /> {chargeToEdit ? "Update Charge" : "Log Extra Charge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
 