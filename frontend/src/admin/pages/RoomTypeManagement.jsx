import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddRoomTypeModal from "../../admin/components/AddRoomTypeModal";
import axios from "axios";
import {
  FaPlus, FaSearch, FaEdit, FaTrash, FaTimes, FaImage,
  FaThLarge, FaCheckCircle, FaBan, FaBed, FaDollarSign,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
 
const BACKEND_URL = "http://localhost:8000";
 
const STATUS_META = {
  Active:   { badge: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500", ring: "ring-emerald-300" },
  Inactive: { badge: "bg-slate-100 text-slate-600 border-slate-200",      dot: "bg-slate-400",    ring: "ring-slate-200" },
};
const STATUS_ORDER = ["Active", "Inactive"];
 
export default function RoomTypeManagement() {
  const { user } = useAuth();
  const canWrite = (user?.role || "").toLowerCase() === "manager";
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [roomTypes, setRoomTypes]       = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [editingRoom, setEditingRoom]   = useState(null);
  const [typedQuery, setTypedQuery]     = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
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
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("code", formData.code);
      payload.append("base_price", parseFloat(formData.base_price));
      payload.append("extra_person_rate", parseFloat(formData.extra_person_rate || 0));
      payload.append("capacity", parseInt(formData.capacity));
      payload.append("breakfast", formData.breakfast ? 1 : 0);
      payload.append("bathtub", formData.bathtub ? 1 : 0);
      if (formData.image) payload.append("image", formData.image);
 
      if (id) {
        payload.append("_method", "PUT");
        const res = await axios.post(`/api/room-types/${id}`, payload);
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
      showNotification(error.response?.data?.message || "Failed to save room type.", "error");
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
      showNotification(error.response?.data?.message || "Failed to delete room type.", "error");
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
      showNotification(error.response?.data?.message || "Failed to update status.", "error");
      fetchRoomTypes();
    }
  };
 
  const filteredRoomTypes = roomTypes.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(activeSearch.toLowerCase());
    const matchesStatus = statusFilter === "All" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
 
  const totalRoomsAssigned = roomTypes.reduce((sum, r) => sum + (r.num_of_rooms || 0), 0);
  const avgBasePrice = roomTypes.length
    ? roomTypes.reduce((sum, r) => sum + parseFloat(r.base_price || 0), 0) / roomTypes.length
    : 0;
 
  const statTiles = [
    { key: "Total", label: "Total Types", value: roomTypes.length, icon: FaThLarge, chip: "bg-slate-100 text-slate-600" },
    { key: "Active", label: "Active", value: roomTypes.filter((r) => r.status === "Active").length, icon: FaCheckCircle, chip: "bg-emerald-50 text-emerald-600" },
    { key: "Inactive", label: "Inactive", value: roomTypes.filter((r) => r.status === "Inactive").length, icon: FaBan, chip: "bg-slate-100 text-slate-500" },
    { key: "Rooms", label: "Rooms Assigned", value: totalRoomsAssigned, icon: FaBed, chip: "bg-blue-50 text-blue-600" },
    { key: "AvgPrice", label: "Avg Base Price", value: `$${avgBasePrice.toFixed(0)}`, icon: FaDollarSign, chip: "bg-violet-50 text-violet-600" },
  ];
 
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
 
      {/* KPI Stat Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
        {statTiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.key} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tile.chip}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate mb-0.5">{tile.label}</p>
                <p className="text-xl font-bold text-slate-800 leading-tight">{isLoading ? "–" : tile.value}</p>
              </div>
            </div>
          );
        })}
      </div>
 
      {/* Main Container Card Wrapper */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-5 space-y-5">
 
        {/* Top Control Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-3">
           
            {/* Search Bar */}
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
 
            {/* Status Selector Dropdown */}
            <div className="relative h-10 w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-full appearance-none bg-white border border-slate-200 rounded-xl pl-3.5 pr-8 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 cursor-pointer transition-all"
              >
                <option value="All">All Statuses</option>
                {STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
                <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
 
          {/* "+ Add New" Button */}
          {canWrite && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-1.5 h-10 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition rounded-xl shadow-sm"
            >
              <FaPlus className="w-2.5 h-2.5" /> Add New
            </button>
          )}
        </div>
 
        {/* Table Layout Section - Perfectly aligned design */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60">
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Room Type</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Rooms Count</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Base Rate</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Amenities</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="text-center py-14 bg-white">
                    <FaImage className="w-7 h-7 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-400">Loading room types records...</p>
                  </td>
                </tr>
              ) : filteredRoomTypes.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-14 bg-white">
                    <FaSearch className="w-7 h-7 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-400">No room types found matching your search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredRoomTypes.map((room, index) => {
                  const meta = STATUS_META[room.status] || STATUS_META.Inactive;
                  return (
                    <tr key={room.room_type_id} className="hover:bg-slate-50/50 transition bg-white">
                      <td className="px-5 py-3 text-sm font-medium text-slate-400">{index + 1}</td>
                      <td className="px-5 py-3 text-sm">
                        <div className={`w-10 h-10 rounded-lg overflow-hidden bg-slate-50 ring-2 ${meta.ring} ring-offset-1 ring-offset-white shadow-sm flex items-center justify-center`}>
                          {room.image ? (
                            <img src={`${BACKEND_URL}/storage/${room.image}`} alt={room.name} className="w-full h-full object-cover" />
                          ) : (
                            <FaImage className="text-slate-300 w-4 h-4" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-slate-800">{room.name}</td>
                      <td className="px-5 py-3 text-sm">
                        {room.code ? (
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-mono font-bold">{room.code}</span>
                        ) : (
                          <span className="text-slate-300 text-xs italic">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100">
                          {room.num_of_rooms ?? 0} Rooms
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100">
                          {room.capacity} Pax
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-800 font-semibold">${room.base_price}</td>
                      <td className="px-5 py-3 text-sm">
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
                      <td className="px-5 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Toggle Active / Inactive"
                            onClick={() => handleToggleStatus(room.room_type_id, room.status)}
                            disabled={!canWrite}
                            className={`relative inline-flex h-4.5 w-8 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${room.status === "Active" ? "bg-green-500" : "bg-slate-300"} ${canWrite ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                          >
                            <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${room.status === "Active" ? "translate-x-3.5" : "translate-x-0"}`} />
                          </button>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${meta.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                            {room.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <div className="flex items-center justify-center gap-1">
                          {canWrite ? (
                            <>
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
                            </>
                          ) : (
                            <span className="text-slate-300 text-xs italic">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
 
