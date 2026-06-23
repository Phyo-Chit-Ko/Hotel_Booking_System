import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import AddUser from "../components/AddUser";
import {
  FaPlus,
  FaSearch,
  FaFileExport,
  FaFileImport,
  FaTrash,
  FaEdit
} from "react-icons/fa";

export default function UserManagement() {
  const [users, setUsers] = useState([
    {
      user_id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      status: "Active",
      role: "Manager",
    },
    {
      user_id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+0987654321",
      status: "Inactive",
      role: "Receptionist",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveUser = (newUserData) => {
    const newUser = {
      user_id: users.length > 0 ? Math.max(...users.map(u => u.user_id)) + 1 : 1,
      ...newUserData
    };
    setUsers([...users, newUser]);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 font-sans">
        
        {/* Page Header Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">User Management</h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage administrative roles, receptionist staff, and access states.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm">
              <FaFileImport className="text-slate-400" /> Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm">
              <FaFileExport className="text-slate-400" /> Export
            </button>
            <button 
              onClick={() => setIsPanelOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition rounded-xl shadow-md shadow-amber-500/20"
            >
              <FaPlus /> Add User
            </button>
          </div>
        </div>

        {/* Search Input Filter Bar Layout */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative max-w-md w-full flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
            <FaSearch className="absolute left-4 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent pl-11 pr-4 py-2.5 text-sm text-slate-800 outline-none"
            />
          </div>
        </div>

        {/* Dynamic Data Table Panel View */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-slate-50/40 transition group">
                      <td className="px-6 py-4 text-sm font-medium text-slate-400">#{user.user_id}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{user.phone || "—"}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            user.status === "Active" 
                              ? "bg-emerald-50 text-emerald-700" 
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                            <FaEdit className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-sm font-medium text-slate-400 bg-slate-50/50">
                      No users found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal composition */}
        <AddUser 
          isOpen={isPanelOpen} 
          onClose={() => setIsPanelOpen(false)} 
          onSave={handleSaveUser} 
        />
      </div>
    </AdminLayout>
  );
}