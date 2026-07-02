import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "../layouts/AdminLayout";
import {
  FaPlus,
  FaSearch,
  FaFileExport,
  FaFileImport,
  FaTrash,
  FaEdit,
  FaTshirt,
  FaTimes,
  FaCheckCircle,
  FaUtensils,
  FaCar,
  FaChevronDown
} from "react-icons/fa";

// Scalable menu database mock
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

const ExtraServices = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [services, setServices] = useState([
    {
      id: 1,
      booking_number: "BK-2026-0001",
      guest_name: "Sophia Bennett",
      date: "2026-05-14",
      service_type: "Laundry",
      description: "Express laundry service",
      quantity: 2,
      rate: 25.00,
      tax: 10.00,
    },
    {
      id: 2,
      booking_number: "BK-2026-0002",
      guest_name: "Liam Carter",
      date: "2026-05-15",
      service_type: "Car Rental",
      description: "Sedan rental daily fee",
      quantity: 1,
      rate: 60.00,
      tax: 5.00,
    }
  ]);

  const initialFormState = {
    booking_number: "",
    guest_name: "",
    service_type: "Laundry", 
    date: new Date().toISOString().split("T")[0],
    description: "",
    quantity: 1,
    rate: 0.00,
    tax: 0.00
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedFoodItems, setSelectedFoodItems] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const calculatedTotal = (Number(formData.quantity) * Number(formData.rate)) + Number(formData.tax);

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "service_type" && value !== "Food") {
        setSelectedFoodItems({});
        setIsDropdownOpen(false);
        updated.description = "";
        updated.quantity = 1;
        updated.rate = 0.00;
      }
      return updated;
    });
  };

  // Smart incremental POS addition logic
  const handleAddFoodItem = (foodItem) => {
    setSelectedFoodItems(prevItems => {
      const updatedItems = { ...prevItems };
      if (updatedItems[foodItem.id]) {
        updatedItems[foodItem.id].qty += 1;
      } else {
        updatedItems[foodItem.id] = { name: foodItem.name, price: foodItem.price, qty: 1 };
      }

      let totalQty = 0;
      let totalCost = 0;
      const descriptionLines = [];

      Object.values(updatedItems).forEach(item => {
        totalQty += item.qty;
        totalCost += (item.price * item.qty);
        descriptionLines.push(`${item.name} (x${item.qty})`);
      });

      setFormData(prev => ({
        ...prev,
        quantity: totalQty,
        rate: totalQty > 0 ? Number((totalCost / totalQty).toFixed(2)) : 0, 
        description: descriptionLines.join(", ")
      }));

      return updatedItems;
    });

    // Close dropdown instantly on select
    setIsDropdownOpen(false);
  };

  const handleSimulatedSubmit = (e) => {
    e.preventDefault();
    const newRecord = {
      id: services.length + 1,
      ...formData,
      rate: Number(formData.rate),
      tax: Number(formData.tax),
      quantity: Number(formData.quantity)
    };
    setServices([newRecord, ...services]);
    setIsPanelOpen(false);
    setFormData(initialFormState);
    setSelectedFoodItems({});
  };

  // Badge style aligned with Booking/Payment page's badge pattern
  const getServiceTypeStyle = (type) => {
    switch (type) {
      case "Laundry":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Car Rental":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Food":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const filteredServices = services.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.booking_number.toLowerCase().includes(term) ||
      item.guest_name.toLowerCase().includes(term) ||
      item.service_type.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term))
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6 relative overflow-hidden">
       

        {/* Statistics Panels (matches Booking/Payment icon-box style) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-xl text-blue-600">
                <FaTshirt />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Laundry</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">{services.filter(s => s.service_type === "Laundry").length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xl text-emerald-600">
                <FaCar />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Car Rentals</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">{services.filter(s => s.service_type === "Car Rental").length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-xl text-amber-600">
                <FaUtensils />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Food Orders</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">{services.filter(s => s.service_type === "Food").length}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Master Card Box Container (Matches Booking/Payment Layout) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">

          {/* Controls Horizontal Row */}
          <div className="flex items-center gap-3">
            <div className="relative w-[355px] h-11">
              <input
                type="text"
                placeholder="Search booking #, guest, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="h-11 px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 ml-auto"
            >
              <FaPlus className="text-sm" />
               <span>Add New</span>
            </button>
          </div>

          {/* Nested Data Table Box */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Charge ID</th>
                  <th className="px-5 py-3.5 font-medium">Booking Number</th>
                  <th className="px-5 py-3.5 font-medium">Guest Name</th>
                  <th className="px-5 py-3.5 font-medium">Charge Date</th>
                  <th className="px-5 py-3.5 font-medium">Service Type</th>
                  <th className="px-5 py-3.5 font-medium">Description</th>
                  <th className="px-5 py-3.5 font-medium text-center">QTY</th>
                  <th className="px-5 py-3.5 font-medium">Rate</th>
                  <th className="px-5 py-3.5 font-medium">Tax</th>
                  <th className="px-5 py-3.5 font-medium">Total Amount</th>
                  <th className="px-5 py-3.5 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.length > 0 ? (
                  filteredServices.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium text-slate-900">#{item.id}</td>
                      <td className="px-5 py-4 font-medium text-slate-900">{item.booking_number}</td>
                      <td className="px-5 py-4 text-slate-700">{item.guest_name}</td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{item.date}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getServiceTypeStyle(item.service_type)}`}>
                          {item.service_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-[160px] truncate" title={item.description}>{item.description}</td>
                      <td className="px-5 py-4 text-center font-mono font-medium text-slate-700">{item.quantity}</td>
                      <td className="px-5 py-4 font-mono text-slate-600">${item.rate.toFixed(2)}</td>
                      <td className="px-5 py-4 font-mono text-slate-400">${item.tax.toFixed(2)}</td>
                      <td className="px-5 py-4 font-mono font-semibold text-slate-900">${((item.quantity * item.rate) + item.tax).toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center items-center gap-1.5">
                          <button type="button" className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 transition" title="Edit Charge">
                            <FaEdit className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-rose-500 hover:bg-rose-50 transition" title="Delete Charge">
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="px-6 py-12 text-center text-sm text-slate-400">
                      No matching service charges found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR OVERLAY DRAWER PANEL */}
        {isPanelOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
            <div className="absolute inset-0" onClick={() => setIsPanelOpen(false)} />
            
            <div className="relative w-full max-w-md bg-white h-screen shadow-2xl flex flex-col justify-between z-10 border-l border-slate-100">
              
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Add Extra Charge / Service</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Post ancillary folio charges to active guest accounts.</p>
                </div>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition">
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSimulatedSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Booking / Reservation Link *</label>
                  <input type="text" required name="booking_number" value={formData.booking_number} onChange={handleChange} placeholder="e.g., BK-2026-0012" className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition text-slate-800" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Guest Full Name *</label>
                  <input type="text" required name="guest_name" value={formData.guest_name} onChange={handleChange} placeholder="e.g., Alexander Wright" className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition text-slate-800" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Service Type</label>
                    <select name="service_type" value={formData.service_type} onChange={handleChange} className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 transition text-slate-700 font-medium cursor-pointer">
                      <option value="Laundry">Laundry</option>
                      <option value="Car Rental">Car Rental</option>
                      <option value="Food">Food</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Charge Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 transition text-slate-700" />
                  </div>
                </div>

                {/* THE CLEAN DROPDOWN TRIGGER BUTTON */}
                {formData.service_type === "Food" && (
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Menu Selection</label>
                    
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-xl transition"
                    >
                      <span className="flex items-center gap-2"><FaUtensils className="text-amber-600" /> Add Food Item</span>
                      <FaChevronDown className={`text-amber-600 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Popover list that overlays without forcing elements downwards */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
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

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Service Details / Description</label>
                  <textarea name="description" rows="2" value={formData.description} onChange={handleChange} placeholder={formData.service_type === "Food" ? "Selected items will auto-populate here..." : "Provide contextual invoice specifics..."} className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition text-slate-800 resize-none" />
                </div>

                {/* Cost Calculations Interface Block */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost Accounting Configurator</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Quantity</label>
                      <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500 text-slate-800 font-semibold" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Rate ($)</label>
                      <input type="number" step="0.01" name="rate" value={formData.rate} onChange={handleChange} className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500 text-slate-800 font-semibold" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Tax ($)</label>
                      <input type="number" step="0.01" name="tax" value={formData.tax} onChange={handleChange} className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500 text-slate-800 font-semibold" />
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Calculated Grand Total:</span>
                    <span className="text-base font-extrabold text-slate-900">${calculatedTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Form Action Submissions Bar */}
                <div className="pt-2 flex items-center gap-3">
                  <button type="button" onClick={() => setIsPanelOpen(false)} className="w-1/2 py-2.5 text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
                  <button type="submit" className="w-1/2 py-2.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition shadow-md flex items-center justify-center gap-2"><FaCheckCircle /> Log Extra Charge</button>
                </div>
              </form>

              <div className="p-4 bg-slate-900 text-center text-[11px] font-medium text-slate-400">Harbor Grand Hotel Ledger Posting System</div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default ExtraServices;
