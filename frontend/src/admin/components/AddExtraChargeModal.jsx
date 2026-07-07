import { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaCheckCircle,
  FaUtensils,
  FaChevronDown,
  FaHashtag,
  FaUser,
} from "react-icons/fa";

const FOOD_MENU = [
  { id: "f1", name: "Noodles", price: 8.50 },
  { id: "f2", name: "Fried Rice", price: 9.00 },
  { id: "f3", name: "Club Sandwich", price: 12.00 },
  { id: "f4", name: "Coffee", price: 4.00 },
  { id: "f5", name: "Fresh Juice", price: 5.00 },
  { id: "f6", name: "Beef Burger", price: 14.50 },
  { id: "f7", name: "Margherita Pizza", price: 16.00 },
  { id: "f8", name: "Spring Rolls", price: 6.50 },
];

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
  const dropdownRef = useRef(null);

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

  // FIX: Fixed the incremental accumulation math engine
  const handleAddFoodItem = (foodItem) => {
    setSelectedFoodItems((prevItems) => {
      const updatedItems = { ...prevItems };
      if (updatedItems[foodItem.id]) {
        updatedItems[foodItem.id].qty += 1;
      } else {
        updatedItems[foodItem.id] = { name: foodItem.name, price: foodItem.price, qty: 1 };
      }

      let totalCost = 0;
      const descriptionLines = [];

      Object.values(updatedItems).forEach((item) => {
        totalCost += item.price * item.qty;
        descriptionLines.push(`${item.name} (x${item.qty})`);
      });

      setFormData((prev) => ({
        ...prev,
        quantity: 1, // 👈 Keep base quantity as 1 order transaction block
        rate: Number(totalCost.toFixed(2)), // 👈 The rate reflects the total basket cost directly
        food_items: descriptionLines.join(", "),
        description: prev.description || `Food Service Delivery`,
      }));

      return updatedItems;
    });

    setIsDropdownOpen(false);
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!String(formData.reservation_id).trim()) tempErrors.reservation_id = "Reservation ID is required.";
    if (!formData.guest_name.trim()) tempErrors.guest_name = "Guest name is required.";
    else if (formData.guest_name.trim().length < 2) tempErrors.guest_name = "Name looks too short.";

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
      onSave(sanitizedData, chargeToEdit ? chargeToEdit.id : null);
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
              {chargeToEdit ? "Modify this folio charge." : "Post ancillary folio charges to active guest accounts."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border p-2.5 rounded-xl transition">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5 overflow-y-auto">

          {/* Reservation ID */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Reservation ID</label>
            <div className="relative">
              <FaHashtag className={`absolute left-4 top-3.5 text-xs ${errors.reservation_id ? "text-rose-400" : "text-slate-400"}`} />
              <input
                type="text"
                name="reservation_id"
                value={formData.reservation_id}
                onChange={handleChange}
                placeholder="e.g., 12"
                className={`pl-11 ${inp("reservation_id")}`}
              />
            </div>
            {errors.reservation_id && <p className="text-xs text-rose-500 mt-1.5 ml-1">{errors.reservation_id}</p>}
          </div>

          {/* Guest name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Guest Full Name</label>
            <div className="relative">
              <FaUser className={`absolute left-4 top-3.5 text-xs ${errors.guest_name ? "text-rose-400" : "text-slate-400"}`} />
              <input
                type="text"
                name="guest_name"
                value={formData.guest_name}
                onChange={handleChange}
                placeholder="e.g., Sophia Bennett"
                className={`pl-11 ${inp("guest_name")}`}
              />
            </div>
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

          {/* Food menu dropdown */}
          {formData.service_type === "Food" && (
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Menu Selection</label>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-xl transition"
              >
                <span className="flex items-center gap-2">
                  <FaUtensils className="text-amber-600" /> Add Food Item
                </span>
                <FaChevronDown className={`text-amber-600 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 z-50 max-h-52 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
                  {FOOD_MENU.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => handleAddFoodItem(food)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50 transition"
                    >
                      <span className="font-medium text-slate-700">{food.name}</span>
                      <span className="font-bold text-slate-900">${food.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Food Items Auto-populated Display */}
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
                {errors.quantity && <p className="text-[11px] text-rose-500 mt-1">{errors.quantity}</p>}
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
                {errors.rate && <p className="text-[11px] text-rose-500 mt-1">{errors.rate}</p>}
              </div>
            </div>

            <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Calculated Grand Total:</span>
              <span className="text-base font-extrabold text-slate-900">${calculatedTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
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
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <FaCheckCircle /> {chargeToEdit ? "Update Charge" : "Log Extra Charge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}