import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import "./Account.css";

const authHeaders = () => {
  const token = sessionStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function ForceChangePassword() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Swal.fire({
      icon: "warning",
      title: "Password Change Required",
      text: "Please change your password before continuing.",
      confirmButtonText: "OK",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const { newPassword, confirmPassword } = form;
    if (!newPassword || newPassword.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(newPassword)) return "Password must contain an uppercase letter.";
    if (!/[a-z]/.test(newPassword)) return "Password must contain a lowercase letter.";
    if (!/[0-9]/.test(newPassword)) return "Password must contain a number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) return "Password must contain a special character.";
    if (newPassword !== confirmPassword) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await axios.put(
        "/api/profile/update",
        { name: user.name, email: user.email, old_password: form.oldPassword, new_password: form.newPassword },
        { headers: authHeaders() }
      );
      setUser({ ...user, must_change_password: false });
      await Swal.fire({ icon: "success", title: "Password updated", timer: 1500, showConfirmButton: false });
      const role = (user.role || "").toLowerCase();
      navigate(["admin", "manager", "receptionist"].includes(role) ? "/admin/dashboard" : "/homepage");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="account-page">
      <div className="auth-card">
        <h2>Change Your Password</h2>
        <p style={{ color: "#eee", fontSize: "13px", marginBottom: "20px" }}>
          This is your first login — please set a new password to continue.
        </p>
        {error && <small className="error">{error}</small>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <label>Current (Temporary) Password</label>
            <input
              type="password"
              value={form.oldPassword}
              onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <label>New Password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? "Saving…" : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
