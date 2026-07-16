import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
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
 
const authHeaders = () => {
  const token = sessionStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
 
export default function Settings() {
  const { user: authUser, setUser: setAuthUser } = useAuth();
 
  const [user, setUser] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    role: authUser?.role || "",
    status: authUser?.status || "Active",
  });
 
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ ...user });
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
 
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
 
  // Refresh from the server on mount so the page reflects the real,
  // persisted account instead of only whatever was cached at login time.
  useEffect(() => {
    let active = true;
    axios
      .get("/api/user", { headers: authHeaders() })
      .then((res) => {
        if (!active) return;
        const u = {
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          role: res.data.role || "",
          status: res.data.status || "Active",
        };
        setUser(u);
        setProfileForm(u);
      })
      .catch(() => {
        // stay with the AuthContext-seeded values if this fails
      });
    return () => { active = false; };
  }, []);
 
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };
 
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSaving(true);
    try {
      const res = await axios.put(
        "/api/profile/update",
        {
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone // 🟢 FIX 1: Added phone to the request payload
        },
        { headers: authHeaders() }
      );
      const updated = res.data.user;
      const merged = { ...user, name: updated.name, email: updated.email, phone: updated.phone };
      setUser(merged);
      setIsEditing(false);
      // Keep the shared auth context (Navbar, Sidebar, etc.) in sync.
      // 🟢 FIX 2: Added phone alignment here so other components show the updated number instantly
      setAuthUser?.((prev) => (prev ? { ...prev, name: updated.name, email: updated.email, phone: updated.phone } : prev));
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };
 
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    setPasswordError("");
    setPasswordSuccess("");
  };
 
  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
 
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordError("Enter your current password and a new password.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
 
    setPasswordSaving(true);
    try {
      await axios.put(
        "/api/profile/update",
        {
          name: user.name,
          email: user.email,
          old_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        },
        { headers: authHeaders() }
      );
      setPasswordSuccess("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };
 
  return (
    <AdminLayout>
      {/* စာသားအပေါ်က space ရောစေရန် pt-4 ထည့်ပေးထားပါသည် */}
      <div className="space-y-8 font-sans pt-4">
 
        {/* 🛑 Header Section (Settings နှင့် Manage your profile စာကြောင်းများ) ကို ဖယ်ရှားလိုက်ပါပြီ */}
 
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
                    onClick={() => { setProfileForm({ ...user }); setProfileError(""); setIsEditing(true); }}
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
 
                {profileError && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">{profileError}</div>
                )}
 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name Input */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Full Name *</label>
                    <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-500">
                      <input
                        type="text"
                        required
                        name="name"
                        value={profileForm.name}
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
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>
 
                {/* Email Input (Full Width Input Line row) */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Address *</label>
                  <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-slate-500/20 focus-within:border-slate-500">
                    <input
                      type="email"
                      required
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 outline-none"
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
                    disabled={profileSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-950 hover:bg-slate-900 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
                  >
                    <FaSave size={14} /> {profileSaving ? "Saving…" : "Save Changes"}
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
 
          {passwordError && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-5">{passwordSuccess}</div>
          )}
 
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
            disabled={passwordSaving}
            className="mt-6 bg-slate-950 hover:bg-slate-900 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
          >
            <FaSave />
            {passwordSaving ? "Updating…" : "Update Password"}
          </button>
        </div>
 
      </div>
    </AdminLayout>
  );
}
 
 