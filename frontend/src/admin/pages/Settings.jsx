import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaShieldAlt,
  FaSave,
  FaTimes,
  FaEdit
} from "react-icons/fa";

export default function Settings() {
  const [user, setUser] = useState({
    name: "Emily Johnson",
    email: "reception@harborgrand.com",
    phone: "+95 9 123 456 789",
    role: "Receptionist",
    status: "Active",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ ...user });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle updates for Profile Edit Inputs
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Profile Modifications
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser({ ...profileForm });
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdatePassword = () => {
    alert("Password updated successfully!");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <AdminLayout>
      <div className="space-y-8 font-sans">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your profile details and account security configurations.
          </p>
        </div>

        {/* Profile Section Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left Panel: Profile Avatar Status Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 shadow-inner">
                <FaUser className="text-4xl text-amber-600" />
              </div>

              <h2 className="text-xl font-bold mt-4 text-slate-800">
                {user.name}
              </h2>

              <span className="mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                {user.status}
              </span>

              <p className="text-sm font-medium text-slate-400 mt-2 flex items-center gap-1.5">
                <FaShieldAlt className="text-slate-300" /> {user.role}
              </p>
            </div>
          </div>

          {/* Right Panel: Dynamic Informative or Editing Interactive Frame */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            
            {!isEditing ? (
              /* VIEW MODE DISPLAY SUB-PANEL */
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">
                    Profile Information
                  </h3>
                  <button 
                    onClick={() => { setProfileForm({ ...user }); setIsEditing(true); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md shadow-amber-500/10 transition"
                  >
                    <FaEdit size={14} /> Edit Profile
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="p-2.5 bg-white rounded-lg text-slate-400 border border-slate-200/60"><FaUser size={14}/></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</p>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="p-2.5 bg-white rounded-lg text-slate-400 border border-slate-200/60"><FaEnvelope size={14}/></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="p-2.5 bg-white rounded-lg text-slate-400 border border-slate-200/60"><FaPhone size={14}/></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</p>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">{user.phone || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT PROFILE MODE SUB-FORM */
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Update Profile</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Modify account information details below.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name Input */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Full Name *</label>
                    <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                      <FaUser className="absolute left-4 text-slate-400" size={14} />
                      <input
                        type="text"
                        required
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                      <FaPhone className="absolute left-4 text-slate-400" size={14} />
                      <input
                        type="text"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Input (Full Width Input Line row) */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Address *</label>
                  <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                    <FaEnvelope className="absolute left-4 text-slate-400" size={14} />
                    <input
                      type="email"
                      required
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-slate-800 outline-none"
                    />
                  </div>
                </div>

                {/* Submit Panel Group Button Row Elements */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <FaSave size={14} /> Save Changes
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* Change Password Block Panel Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><FaLock size={16} /></div>
            <h3 className="text-xl font-bold text-slate-800">
              Change Password
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Current Password</label>
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <input
                  type="password"
                  name="newPassword"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpdatePassword}
            className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <FaSave />
            Update Password
          </button>
        </div>

      </div>
    </AdminLayout>
  );
}