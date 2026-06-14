import { useState, useEffect } from "react";

import { toast } from "react-hot-toast";

import AdminLayout from "../layouts/AdminLayout";

import AddRoomModal from "../components/AddRoomModal"; // You will create this modal next

import axios from "axios";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaFileExport,
  FaFileImport,
  FaTimes,
} from "react-icons/fa";

export default function RoomManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [rooms, setRooms] = useState([]);

  const [roomTypes, setRoomTypes] = useState([]); // Needed to correlate names & select options

  const [isLoading, setIsLoading] = useState(true);

  const [editingRoom, setEditingRoom] = useState(null);

  // States for Searching & Filtering

  const [typedQuery, setTypedQuery] = useState("");

  const [activeSearch, setActiveSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All Active");

  // Fetch both Rooms and Room Types for data relationship mapping

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

  // Search Execution Handlers

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

  // Create / Update handler using room_number as identifier

  // Function triggered inside RoomManagement when the Modal hits "Save"

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

  // Function triggered when hitting the trash icon in your table row line

  const handleDeleteRoom = async (roomNumber) => {
    if (
      window.confirm(
        `Are you sure you want to permanently remove Room ${roomNumber}?`,
      )
    ) {
      try {
        // Deleting route maps to: DELETE http://127.0.0.1:8000/api/rooms/{room_number}

        await axios.delete(`http://127.0.0.1:8000/api/rooms/${roomNumber}`);

        toast.success("Room purged successfully.");

        fetchData(); // Refresh layout view state
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

  // Client-Side Search and Filter Logic

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

  // Helper function to find the text name matching the foreign key ID

  const getRoomTypeName = (typeId) => {
    const typeObj = roomTypes.find((t) => t.room_type_id === typeId);

    return typeObj ? typeObj.name : `Type ID: ${typeId}`;
  };

  return (
    <AdminLayout>
      {/* Header */}

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-sm mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Room Management</h1>

          <p className="text-slate-500 mt-2">
            Physical room tracking, floor levels, and availability statuses.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition"
        >
          <FaPlus />
          Add Room
        </button>
      </div>

      {/* Filters */}

      <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            {/* SEARCH CONTAINER */}

            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search room number..."
                value={typedQuery}
                onChange={(e) => setTypedQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-4 pr-14 py-3 border border-slate-200 rounded-xl w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />

              {activeSearch ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100"
                  title="Clear Filter State"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              ) : (
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

              <option value="Active">Available Only</option>

              <option value="Inactive">Occupied / Maintenance Only</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button className="border px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition text-sm">
              <FaFileExport /> Export
            </button>

            <button className="border px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-50 text-slate-700 transition text-sm">
              <FaFileImport /> Import
            </button>
          </div>
        </div>
      </div>

      {/* Table */}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-4">#</th>

              <th className="p-4">Room Number</th>

              <th className="p-4">Room Type Configuration</th>

              <th className="p-4">Floor Location</th>

              <th className="p-4">Status Indicator</th>

              <th className="p-4">Quick Toggle</th>

              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan="7"
                  className="p-8 text-center text-slate-400 font-medium"
                >
                  Loading room database records...
                </td>
              </tr>
            ) : filteredRooms.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="p-8 text-center text-slate-400 font-medium"
                >
                  No rooms found matching "{activeSearch}".
                </td>
              </tr>
            ) : (
              filteredRooms.map((room, index) => (
                <tr
                  key={room.room_number}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 text-slate-500 font-medium">
                    {index + 1}
                  </td>

                  <td className="p-4 font-bold text-blue-600 text-lg">
                    {room.room_number}
                  </td>

                  <td className="p-4 font-semibold text-slate-800">
                    {getRoomTypeName(room.room_type_id)}
                  </td>

                  <td className="p-4 text-slate-600">
                    {room.floor === 0 ? "Ground Floor" : `Floor ${room.floor}`}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        room.status === "Available"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : room.status === "Occupied"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {room.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(room.room_number, room.status)
                        }
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${room.status === "Available" ? "bg-green-500" : "bg-slate-300"}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${room.status === "Available" ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
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
                        onClick={() => handleDeleteRoom(room.room_number)}
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
          Showing {filteredRooms.length} of {rooms.length} records
        </div>
      </div>

      {/* MODAL WINDOW PASSING ROOM TYPES LIST FOR DROPDOWN FORMS */}

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
