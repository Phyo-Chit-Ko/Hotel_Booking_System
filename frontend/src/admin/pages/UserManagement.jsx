import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddUser from "../components/AddUser";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FaPlus,
  FaSearch,
  FaTrash
} from "react-icons/fa";
 
const API_BASE_URL = "http://localhost:8000/api/users";
 
const ROLE_PRIORITY = {
  admin: 1,
  manager: 2,
  receptionist: 3,
  reception: 3,
  user: 4
};
 
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
 
  // States for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
 
  useEffect(() => {
    fetchUsersFromDB();
  }, []);
 
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole]);
 
  const fetchUsersFromDB = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Error retrieving users:", error);
      toast.error("Could not load users from the server.");
    } finally {
      setLoading(false);
    }
  };
 
  const handleSaveUser = async (formData) => {
    try {
      const response = await axios.post(API_BASE_URL, formData);
      if (response.status === 201) {
        setUsers([...users, response.data.user]);
        toast.success("User added successfully!");
      }
      setIsPanelOpen(false);
    } catch (error) {
      console.error("API Error:", error);
      const serverMessage = error.response?.data?.message || error.message;
      const errorsDetail = error.response?.data?.errors
        ? " " + JSON.stringify(error.response.data.errors)
        : "";
      toast.error(`${serverMessage}${errorsDetail}`);
    }
  };
 
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to permanently delete this user account?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${userId}`);
        setUsers(users.filter((user) => user.user_id !== userId && user.id !== userId));
        toast.success("User deleted successfully.");
      } catch (error) {
        console.error("Error deleting database record:", error);
        toast.error(error.response?.data?.message || "Could not remove user from the database.");
      }
    }
  };
 
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase());
 
      const matchesRole =
        selectedRole === "All Roles" ||
        user.role?.toLowerCase() === selectedRole.toLowerCase();
 
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const priorityA = ROLE_PRIORITY[a.role?.toLowerCase()] || 99;
      const priorityB = ROLE_PRIORITY[b.role?.toLowerCase()] || 99;
      return priorityA - priorityB;
    });
 
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
 
  return (
    <AdminLayout>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-5 space-y-5 mt-2">
       
        {/* Top Filter Controls Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-3">
           
            {/* Search Bar */}
            <div className="relative flex items-center h-10 w-64 bg-white rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-500 transition-all">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent h-full pl-3.5 pr-9 text-sm text-slate-800 outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
                <FaSearch className="w-3.5 h-3.5" />
              </div>
            </div>
 
            {/* Roles Dropdown */}
            <div className="relative h-10 w-40">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-full appearance-none bg-white border border-slate-200 rounded-xl pl-3.5 pr-8 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 cursor-pointer transition-all"
              >
                <option value="All Roles">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Receptionist">Receptionist</option>
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
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center justify-center gap-1.5 h-10 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition rounded-xl shadow-sm"
          >
            <FaPlus className="w-2.5 h-2.5" /> Add New
          </button>
        </div>
 
        {/* Table Layout Section - Styled with rounded corners and distinct headers */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60">
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="ppx-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-sm font-medium text-slate-400 bg-white">
                    Syncing data grid metrics with database...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                paginatedUsers.map((user, index) => {
                  const idToShow = user.user_id || user.id;
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  const userRole = user.role?.toLowerCase();
                  const isDeleteDisabled = userRole === "admin" || userRole === "user";
 
                  return (
                    <tr key={idToShow} className="hover:bg-slate-50/50 transition bg-white">
                      <td className="px-5 py-3 text-sm font-medium text-slate-400">{rowNumber}</td>
                      <td className="px-5 py-3 text-sm font-bold text-slate-800">{user.name}</td>
                      <td className="px-5 py-3 text-sm text-slate-500">{user.email}</td>
                      <td className="px-5 py-3 text-sm text-slate-500">{user.phone || "—"}</td>
                      <td className="px-5 py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold capitalize ${
                            user.status?.toLowerCase() === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <div className="flex items-center justify-center gap-1">
                          {!isDeleteDisabled ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(idToShow)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                            >
                              <FaTrash className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              title={`${user.role} accounts cannot be deleted.`}
                              className="p-1.5 text-slate-200 cursor-not-allowed"
                            >
                              <FaTrash className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-sm font-medium text-slate-400 bg-white">
                    No users found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
 
        {/* Pagination Controls */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-1 pt-2">
            <p className="text-xs text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1}
              –{Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
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
 
      {/* Add User Entry Form Panel */}
      <AddUser
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSave={handleSaveUser}
      />
    </AdminLayout>
  );
}
 
