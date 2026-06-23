import React, { useState } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaToggleOn, FaCheckCircle } from "react-icons/fa";

export default function AddUser({ isOpen, onClose, onSave }) {
  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    role: "Receptionist",
    status: "Active"
  };
  const [formData, setFormData] = useState(initialFormState);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData(initialFormState); // Safely reset state metrics
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header (Perfect match with payment layout) */}
        <div className="flex justify-between items-center px-8 py-6 bg-slate-50 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Create Staff Account</h2>
            <p className="text-xs text-slate-500 mt-0.5">Register a new user identity and set access credentials.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Full Name */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Full Name *</label>
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <FaUser className="absolute left-4 text-slate-400" size={14} />
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Address *</label>
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <FaEnvelope className="absolute left-4 text-slate-400" size={14} />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. jane@example.com"
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <FaPhone className="absolute left-4 text-slate-400" size={14} />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +1234567890"
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* System Role Selection */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">System Role</label>
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <FaShieldAlt className="absolute left-4 text-slate-400" size={14} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-slate-700 outline-none font-medium cursor-pointer"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Housekeeping">Housekeeping</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Status Configuration (Full width selection row) */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Account Status</label>
            <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
              <FaToggleOn className="absolute left-4 text-slate-400" size={14} />
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-slate-700 outline-none font-medium cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Actions Footer Container */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <FaCheckCircle size={14} />
              Save User
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}