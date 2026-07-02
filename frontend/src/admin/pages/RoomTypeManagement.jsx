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
      // Always send numOfRooms (camelCase) — controller maps it to num_of_rooms
      const payload = {
        name:       formData.name,
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
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 shadow-2xl rounded-2xl px-6 py-3.5 text-white text-sm font-semibold border ${
          toast.type === "success"
            ? "bg-emerald-600 border-emerald-500"
            : "bg-rose-600 border-rose-500"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-sm mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Room Type Management</h1>
          <p className="text-slate-500 mt-2">Room type capacity, amenities and default rates.</p>
        </div>
        <button onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition">
          <FaPlus /> Add New
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
        <div className="flex gap-4">
          <div className="relative flex items-center">
            <input type="text" placeholder="Search room type..."
              value={typedQuery}
              onChange={(e) => setTypedQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-4 pr-14 py-3 border border-slate-200 rounded-xl w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            />
            {activeSearch ? (
              <button type="button" onClick={handleClearSearch}
                className="absolute right-2 p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100">
                <FaTimes className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSearchSubmit}
                className="absolute right-2 p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-100">
                <FaSearch className="w-4 h-4" />
              </button>
            )}
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-xl px-4 py-3 bg-white text-slate-700 focus:outline-none text-sm">
            <option value="All Active">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-4">#</th>
              <th className="p-4">Room Type</th>
              <th className="p-4">Code</th>
              <th className="p-4">Rooms Count</th>
              <th className="p-4">Capacity</th>
              <th className="p-4">Base Rate</th>
              <th className="p-4">Amenities</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="9" className="p-8 text-center text-slate-400">Loading...</td></tr>
            ) : filteredRoomTypes.length === 0 ? (
              <tr><td colSpan="9" className="p-8 text-center text-slate-400">No room types found.</td></tr>
            ) : (
              filteredRoomTypes.map((room, index) => (
                <tr key={room.room_type_id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-slate-500 font-medium">{index + 1}</td>
                  <td className="p-4 font-semibold text-slate-800">{room.name}</td>
                  <td className="p-4">
                    {room.code
                      ? <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-mono font-bold">{room.code}</span>
                      : <span className="text-slate-300 text-xs italic">—</span>
                    }
                  </td>
                  {/* ↓ Use num_of_rooms (DB column name returned by API) */}
                  <td className="p-4 text-slate-600">{room.num_of_rooms ?? 0} Rooms</td>
                  <td className="p-4 text-slate-600">{room.capacity} Pax</td>
                  <td className="p-4 text-slate-800 font-medium">${room.base_price}</td>
                  <td className="p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {room.breakfast === 1 || room.breakfast === true
                        ? <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200 text-xs">Free Breakfast</span>
                        : null}
                      {room.bathtub === 1 || room.bathtub === true
                        ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200 text-xs">Bathtub</span>
                        : null}
                      {!room.breakfast && !room.bathtub
                        ? <span className="text-slate-400 italic text-xs">Standard</span>
                        : null}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button type="button"
                        onClick={() => handleToggleStatus(room.room_type_id, room.status)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          room.status === "Active" ? "bg-green-500" : "bg-slate-300"
                        }`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          room.status === "Active" ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                      <span className={`text-xs font-semibold ${room.status === "Active" ? "text-green-600" : "text-slate-400"}`}>
                        {room.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEditModal(room)}
                        className="bg-slate-100 hover:bg-slate-200 p-2 rounded-lg text-slate-600 transition">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteRoomType(room.room_type_id, room.name)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="p-4 border-t text-gray-500 text-sm">
          Showing {filteredRoomTypes.length} of {roomTypes.length} records
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
