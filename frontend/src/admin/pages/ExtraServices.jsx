import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import {
  FaPlus,
  FaSearch,
  FaFileExport,
  FaFileImport,
  FaTrash,
  FaEdit,
  FaConciergeBell,
  FaWineGlassAlt,
  FaPlaneArrival,
  FaTshirt,
  FaTimes,
  FaCheckCircle
} from "react-icons/fa";

const ExtraServices = () => {
  // Sidebar Slide-over Toggle State for Leadership Demo
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Sample State Data for visual preview
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
      service_type: "Mini Bar",
      description: "Snacks and beverages",
      quantity: 1,
      rate: 25.00,
      tax: 0.00,
    },
    {
      id: 3,
      booking_number: "BK-2026-0005",
      guest_name: "Mia Chen",
      date: "2026-05-13",
      service_type: "Airport Pickup",
      description: "VIP Airport transfer",
      quantity: 1,
      rate: 80.00,
      tax: 16.00,
    }
  ]);

  // Form State for Demo inputs
  const [formData, setFormData] = useState({
    booking_number: "",
    guest_name: "",
    service_type: "Room Service",
    date: "2026-06-15",
    description: "",
    quantity: 1,
    rate: 0.00,
    tax: 0.00
  });

  // Automatically calculate total dynamically for the UI mockup
  const calculatedTotal = (Number(formData.quantity) * Number(formData.rate)) + Number(formData.tax);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Simulated Save Action
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
    // Reset form
    setFormData({
      booking_number: "",
      guest_name: "",
      service_type: "Room Service",
      date: "2026-06-15",
      description: "",
      quantity: 1,
      rate: 0.00,
      tax: 0.00
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative overflow-hidden">
        
        {/* Main Content Header Area */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Extra Charges / Services</h2>
            <p className="text-sm text-slate-500 mt-0.5">Service billing for food, laundry, airport pickups, extra beds, spa amenities, and more.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm">
              <FaFileImport className="text-slate-400" /> Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm">
              <FaFileExport className="text-slate-400" /> Export
            </button>
            <button 
              onClick={() => setIsPanelOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition rounded-xl shadow-md shadow-amber-500/20"
            >
              <FaPlus /> Add New Charge
            </button>
          </div>
        </div>

        {/* Real-Time Operational Smart Metric Grid Counter */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FaTshirt /></div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Laundry</p>
              <h5 className="text-lg font-bold text-slate-800">{services.filter(s => s.service_type === "Laundry").length} Logged</h5>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><FaConciergeBell /></div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Room Service</p>
              <h5 className="text-lg font-bold text-slate-800">{services.filter(s => s.service_type === "Room Service").length} Orders</h5>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><FaPlaneArrival /></div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Transfers</p>
              <h5 className="text-lg font-bold text-slate-800">{services.filter(s => s.service_type === "Airport Pickup").length} Flights</h5>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><FaWineGlassAlt /></div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Mini Bar</p>
              <h5 className="text-lg font-bold text-slate-800">{services.filter(s => s.service_type === "Mini Bar").length} Items</h5>
            </div>
          </div>
        </div>

        {/* Search Bar Row */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative max-w-md w-full">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              readOnly
              placeholder="Search visible columns (Disabled for Form Demo)..."
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Tabular Layout Matrix Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Charge ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking Number</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Guest Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Charge Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">QTY</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tax</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-400">#{item.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{item.booking_number}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.guest_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.date}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                        {item.service_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-[160px] truncate">{item.description}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-center font-semibold">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">${item.rate.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">${item.tax.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">${((item.quantity * item.rate) + item.tax).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"><FaEdit className="w-3.5 h-3.5" /></button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"><FaTrash className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LEADERSHIP SHOWCASE: DYNAMIC ADD NEW SERVICE FORM SIDEBAR PANEL */}
        {/* ========================================================= */}
        {isPanelOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn">
            {/* Click backdrop to close */}
            <div className="absolute inset-0" onClick={() => setIsPanelOpen(false)} />
            
            {/* Form Sidebar Canvas */}
            <div className="relative w-full max-w-md bg-white h-screen shadow-2xl flex flex-col justify-between z-10 animate-slideLeft border-l border-slate-100">
              
              {/* Form Top Bar */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Add Extra Charge / Service</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Post an on-the-fly amenity fee to a guest account folio.</p>
                </div>
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* Form Input Fields body container */}
              <form onSubmit={handleSimulatedSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* Booking Number Input Block */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Booking / Reservation Link *</label>
                  <input
                    type="text"
                    required
                    name="booking_number"
                    value={formData.booking_number}
                    onChange={handleChange}
                    placeholder="e.g., BK-2026-0012"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition text-slate-800"
                  />
                </div>

                {/* Guest Name Input Block */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    name="guest_name"
                    value={formData.guest_name}
                    onChange={handleChange}
                    placeholder="e.g., Alexander Wright"
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition text-slate-800"
                  />
                </div>

                {/* Grid Layout Row: Service Type Dropdown & Charge Log Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Service Type</label>
                    <select
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 transition text-slate-700 font-medium cursor-pointer"
                    >
                      <option value="Room Service">Room Service</option>
                      <option value="Laundry">Laundry</option>
                      <option value="Mini Bar">Mini Bar</option>
                      <option value="Airport Pickup">Airport Pickup</option>
                      <option value="Extra Bed">Extra Bed</option>
                      <option value="Spa Treatments">Spa Treatments</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Charge Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 transition text-slate-700"
                    />
                  </div>
                </div>

                {/* Description Text Input Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Service Details / Description</label>
                  <textarea
                    name="description"
                    rows="2"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide contextual invoice specifics..."
                    className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition text-slate-800 resize-none"
                  />
                </div>

                {/* Financial Arithmetic Breakdown Inputs */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost Accounting Configurator</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500 text-slate-800 font-semibold"
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
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500 text-slate-800 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Tax ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        name="tax"
                        value={formData.tax}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-amber-500 text-slate-800 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Real-Time Formula Feedback calculation display container */}
                  <div className="border-t border-slate-200/60 pt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Calculated Grand Total:</span>
                    <span className="text-base font-extrabold text-slate-900">${calculatedTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Form Action Submissions Bar */}
                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPanelOpen(false)}
                    className="w-1/2 py-2.5 text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-xl transition shadow-md shadow-amber-500/10 flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle /> Log Extra Charge
                  </button>
                </div>
              </form>

              {/* Bottom Decorative Legal Brand Footer for presentation polish */}
              <div className="p-4 bg-slate-900 text-center text-[11px] font-medium text-slate-400">
                Harbor Grand Hotel Ledger Posting System
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default ExtraServices;