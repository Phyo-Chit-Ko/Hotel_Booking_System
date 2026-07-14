import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import Swal from "sweetalert2"; // Switched to SweetAlert for consistency
import { MdMarkEmailRead } from "react-icons/md";
import './VerifyEmail.css';


export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email from the registration redirect
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const resendCode = async () => {
  try {
   await axios.post("/api/auth/resend-code", { email });
    Swal.fire("Sent!", "A new code has been sent to your email.", "success");
  } catch (error) {
    Swal.fire("Error", "Could not resend code.", "error");
  }
};



  const verify = async () => {
    setLoading(true);
    try {
     const res = await axios.post("/api/auth/verify-email", { email, code });
      console.log("Server Response:", res.data); // Look at this in your browser console
      if (res.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Verified!",
          text: "Email verified successfully. You can now log in.",
          confirmButtonColor: "#28a745",
        });
        navigate("/account", { state: { forceLogin: true } });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: error.response?.data?.message || "Invalid code.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">

    <div className="verify-icon">
        <MdMarkEmailRead />
    </div>

    <h2>Verify Email</h2>

    <p className="verify-subtitle">
        We've sent a verification code to
        <br />
        <strong>{email}</strong>
    </p>

    <label className="verify-label">Email</label>

    <input
        type="email"
        value={email}
        readOnly
        className="verify-input"
    />

    <label className="verify-label">Verification Code</label>

    <input
        type="text"
        placeholder="000000"
        value={code}
        onChange={(e)=>setCode(e.target.value)}
        className="verify-input otp-input"
        maxLength={6}
    />

    <button
        onClick={verify}
        disabled={loading}
        className="verify-submit-btn"
    >
        {loading ? "VERIFYING..." : "VERIFY ACCOUNT"}
    </button>

    <div className="resend-wrapper">
        Didn't receive the code?
        <br /><br />
        <button
            type="button"
            onClick={resendCode}
            className="verify-resend-link"
        >
            Resend Verification Code
        </button>
    </div>

</div>
    </div>
  );
}