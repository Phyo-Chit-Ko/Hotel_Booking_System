import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaTshirt,
  FaUtensils,
  FaCar,
} from "react-icons/fa";
import AddExtraChargeModal from "../../admin/components/AddExtraChargeModal";

const ExtraServices = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chargeToEdit, setChargeToEdit] = useState(null);

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

  const [searchTerm, setSearchTerm] = useState("");

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

  const openAddModal = () => {
    setChargeToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setChargeToEdit(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setChargeToEdit(null);
  };

  const handleDeleteCharge = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Called by AddExtraChargeModal on submit.
  // editingId is null when adding, or the record id when editing.
  const handleSaveCharge = (data, editingId) => {
    if (editingId) {
      setServices((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...data } : s))
      );
    } else {
      setServices((prev) => [{ id: prev.length + 1, ...data }, ...prev]);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative overflow-hidden">

        {/* Statistics Panels */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-xl text-blue-600">
                <FaTshirt />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Laundry</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">
                  {services.filter((s) => s.service_type === "Laundry").length}
                </h3>
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
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">
                  {services.filter((s) => s.service_type === "Car Rental").length}
                </h3>
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
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">
                  {services.filter((s) => s.service_type === "Food").length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Master Card Box Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">

          {/* Controls Row */}
          <div className="flex items-center gap-3">
            <div className="relative w-[355px] h-11">
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
              <input
                type="text"
                placeholder="Search reservation , guest..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border"
              />
            </div>

            <button
              onClick={openAddModal}
              className="h-11 px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 ml-auto"
            >
              <FaPlus className="text-sm" />
              <span>Add New</span>
            </button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Charge ID</th>
                  <th className="px-5 py-3.5 font-medium">Reservation Number</th>
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
                      <td className="px-5 py-4 text-slate-600 max-w-[160px] truncate" title={item.description}>
                        {item.description}
                      </td>
                      <td className="px-5 py-4 text-center font-mono font-medium text-slate-700">{item.quantity}</td>
                      <td className="px-5 py-4 font-mono text-slate-600">${item.rate.toFixed(2)}</td>
                      <td className="px-5 py-4 font-mono text-slate-400">${item.tax.toFixed(2)}</td>
                      <td className="px-5 py-4 font-mono font-semibold text-slate-900">
                        ${((item.quantity * item.rate) + item.tax).toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 transition"
                            title="Edit Charge"
                          >
                            <FaEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCharge(item.id)}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-rose-500 hover:bg-rose-50 transition"
                            title="Delete Charge"
                          >
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

        {/* Centered Add/Edit Modal */}
        <AddExtraChargeModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSaveCharge}
          chargeToEdit={chargeToEdit}
        />

      </div>
    </AdminLayout>
  );
};

export default ExtraServices;
