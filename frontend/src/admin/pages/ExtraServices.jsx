import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { FaPlus, FaSearch, FaTrash, FaEdit, FaTshirt, FaUtensils, FaCar } from "react-icons/fa";
import AddExtraChargeModal from "../../admin/components/AddExtraChargeModal";
import axios from "axios";
// Base URL is already set globally in main.jsx — use relative paths here.

const ExtraServices = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chargeToEdit, setChargeToEdit] = useState(null);
  const [services, setServices] = useState([]); // Initialized to empty array for database sync
  const [searchTerm, setSearchTerm] = useState("");
  const [metrics, setMetrics] = useState({ laundry_count: 0, car_rental_count: 0, food_count: 0 });

  // 1. Fetch live records from XAMPP on component load
  const fetchServices = async () => {
    try {
      const response = await axios.get("/api/services");
      if (response.data.success) {
        setServices(response.data.services);
        setMetrics(response.data.metrics);
      }
    } catch (error) {
      console.error("Database connection fault:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const getServiceTypeStyle = (type) => {
    switch (type) {
      case "Laundry": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Car Rental": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Food": return "bg-amber-50 text-amber-700 border border-amber-200";
      default: return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const filteredServices = services.filter((item) => {
    const term = searchTerm.toLowerCase();
    // Safely check fields in case database fields return numbers or null values
    const room = item.room_number ? String(item.room_number).toLowerCase() : "";
    const resId = item.reservation_id ? String(item.reservation_id).toLowerCase() : "";
    const name = item.guest_name ? item.guest_name.toLowerCase() : "";
    const type = item.service_type ? item.service_type.toLowerCase() : "";

    return room.includes(term) || resId.includes(term) || name.includes(term) || type.includes(term);
  });

  const openAddModal = () => { setChargeToEdit(null); setIsModalOpen(true); };
  const openEditModal = (item) => { setChargeToEdit(item); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setChargeToEdit(null); };

  // 2. Fire an HTTP DELETE request to remove records from XAMPP
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this charge?")) {
      try {
        await axios.delete(`/api/services/${id}`);

        alert("Deleted successfully!");
        fetchServices(); // Refresh the table list data automatically
      } catch (error) {
        console.error("Delete Error:", error);
        alert("Failed to delete record: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // 3. Fire real API requests into your Laravel controller
  async function handleSaveCharge(data, editingId) {
    try {
      if (editingId) {
        await axios.put(`/api/services/${editingId}`, data);
      } else {
        await axios.post("/api/services", data);
      }
      fetchServices();
      closeModal();
    } catch (error) {
      console.error("API Storage Error:", error.response?.data || error.message);
      alert("Error saving: " + (error.response?.data?.message || "Verify Laravel setup properties."));
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 relative overflow-hidden">
        {/* Statistics Panels using synced server-calculated metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 text-xl text-blue-600"><FaTshirt /></div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Laundry Items</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-0.5">{metrics.laundry_count}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xl text-emerald-600"><FaCar /></div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Car Rentals</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-0.5">{metrics.car_rental_count}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-xl text-amber-600"><FaUtensils /></div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Food Charges</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-0.5">{metrics.food_count}</h3>
            </div>
          </div>
        </div>

        {/* Master Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="relative w-[355px] h-11">
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
              <input type="text" placeholder="Search room number, guest name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-full border border-slate-300 rounded-xl pl-4 pr-11 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 box-border" />
            </div>
            <button onClick={openAddModal} className="h-11 px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl flex items-center gap-2 shadow-sm ml-auto">
              <FaPlus /> <span>Add Extra Charge</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Room</th>
                  <th className="px-5 py-3.5">Guest Name</th>
                  <th className="px-5 py-3.5">Service Type</th>
                  <th className="px-5 py-3.5">Charge Date</th>
                  
                  <th className="px-5 py-3.5">Description</th> 
                  <th className="px-5 py-3.5">Food Items</th>
                  <th className="px-5 py-3.5 text-center">QTY</th>
                  <th className="px-5 py-3.5">Rate</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Handled By</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.length > 0 ? (
                  filteredServices.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium text-slate-900">#{item.id}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {item.room_number ? `Room ${item.room_number}` : <span className="text-slate-300">—</span>}
                        <span className="block text-[10px] font-normal text-slate-400">Res #{item.reservation_id}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{item.guest_name}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${getServiceTypeStyle(item.service_type)}`}>
                          {item.service_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{item.charge_date}</td>


<td className="px-5 py-4 text-slate-600 max-w-[150px] truncate">
  {item.description || <span className="text-slate-300">-</span>}
</td>

{/* Column 2: Food Items (Only renders text if the service type is Food) */}
<td className="px-5 py-4 text-slate-600 max-w-[150px] truncate">
  {item.service_type === "Food" && item.food_items ? (
    item.food_items
  ) : (
    <span className="text-slate-300">-</span>
  )}
</td>

<td className="px-5 py-4 text-center font-mono text-slate-700">{item.quantity}</td>
                      <td className="px-5 py-4 font-mono text-slate-600">${Number(item.rate).toFixed(2)}</td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">${Number(item.total).toFixed(2)}</td>
                      <td className="px-5 py-4 text-slate-500">{item.handled_by || "—"}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button onClick={() => openEditModal(item)} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600">
                            <FaEdit className="w-3.5 h-3.5" />
                          </button>
                          {/* Fixed variables and replaced the missing icon placeholder with FaTrash */}
                          <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors">
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="11" className="px-6 py-12 text-center text-slate-400">No entries match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AddExtraChargeModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSaveCharge} chargeToEdit={chargeToEdit} />
      </div>
    </AdminLayout>
  );
};

export default ExtraServices;