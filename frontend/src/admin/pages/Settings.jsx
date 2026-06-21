import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaShieldAlt,
  FaSave,
} from "react-icons/fa";

export default function Settings() {
  const [user] = useState({
    name: "Emily Johnson",
    email: "reception@harborgrand.com",
    phone: "+95 9 123 456 789",
    role: "Receptionist",
    status: "Active",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdatePassword = () => {
    alert("Password updated successfully!");
  };

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Settings
          </h1>

          <p className="text-slate-500 mt-2">
            Manage your profile and account security.
          </p>
        </div>

        {/* Profile Section */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">

            <div className="flex flex-col items-center">

              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
                <FaUser className="text-4xl text-indigo-600" />
              </div>

              <h2 className="text-xl font-bold mt-4">
                {user.name}
              </h2>

              <span className="mt-2 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                {user.status}
              </span>

              <p className="text-slate-500 mt-2">
                {user.role}
              </p>

            </div>

          </div>

          {/* Information Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">

            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Profile Information
            </h3>

            <div className="space-y-5">

              <div className="flex items-center gap-4">
                <FaUser className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">
                    Full Name
                  </p>
                  <p className="font-medium">
                    {user.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <FaEnvelope className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">
                    Email Address
                  </p>
                  <p className="font-medium">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <FaPhone className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">
                    Phone Number
                  </p>
                  <p className="font-medium">
                    {user.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <FaShieldAlt className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">
                    Role
                  </p>
                  <p className="font-medium">
                    {user.role}
                  </p>
                </div>
              </div>

            </div>

            <button className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition">
              Edit Profile
            </button>

          </div>

        </div>

        {/* Change Password */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-6">
            <FaLock className="text-indigo-600" />
            <h3 className="text-xl font-bold">
              Change Password
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">

            <div>
              <label className="block text-sm font-medium mb-2">
                Current Password
              </label>

              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                New Password
              </label>

              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

          </div>

          <button
            onClick={handleUpdatePassword}
            className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
          >
            <FaSave />
            Update Password
          </button>

        </div>

      </div>
    </AdminLayout>
  );
}