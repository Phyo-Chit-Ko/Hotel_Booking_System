import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AdminLayout from "../layouts/AdminLayout";
import AddRoomModal from "../components/AddRoomModal";
import axios from "axios";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

export default function RoomManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState(null);

  // States for Searching & Filtering
  const [typedQuery, setTypedQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Active");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [roomsResponse, roomTypesResponse] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/rooms"),
        axios.get("http://127.0.0.1:8000/api/room-types"),
      ]);
      setRooms(roomsResponse.data);
      setRoomTypes(roomTypesResponse.data);
    } catch (error) {
      console.error("Error pulling data from database:", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveSearch(typedQuery);
  };

  const handleClearSearch = () => {
    setTypedQuery("");
    setActiveSearch("");
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

  const handleSaveRoom = async (formData, isEditing) => {
    try {
      if (isEditing) {
        await axios.put(
          `http://127.0.0.1:8000/api/rooms/${formData.room_number}`,
          formData,
        );
        toast.success("Room updated successfully!");
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/rooms",
          formData,
        );
        toast.success("New room created successfully!");
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.log("Validation Error:", error.response?.data);
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to commit database modifications.",
      );
    }
  };

  const handleDeleteRoom = async (roomNumber) => {
    if (
      window.confirm(
        `Are you sure you want to permanently remove Room ${roomNumber}?`,
      )
    ) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/rooms/${roomNumber}`);
        toast.success("Room purged successfully.");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete room item context.");
      }
    }
  };

  const handleToggleStatus = async (roomNumber, currentStatus) => {
    const nextStatus =
      currentStatus === "Available" ? "Maintenance" : "Available";

    try {
      setRooms((prev) =>
        prev.map((room) =>
          room.room_number === roomNumber
            ? { ...room, status: nextStatus }
            : room,
        ),
      );

      await axios.patch(
        `http://127.0.0.1:8000/api/rooms/${roomNumber}/toggle-status`,
        {
          status: nextStatus,
        },
      );
      toast.success(`Room ${roomNumber} status switched to ${nextStatus}.`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to sync toggle status change.");
      fetchData();
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.room_number
      .toLowerCase()
      .includes(activeSearch.toLowerCase());

    if (statusFilter === "Active")
      return matchesSearch && room.status === "Available";

    if (statusFilter === "Inactive")
      return matchesSearch && room.status !== "Available";

    return matchesSearch;
  });

  const getRoomTypeName = (typeId) => {
    const typeObj = roomTypes.find((t) => t.room_type_id === typeId);
    return typeObj ? typeObj.name : `Type ID: ${typeId}`;
  };

  return (
    <AdminLayout>
      {/* Main Container Card Wrapper */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-5 space-y-5 mt-2">
        
        {/* Top Control Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          <div className="flex flex-row items-center gap-3">
            
            {/* Compact Search Bar Layout */}
            <div className="relative flex items-center h-10 w-64 bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-500 transition-all">
              <input
                type="text"
                placeholder="Search room number..."
                value={typedQuery}
                onChange={(e) => setTypedQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent h-full pl-3.5 pr-9 text-sm text-slate-800 outline-none"
              />
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                {typedQuery ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-rose-500 hover:text-rose-700 transition"
                  >
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <FaSearch className="w-3.5 h-3.5" />
                  </button>
                )
                }
              </div>
            </div>

            {/* Compact Status Selector Dropdown */}
            <div className="relative h-10 w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-full appearance-none bg-white border border-slate-200 rounded-xl pl-3.5 pr-8 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 cursor-pointer transition-all"
              >
                <option value="All Active">All Statuses</option>
                <option value="Active">Available Only</option>
                <option value="Inactive">Occupied / Maint.</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
                <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

          </div>

          {/* Add Room Black Button */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 h-10 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition rounded-xl shadow-sm"
          >
            <FaPlus className="w-2.5 h-2.5" /> Add Room
          </button>

        </div>

        {/* Clean Table Layout Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Room Number</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Room Type</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Floor Location</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Toggle</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-sm font-medium text-slate-400">
                    Loading room database records...
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-sm font-medium text-slate-400">
                    No rooms found matching "{activeSearch}".
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room, index) => (
                  <tr key={room.room_number} className="hover:bg-slate-50/40 transition group">
                    <td className="px-5 py-2 text-sm font-medium text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-5 py-2 text-sm font-bold text-slate-800">
                      {room.room_number}
                    </td>
                    <td className="px-5 py-2 text-sm font-semibold text-slate-700">
                      {getRoomTypeName(room.room_type_id)}
                    </td>
                    <td className="px-5 py-2 text-sm text-slate-500">
                      {room.floor === 0 ? "Ground Floor" : `Floor ${room.floor}`}
                    </td>
                    <td className="px-5 py-2 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize border ${
                          room.status === "Available"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : room.status === "Occupied"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(room.room_number, room.status)}
                          className={`relative inline-flex h-4.5 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${room.status === "Available" ? "bg-green-500" : "bg-slate-300"}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${room.status === "Available" ? "translate-x-3.5" : "translate-x-0"}`}
                          />
                        </button>
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
                          onClick={() => handleDeleteRoom(room.room_number)}
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

      {/* MODAL WINDOW */}
      <AddRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRoom}
        roomToEdit={editingRoom}
        roomTypes={roomTypes}
      />
    </AdminLayout>
  );
}