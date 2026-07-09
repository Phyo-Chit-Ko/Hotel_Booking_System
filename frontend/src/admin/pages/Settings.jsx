import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import axios from "axios";
import Swal from "sweetalert2";
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
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ ...user });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 🔑 FIXED: read the SAME key that Account.jsx writes on login ("auth_token")
  const getAuthHeader = () => {
    const token = sessionStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 🔄 1. Fetch live user details on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("/api/user/profile", {
          headers: getAuthHeader(),
        });

        // FIXED: backend returns { status: 'success', data: {...} }
        // not the user object directly, so unwrap it here.
        const userData = response.data.data || response.data;

        setUser(userData);
        setProfileForm(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error.response?.status === 401) {
          Swal.fire({
            icon: "error",
            title: "Unauthorized Access",
            text: "Session is missing or expired. Please log in again.",
          });
        }
      }
    };

    fetchUserProfile();
  }, []);

  // Update Edit Profile form inputs locally
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  // 📝 2. Save Updated Profile to Backend
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("/api/user/profile", profileForm, {
        headers: getAuthHeader(),
      });

      // updateOwnProfile() returns { message, user }
      setUser(response.data.user || profileForm);
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Could not update profile parameters.",
      });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔒 3. Submit Password Changes to Backend
  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert("All password fields are required.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      // FIXED: field names now match UserController::changeOwnPassword's
      // validator ('currentPassword', 'newPassword') — camelCase, no
      // password_confirmation needed since it's checked client-side above.
      await axios.put(
        "/api/user/password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: getAuthHeader(),
        }
      );

      Swal.fire({
        icon: "success",
        title: "Password Updated Successfully!",
        timer: 1800,
        showConfirmButton: false,
      });

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        // errors come back as { field: [messages] }
        const firstMessage = Object.values(backendErrors)[0]?.[0];
        alert(firstMessage || "Failed to update password.");
      } else {
        alert(error.response?.data?.message || "Failed to update password.");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 font-sans pt-4">

        {/* Profile Section Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left Panel: Profile Avatar Status Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 shadow-inner">
                <FaUser className="text-4xl text-amber-600" />
              </div>

              <h2 className="text-xl font-bold mt-4 text-slate-800">
                {user.name || "Loading User..."}
              </h2>

              <span className="mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                {user.status || "Active"}
              </span>

              <p className="text-sm font-medium text-slate-400 mt-2 flex items-center gap-1.5">
                <FaShieldAlt className="text-slate-300" /> {user.role || "User"}
              </p>
            </div>
          </div>

          {/* Right Panel: Dynamic Profile Display or Edit View */}
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
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-950 hover:bg-slate-900 rounded-xl shadow-md transition"
                  >
                    <FaEdit size={14} /> Edit Profile
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="p-2.5 bg-white rounded-lg text-slate-400 border border-slate-200/60"><FaUser size={14}/></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</p>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">{user.name || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="p-2.5 bg-white rounded-lg text-slate-400 border border-slate-200/60"><FaEnvelope size={14}/></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">{user.email || "—"}</p>
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
                    <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-500">
                      <input
                        type="text"
                        required
                        name="name"
                        value={profileForm.name || ""}
                        onChange={handleProfileChange}
                        className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-500">
                      <input
                        type="text"
                        name="phone"
                        value={profileForm.phone || ""}
                        onChange={handleProfileChange}
                        className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Input */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Address *</label>
                  <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-500">
                    <input
                      type="email"
                      required
                      name="email"
                      value={profileForm.email || ""}
                      onChange={handleProfileChange}
                      className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 outline-none"
                    />
                  </div>
                </div>

                {/* Form Navigation Actions */}
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
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
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
            <div className="p-2 bg-slate-50 rounded-xl text-slate-700 border border-slate-100"><FaLock size={16} /></div>
            <h3 className="text-xl font-bold text-slate-800">
              Change Password
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Current Password</label>
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-500">
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
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-500">
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
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-500">
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
            className="mt-6 bg-slate-950 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
          >
            <FaSave />
            Update Password
          </button>
        </div>

      </div>
    </AdminLayout>
  );
}
