import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./Profile.css";
import Swal from "sweetalert2"; // <--- Add this at the top
import { useNavigate } from "react-router-dom";
 
export default function Profile() {
 
  const navigate = useNavigate();
 
const { user, setUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 
  const [form, setForm] = useState({
  name: "",
  email: "",
  old_password: "",
  password: ""
});
//   const handleSave = async () => {
//   try {
//     const res = await axios.put("http://localhost:8000/api/profile/update", {
//       user_id: user.user_id,
//       name: form.name,
//       email: form.email,
//       old_password: form.old_password || "",
//       new_password: form.password || ""
//     });
 
//     const updatedUser = res.data.user;
 
//     setUser(updatedUser);
//     localStorage.setItem("user", JSON.stringify(updatedUser));
 
//     setEditing(false);
//     alert("Profile updated successfully!");
//   } catch (err) {
//     console.log(err);
//     alert(err.response?.data?.message || "Update failed");
//   }
// };
 
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user]);
 
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
 
  const handleSave = () => {
    // 1. Prepare the updated user object
    const updatedUser = {
      ...user,
      name: form.name,
      email: form.email,
    };
 
    // 2. Update Context and Local Storage
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
 
    // 3. Exit editing mode
    setEditing(false);
 
    // 4. Use SweetAlert2 for feedback
    Swal.fire({
      icon: "success",
      title: "Profile Updated",
      text: "Your changes have been saved successfully.",
      confirmButtonColor: "#c79b56", // Gold luxury theme
      confirmButtonText: "Okay"
    });
  };
 const handleLogout = () => {
  Swal.fire({
    title: "Are you sure?",
    text: "You will be logged out of your account.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, logout",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    buttonsStyling: false, // Disables default swal styling so YOUR css takes over
    customClass: {
      confirmButton: "swal-btn-custom swal-confirm",
      cancelButton: "swal-btn-custom swal-cancel"
    }
  }).then((result) => {
    if (result.isConfirmed) {
      logout();
      window.location.href = "/";
    }
  });
};
 
  const goBack = () => {
    window.history.back();
  };
 
  return (
    <div className="profile-wrapper">
 
      {/* LEFT SIDE BRAND PANEL */}
      <div className="profile-left">
        <div className="brand-box">
          <h1>Luxury Stay</h1>
          <p>Member Account Portal</p>
        </div>
 
        <div className="side-info">
          <p>🏨 Premium Hotel Experience</p>
          <p>🔐 Secure Account Management</p>
          <p>⭐ Exclusive Member Benefits</p>
        </div>
      </div>
 
      {/* RIGHT PROFILE CARD */}
      <div className="profile-right">
 
        <div className="profile-card">
 
          {/* HEADER WITH BACK BUTTON */}
         <div className="header-row">
  {/* Changed "← Back" to "✕" */}
  <button className="back-btn" onClick={goBack}>
    ✕
  </button>
 
  <div className="top-bar">
    <div className="avatar">👤</div>
    <div>
      <h2>My Account</h2>
      <span>Manage your profile details</span>
    </div>
  </div>
</div>
 
          <div className="gold-line"></div>
 
          {/* FORM */}
          <div className="form">
 
            <label>Full Name</label>
            <div className="input-box">
              <input
                name="name"
                value={form.name}
                disabled={!editing}
                onChange={handleChange}
              />
            </div>
 
            <label>Email Address</label>
            <div className="input-box">
              <input
                name="email"
                value={form.email}
                disabled={!editing}
                onChange={handleChange}
              />
            </div>
 
            <label>Password</label>
            <div className="input-box password-box">
 
              <input
  type={showPassword ? "text" : "password"}
  name="password"
  value={form.password}
  placeholder={editing ? "Enter new password" : "••••••••"}
  disabled={!editing}
  onChange={handleChange}
/>
 
            <span
  className="eye-icon"
  onClick={() => setShowPassword(!showPassword)}
>
  {showPassword ? (
    // Open Eye Icon
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ) : (
    // Closed Eye (Eye with Slash) Icon
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  )}
</span>
 
            </div>
 
          </div>
 
          {/* BUTTONS */}
        <div className="actions">
  <button
    className="btn booking"
    onClick={() => navigate("/my-bookings")}
  >
    {/* 📋 */}
    My Bookings
  </button>
 
  {!editing ? (
    <button className="btn edit" onClick={() => setEditing(true)}>
      {/* ✏ */}
      Edit Profile
    </button>
  ) : (
    <button className="btn save" onClick={handleSave}>
      {/* 💾 */}
      Save
    </button>
  )}
 
  {/* Changed "Logout" text to a power-off/exit icon */}
  <button className="btn logout" onClick={handleLogout}>
    {/* ⏻ */}
    Logout
  </button>
</div>
 
          {/* FOOTER */}
          <div className="security-note">
            <span>🛡</span>
            <p>Keep your account secure and up to date for seamless bookings.</p>
          </div>
 
        </div>
 
      </div>
 
    </div>
  );
}
 