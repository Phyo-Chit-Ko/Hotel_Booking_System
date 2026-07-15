import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AdminLayout from "../layouts/AdminLayout";
import AddRoomModal from "../components/AddRoomModal";
import RoomDetailModal from "../components/RoomDetailModal";
import axios from "axios";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaBed,
  FaEye,
} from "react-icons/fa";
import { STATUS_META, STATUS_ORDER, FALLBACK_STATUS_META } from "../constants/roomStatus";
import { useAuth } from "../../context/AuthContext";

export default function RoomManagement() {
  const { user } = useAuth();
  const canWrite = (user?.role || "").toLowerCase() === "manager";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingRoomNumber, setViewingRoomNumber] = useState(null);

  // States for Searching & Filtering
  const [typedQuery, setTypedQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // States for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // adjust as needed

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

  // Reset to page 1 whenever the filtered result set changes,
  // so we never get stuck on a page that no longer has any rows.
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSearch, statusFilter]);

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

  const handleOpenDetail = (room) => {
    setViewingRoomNumber(room.room_number);
    setIsDetailOpen(true);
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

  const handleChangeStatus = async (roomNumber, nextStatus) => {
    const previousStatus = rooms.find((r) => r.room_number === roomNumber)?.status;
    if (nextStatus === previousStatus) return;

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
      toast.error("Failed to update room status.");
      fetchData();
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.room_number
      .toLowerCase()
      .includes(activeSearch.toLowerCase());
    const matchesStatus = statusFilter === "All" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination derived state
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / itemsPerPage));
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getRoomTypeName = (typeId) => {
    const typeObj = roomTypes.find((t) => t.room_type_id === typeId);
    return typeObj ? typeObj.name : `Type ID: ${typeId}`;
  };

  // Sourced from the rooms that actually exist, instead of a hardcoded list —
  // so the Add Room form's floor suggestions always reflect real data.
  const floorOptions = [...new Set(rooms.map((r) => r.floor).filter(Boolean))].sort();

  const statTiles = [
    { key: "Total", filterValue: "All", label: "Total Rooms", value: rooms.length, icon: FaBed, chip: "bg-slate-100 text-slate-600" },
    ...STATUS_ORDER.map((status) => ({
      key: status,
      filterValue: status,
      label: status,
      value: rooms.filter((r) => r.status === status).length,
      icon: STATUS_META[status].icon,
      chip: STATUS_META[status].chip,
    })),
  ];

  return (
    <AdminLayout>
      {/* KPI Stat Tiles — click to filter the table below */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
        {statTiles.map((tile) => {
          const Icon = tile.icon;
          const isActive = statusFilter === tile.filterValue;
          return (
            <button
              key={tile.key}
              type="button"
              onClick={() => setStatusFilter(tile.filterValue)}
              className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-3 text-left transition ${
                isActive ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tile.chip}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-slate-800 leading-tight">{isLoading ? "–" : tile.value}</p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate">{tile.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Container Card Wrapper */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-5 space-y-5">

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

          {/* Add Room Black Button */}
          {canWrite && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-1.5 h-10 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition rounded-xl shadow-sm"
            >
              <FaPlus className="w-2.5 h-2.5" /> Add Room
            </button>
          )}

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
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Change Status</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-14">
                    <FaBed className="w-7 h-7 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-400">Loading room database records...</p>
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-14">
                    <FaSearch className="w-7 h-7 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-400">
                      No rooms found{activeSearch ? ` matching "${activeSearch}"` : ""}.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRooms.map((room, index) => {
                  const meta = STATUS_META[room.status] || FALLBACK_STATUS_META;
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                  <tr key={room.room_number} className="hover:bg-slate-50/40 transition group">
                    <td className="px-5 py-2 text-sm font-medium text-slate-400">
                      {rowNumber}
                    </td>
                    <td className="px-5 py-2 text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                          <FaBed className="w-3 h-3" />
                        </span>
                        <span className="font-bold text-slate-800">{room.room_number}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                        {getRoomTypeName(room.room_type_id)}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-xs font-medium border border-slate-100">
                        {room.floor === 0 ? "Ground Floor" : `Floor ${room.floor}`}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${meta.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {room.status}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-sm">
                      <div className="relative w-36">
                        <select
                          value={room.status}
                          disabled={!canWrite}
                          onChange={(e) => handleChangeStatus(room.room_number, e.target.value)}
                          className="w-full h-8 appearance-none bg-white border border-slate-200 rounded-lg pl-2.5 pr-7 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {STATUS_ORDER.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
                          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2 text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenDetail(room)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                        </button>
                        {canWrite && (
                          <>
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
                          </>
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

        {/* Pagination Controls */}
        {!isLoading && filteredRooms.length > 0 && (
          <div className="flex items-center justify-between px-1 pt-2">
            <p className="text-xs text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1}
              –{Math.min(currentPage * itemsPerPage, filteredRooms.length)} of {filteredRooms.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-xs font-semibold rounded-lg border transition ${
                    page === currentPage
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL WINDOW */}
      <AddRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRoom}
        roomToEdit={editingRoom}
        roomTypes={roomTypes}
        floors={floorOptions}
      />

      <RoomDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        roomNumber={viewingRoomNumber}
      />
    </AdminLayout>
  );
}
