import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./Profile.css";
import { useNavigate } from "react-router-dom"; // Add this import

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
  name: "",
  email: "",
  old_password: "",
  password: ""
});
 const handleSave = async () => {
  const token = localStorage.getItem("token");
  console.log("Token being sent:", token); // If this prints 'null', the issue is in your Login component

  try {
    const res = await axios.put("http://localhost:8000/api/profile/update", {
      name: form.name,
      email: form.email,
      old_password: form.old_password || null,
      new_password: form.password || null
    }, {
      headers: {
        "Authorization": `Bearer ${token}`, // Ensure this header is exactly right
        "Accept": "application/json"
      }
    });

    const updatedUser = res.data.user;
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setEditing(false);
    alert("Profile updated successfully!");
  } catch (err) {
    console.error("Full error response:", err.response);
    alert("Update failed: " + (err.response?.data?.message || "Check console for details"));
  }
};

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

  const handleSaveLocal = () => {
    const updatedUser = {
      ...user,
      name: form.name,
      email: form.email,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setEditing(false);
    alert("Profile updated successfully!");
  };

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setUser(null);
  window.location.href = "/";
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

            <button className="back-btn" onClick={goBack}>
              ← Back
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
                {showPassword ? "🙈" : "👁️"}
              </span>

            </div>

          </div>

          {/* BUTTONS */}
          <div className="actions">
            {!editing ? (
              <button className="btn edit" onClick={() => setEditing(true)}>
                ✏ Edit
              </button>
            ) : (
              <button className="btn save" onClick={handleSave}>
                💾 Save Changes
              </button>
            )}

            <button 
    className="btn bookings" 
    onClick={() => window.location.href = "/my-bookings"}
  >
    📅Bookings
  </button>

            <button className="btn logout" onClick={handleLogout}>
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