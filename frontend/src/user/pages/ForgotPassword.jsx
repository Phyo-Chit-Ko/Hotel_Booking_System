import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/forgot-password", { email });

      Swal.fire({
        icon: "success",
        title: "Check your email",
        text: "Password reset link has been sent to your email.",
        confirmButtonColor: "#c79b56",
      });
      setEmail("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.message || "Something went wrong.",
        confirmButtonColor: "#c79b56",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">

        <div className="forgot-icon">📧</div>

        <h2>Forgot Password?</h2>

        <p className="forgot-text">
          Enter your email and we’ll send a reset link.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link className="back-login" to="/account">
          ← Back to Login
        </Link>

      </div>
    </div>
  );
}