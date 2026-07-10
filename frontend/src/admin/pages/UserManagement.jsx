import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddUser from "../components/AddUser";
import axios from "axios";
import {
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit
} from "react-icons/fa";
 
const API_BASE_URL = "http://localhost:8000/api/users";
 
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
 
  useEffect(() => {
    fetchUsersFromDB();
  }, []);
 
  const fetchUsersFromDB = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Error retrieving users:", error);
      alert("Could not load users from the server.");
    } finally {
      setLoading(false);
    }
  };
 
  const handleSaveUser = async (formData) => {
    try {
      const currentId = formData.user_id || formData.id;
 
      if (currentId) {
        const response = await axios.put(`${API_BASE_URL}/${currentId}`, formData);
        if (response.status === 200) {
          setUsers(users.map(u => (u.user_id === currentId || u.id === currentId) ? response.data.user : u));
        }
      } else {
        const response = await axios.post(API_BASE_URL, formData);
        if (response.status === 201) {
          setUsers([...users, response.data.user]);
        }
      }
      setIsPanelOpen(false);
      setSelectedUser(null);
      fetchUsersFromDB(); // Data တွေကို Refresh ပြန်လုပ်ပေးခြင်း
    } catch (error) {
      console.error("API Error:", error);
      const serverMessage = error.response?.data?.message || error.message;
      alert(`error\n  ${serverMessage}`);
    }
  };
 
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to permanently delete this user account?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${userId}`);
        setUsers(users.filter((user) => user.user_id !== userId && user.id !== userId));
      } catch (error) {
        console.error("Error deleting database record:", error);
        alert("Could not remove user from the database.");
      }
    }
  };
 
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase());
 
    const matchesRole =
      selectedRole === "All Roles" ||
      user.role?.toLowerCase() === selectedRole.toLowerCase();
 
    return matchesSearch && matchesRole;
  });
 
  return (
    <AdminLayout>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-5 space-y-5 mt-2">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-3">
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
                <option value="Housekeeping">Housekeeping</option>
                <option value="User">User</option>
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
                <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
 
          <button
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center justify-center gap-1.5 h-10 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition rounded-xl shadow-sm"
          >
            <FaPlus className="w-2.5 h-2.5" /> Add New
          </button>
        </div>
 
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="w-16 px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="w-32 px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="w-48 px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="w-36 px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="w-32 px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="w-28 px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="w-28 px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
  {loading ? (
    <tr>
      <td colSpan="8" className="text-center py-10 text-sm font-medium text-slate-400">
        Syncing data grid metrics with database...
      </td>
    </tr>
  ) : filteredUsers.length > 0 ? (
    filteredUsers.map((user) => {
      const idToShow = user.user_id || user.id;
      const displayPassword = user.plain_password || user.password || "—";
 
      return (
        <tr key={idToShow} className="hover:bg-slate-50/40 transition group">
          <td className="px-5 py-2 text-sm font-medium text-slate-400 truncate">#{idToShow}</td>
          <td className="px-5 py-2 text-sm font-bold text-slate-800 truncate" title={user.name}>{user.name}</td>
          <td className="px-5 py-2 text-sm text-slate-500 truncate" title={user.email}>{user.email}</td>
          <td className="px-5 py-2 text-sm text-slate-500 truncate">{user.phone || "—"}</td>
          
          
          
          <td className="px-5 py-2 text-sm truncate">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
              {user.role}
            </span>
          </td>
          <td className="px-5 py-2 text-sm truncate">
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
          <td className="px-5 py-2 text-sm">
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => { setSelectedUser(user); setIsPanelOpen(true); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(idToShow)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
              >
                <FaTrash className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="8" className="text-center py-10 text-sm font-medium text-slate-400">
        No users found matching your search criteria.
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>
 
      </div>
 
      <AddUser
        isOpen={isPanelOpen}
        onClose={() => { setIsPanelOpen(false); setSelectedUser(null); }}
        onSave={handleSaveUser}
        editingUser={selectedUser}
      />
    </AdminLayout>
  );
}
 