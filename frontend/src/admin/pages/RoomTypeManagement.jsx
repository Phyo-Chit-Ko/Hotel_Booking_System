import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddRoomTypeModal from "../../admin/components/AddRoomTypeModal";
import axios from "axios";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaFileExport,
  FaFileImport,
  FaTimes, // NEW: Imported close/cancel icon
} from "react-icons/fa";

export default function RoomTypeManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState(null);

  // States for Searching & Filtering
  const [typedQuery, setTypedQuery] = useState("");      
  const [activeSearch, setActiveSearch] = useState("");  
  const [statusFilter, setStatusFilter] = useState("All Active");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const fetchRoomTypes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/room-types");
      setRoomTypes(response.data);
    } catch (error) {
      console.error("Error pulling data from database:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  // Search Execution Handler
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault(); 
    setActiveSearch(typedQuery); 
  };

  // SMART NEW FUNCTION: Instantly clears the search filters and restores original table data
  const handleClearSearch = () => {
    setTypedQuery("");      // Clear the text input field
    setActiveSearch("");    // Reset the active search filter array constraint
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleOpenAddModal = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleSaveRoomType = async (newRoomTypeData, id = null) => {
    try {
      const payload = {
        name: newRoomTypeData.name,
        numOfRooms: parseInt(newRoomTypeData.numOfRooms),
        base_price: parseFloat(newRoomTypeData.base_price),
        capacity: parseInt(newRoomTypeData.capacity),
        breakfast: newRoomTypeData.breakfast ? 1 : 0,
        bathtub: newRoomTypeData.bathtub ? 1 : 0,
      };

      if (id) {
        const response = await axios.put(`http://127.0.0.1:8000/api/room-types/${id}`, payload);
        if (response.status === 200) {
          showNotification("Room Type configuration updated successfully!", "success");
          fetchRoomTypes();
        }
      } else {
        payload.status = "Active";
        const response = await axios.post("http://127.0.0.1:8000/api/room-types", payload);
        if (response.status === 201) {
          showNotification("New Room Type added successfully!", "success");
          fetchRoomTypes();
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving room type modifications:", error);
      showNotification("Failed to save room type configurations.", "error");
    }
  };

  const handleDeleteRoomType = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete the "${name}" room configuration?`)) {
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/room-types/${id}`);
        if (response.status === 200 || response.status === 204) {
          showNotification(`"${name}" has been successfully deleted.`, "success");
          setRoomTypes((prev) => prev.filter((room) => room.room_type_id !== id));
        }
      } catch (error) {
        console.error("Error executing table row drop command:", error);
        showNotification("Failed to delete selected room type.", "error");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      setRoomTypes(prev => 
        prev.map(room => room.room_type_id === id ? { ...room, status: nextStatus } : room)
      );
      await axios.patch(`http://127.0.0.1:8000/api/room-types/${id}/toggle-status`, {
        status: nextStatus
      });
      showNotification(`Room status switched to ${nextStatus}.`, "success");
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification("Failed to sync toggle status change.", "error");
      fetchRoomTypes();
    }
  };

  const filteredRoomTypes = roomTypes.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(activeSearch.toLowerCase());
    if (statusFilter === "Active") return matchesSearch && room.status === "Active";
    if (statusFilter === "Inactive") return matchesSearch && room.status === "Inactive";
    return matchesSearch;
  });

  return (
    <AdminLayout>
      {/* FLOATING TOAST NOTIFICATION BANNER LAYER */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-300 shadow-2xl rounded-2xl px-6 py-3.5 flex items-center text-white text-sm font-semibold border ${
          toast.type === "success" 
            ? "bg-emerald-600 border-emerald-500 shadow-emerald-600/20" 
            : "bg-rose-600 border-rose-500 shadow-rose-600/20"
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

        <button 
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition"
        >
          <FaPlus />
          Add New
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            
            {/* SEARCH CONTAINER WITH THE INTELLIGENT DYNAMIC CANCEL BUTTON */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search room type..."
                value={typedQuery}
                onChange={(e) => setTypedQuery(e.target.value)} 
                onKeyDown={handleKeyDown}                       
                className="pl-4 pr-14 py-3 border border-slate-200 rounded-xl w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
              
              {/* DYNAMIC ACTION BUTTON */}
              {activeSearch ? (
                // If there is an active filtered state, render a clean red/gray 'X' cancel button
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100"
                  title="Clear Filter State"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              ) : (
                // Otherwise, show the default blue magnifying search validation trigger button
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="absolute right-2 p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-100"
                  title="Click to Search"
                >
                  <FaSearch className="w-4 h-4" />
                </button>
              )}
            </div>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-xl px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
            >
              <option value="All Active">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-4">#</th>
              <th className="p-4">Room Type</th>
              <th className="p-4">Rooms Count</th>
              <th className="p-4">Capacity</th>
              <th className="p-4">Base Rate</th>
              <th className="p-4">Amenities</th>
              <th className="p-4">Status Toggle</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-slate-400 font-medium">Loading database records...</td>
              </tr>
            ) : filteredRoomTypes.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-slate-400 font-medium">
                  No room types found matching "{activeSearch}".
                </td>
              </tr>
            ) : (
              filteredRoomTypes.map((room, index) => (
                <tr key={room.room_type_id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-slate-500 font-medium">{index + 1}</td>
                  <td className="p-4 font-semibold text-slate-800">{room.name}</td>
                  <td className="p-4 text-slate-600">{room.numOfRooms} Rooms</td>
                  <td className="p-4 text-slate-600">{room.capacity} Pax</td>
                  <td className="p-4 text-slate-800 font-medium">${room.base_price}</td>
                  
                  <td className="p-4 text-slate-600 text-xs max-w-xs truncate">
                    <div className="flex gap-1.5 flex-wrap">
                      {room.breakfast === 1 && <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">Free Breakfast</span>}
                      {room.bathtub === 1 && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">Bathtub</span>}
                      {room.breakfast !== 1 && room.bathtub !== 1 && <span className="text-slate-400 italic">Standard Utilities</span>}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(room.room_type_id, room.status)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${room.status === "Active" ? "bg-green-500" : "bg-slate-300"}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${room.status === "Active" ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                      <span className={`text-xs font-semibold ${room.status === "Active" ? "text-green-600" : "text-slate-400"}`}>{room.status}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(room)}
                        className="bg-slate-100 hover:bg-slate-200 p-2 rounded-lg text-slate-600 transition"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteRoomType(room.room_type_id, room.name)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
                      >
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