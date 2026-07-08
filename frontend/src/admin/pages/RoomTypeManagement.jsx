import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddRoomTypeModal from "../../admin/components/AddRoomTypeModal";
import axios from "axios";
import {
  FaPlus, FaSearch, FaEdit, FaTrash, FaTimes,
} from "react-icons/fa";

export default function RoomTypeManagement() {
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [roomTypes, setRoomTypes]       = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [editingRoom, setEditingRoom]   = useState(null);
  const [typedQuery, setTypedQuery]     = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Active");
  const [toast, setToast]               = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 3000);
  };

  const fetchRoomTypes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/room-types");
      setRoomTypes(response.data);
    } catch (error) {
      console.error("Error fetching room types:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRoomTypes(); }, []);

  const handleSearchSubmit = (e) => { if (e) e.preventDefault(); setActiveSearch(typedQuery); };
  const handleClearSearch  = () => { setTypedQuery(""); setActiveSearch(""); };
  const handleKeyDown      = (e) => { if (e.key === "Enter") handleSearchSubmit(); };

  const handleOpenAddModal  = () => { setEditingRoom(null); setIsModalOpen(true); };
  const handleOpenEditModal = (room) => { setEditingRoom(room); setIsModalOpen(true); };

  const handleSaveRoomType = async (formData, id = null) => {
    try {
      const payload = {
        name:       formData.name,
        code:       formData.code,
        numOfRooms: parseInt(formData.numOfRooms || formData.num_of_rooms || 0),
        base_price: parseFloat(formData.base_price),
        capacity:   parseInt(formData.capacity),
        breakfast:  formData.breakfast ? 1 : 0,
        bathtub:    formData.bathtub   ? 1 : 0,
      };

      if (id) {
        const res = await axios.put(`/api/room-types/${id}`, payload);
        if (res.status === 200) {
          showNotification("Room Type updated successfully!", "success");
          fetchRoomTypes();
        }
      } else {
        const res = await axios.post("/api/room-types", payload);
        if (res.status === 201) {
          showNotification("New Room Type added successfully!", "success");
          fetchRoomTypes();
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving room type:", error);
      showNotification("Failed to save room type.", "error");
    }
  };

  const handleDeleteRoomType = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await axios.delete(`/api/room-types/${id}`);
      if (res.status === 200 || res.status === 204) {
        showNotification(`"${name}" deleted successfully.`, "success");
        setRoomTypes((prev) => prev.filter((r) => r.room_type_id !== id));
      }
    } catch (error) {
      console.error("Error deleting room type:", error);
      showNotification("Failed to delete room type.", "error");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      setRoomTypes((prev) => prev.map((r) => r.room_type_id === id ? { ...r, status: nextStatus } : r));
      await axios.patch(`/api/room-types/${id}/toggle-status`, { status: nextStatus });
      showNotification(`Status changed to ${nextStatus}.`, "success");
    } catch (error) {
      console.error("Error toggling status:", error);
      showNotification("Failed to update status.", "error");
      fetchRoomTypes();
    }
  };

  const filteredRoomTypes = roomTypes.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(activeSearch.toLowerCase());
    if (statusFilter === "Active")   return matchesSearch && room.status === "Active";
    if (statusFilter === "Inactive") return matchesSearch && room.status === "Inactive";
    return matchesSearch;
  });

  return (
    <AdminLayout>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 shadow-2xl rounded-2xl px-6 py-3.5 text-white text-sm font-semibold border ${
          toast.type === "success" ? "bg-emerald-600 border-emerald-500" : "bg-rose-600 border-rose-500"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Main Container Card Wrapper */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-5 space-y-5 mt-2">
        
        {/* Top Control Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          <div className="flex flex-row items-center gap-3">
            
            {/* Compact Search Bar Layout */}
            <div className="relative flex items-center h-10 w-64 bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-500 transition-all">
              <input 
                type="text" 
                placeholder="Search room type..."
                value={typedQuery}
                onChange={(e) => setTypedQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent h-full pl-3.5 pr-9 text-sm text-slate-800 outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                {typedQuery ? (
                  <button type="button" onClick={handleClearSearch} className="text-rose-500 hover:text-rose-700 transition">
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button type="button" onClick={handleSearchSubmit} className="text-slate-400 hover:text-slate-600 transition">
                    <FaSearch className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Compact Status Selector Dropdown */}
            <div className="relative h-10 w-40">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-full appearance-none bg-white border border-slate-200 rounded-xl pl-3.5 pr-8 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 cursor-pointer transition-all"
              >
                <option value="All Active">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
                <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

          </div>

          {/* "+ Add New" Button */}
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 h-10 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition rounded-xl shadow-sm"
          >
            <FaPlus className="w-2.5 h-2.5" /> Add New
          </button>

        </div>

        {/* Clean Table Layout Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Room Type</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rooms Count</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacity</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Rate</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amenities</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="9" className="text-center py-10 text-sm font-medium text-slate-400">Loading room types records...</td></tr>
              ) : filteredRoomTypes.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-10 text-sm font-medium text-slate-400">No room types found matching your search criteria.</td></tr>
              ) : (
                filteredRoomTypes.map((room, index) => (
                  <tr key={room.room_type_id} className="hover:bg-slate-50/40 transition group">
                    <td className="px-5 py-2 text-sm font-medium text-slate-400">{index + 1}</td>
                    <td className="px-5 py-2 text-sm font-bold text-slate-800">{room.name}</td>
                    <td className="px-5 py-2 text-sm">
                      {room.code ? (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-mono font-bold">{room.code}</span>
                      ) : (
                        <span className="text-slate-300 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="px-5 py-2 text-sm text-slate-500">{room.num_of_rooms ?? 0} Rooms</td>
                    <td className="px-5 py-2 text-sm text-slate-500">{room.capacity} Pax</td>
                    <td className="px-5 py-2 text-sm text-slate-800 font-semibold">${room.base_price}</td>
                    <td className="px-5 py-2 text-sm">
                      <div className="flex gap-1 flex-wrap">
                        {room.breakfast === 1 || room.breakfast === true ? (
                          <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100 text-xs">Free Breakfast</span>
                        ) : null}
                        {room.bathtub === 1 || room.bathtub === true ? (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100 text-xs">Bathtub</span>
                        ) : null}
                        {!room.breakfast && !room.bathtub ? (
                          <span className="text-slate-400 italic text-xs">Standard</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => handleToggleStatus(room.room_type_id, room.status)}
                          className={`relative inline-flex h-4.5 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${room.status === "Active" ? "bg-green-500" : "bg-slate-300"}`}
                        >
                          <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${room.status === "Active" ? "translate-x-3.5" : "translate-x-0"}`} />
                        </button>
                        <span className={`text-xs font-semibold ${room.status === "Active" ? "text-green-600" : "text-slate-400"}`}>
                          {room.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-2 text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleOpenEditModal(room)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRoomType(room.room_type_id, room.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      <AddRoomTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRoomType}
        roomToEdit={editingRoom}
      />
    </AdminLayout>
  );
}