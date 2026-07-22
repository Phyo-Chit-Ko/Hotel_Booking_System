import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure you ran 'npm install axios'
import "./Account.css";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import {useLocation} from "react-router-dom";
import Navbar from "../components/Navbar";
 
 
export default function Account() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const handleGoogleLogin = () => {
    // Full-page navigation to the backend, so it needs the absolute origin
    // (axios.defaults.baseURL doesn't apply to window.location).
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google/redirect`;
};
const location = useLocation();
 
  const [formData, setFormData] = useState({ name: "",phone: "", email: "", password: "" });
  const [errors, setErrors] = useState({
  name: "",
  phone: "",
  email: "",
  password: "",
});
const [isLogin, setIsLogin] = useState(location.state?.forceLogin || true);
 
const [email,setEmail]=useState(
location.state?.email || ""
);
  const navigate = useNavigate();
  const { login, setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
 
  const validateRegister = () => {
  let newErrors = {};
 
  // Name
  if (!formData.name.trim()) {
    newErrors.name = "Full name is required.";
  } else if (formData.name.trim().length < 3) {
    newErrors.name = "Name must be at least 3 characters.";
  } else if (!/^[A-Za-z ]+$/.test(formData.name)) {
    newErrors.name = "Name can contain only letters and spaces.";
  }
 
 
  // Add inside validateRegister()
if (!formData.phone.trim()) {
  newErrors.phone = "Phone number is required.";
} else if (!/^\+?[0-9]{7,15}$/.test(formData.phone)) {
  newErrors.phone = "Please enter a valid phone number.";
}
 
  // Email
  if (!formData.email.trim()) {
    newErrors.email = "Email is required.";
  } else if (
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
  ) {
    newErrors.email = "Please enter a valid email address.";
  }
 
  // Password
  if (!formData.password) {
    newErrors.password = "Password is required.";
  } else if (formData.password.length < 8) {
    newErrors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(formData.password)) {
    newErrors.password =
      "Password must contain at least one uppercase letter.";
  } else if (!/[0-9]/.test(formData.password)) {
    newErrors.password =
      "Password must contain at least one number.";
  } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
    newErrors.password =
      "Password must contain at least one special character.";
  }
 
  setErrors(newErrors);
 
  return Object.keys(newErrors).length === 0;
};
const handleSubmit = async (e) => {
  e.preventDefault();
 
  if (!isLogin && !validateRegister()) return;
 
  try {
    // 1. Get CSRF Cookie
    await axios.get("/sanctum/csrf-cookie");

    if (isLogin) {
      const response = await axios.post("/api/login", {
        email: formData.email,
        password: formData.password,
      });
 
      if (response.data.success) {
        // USE THE CONTEXT LOGIN - This is the ONLY thing you need to call
        login(response.data.user, response.data.token);
 
        await Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: `Welcome back, ${response.data.user.name}!`,
          timer: 1800,
          showConfirmButton: false,
        });
 
        const { role } = response.data.user;
        console.log("LOGIN ROLE:", role);
        if (role === 'manager' || role === 'receptionist' || role === 'admin') navigate("/admin/dashboard");
        else navigate("/homepage");
      }
    } else {
      // Registration flow
      const response = await axios.post("/api/auth/initiate-registration", {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      });
 
      if (response.data.success) {
 
           login(response.data.user, response.data.token);
 
    console.log(
      "AFTER LOGIN TOKEN:",
      sessionStorage.getItem("auth_token")
    );
 
    console.log(
      "AFTER LOGIN USER:",
      sessionStorage.getItem("user")
    );
 
        Swal.fire({ icon: "success", title: "Registration Successful!", text: "Please verify your email." });
        navigate("/verify-email", { state: { email: formData.email } });
      }
    }
  } catch (error) {
    console.error("Login/Reg Error:", error.response?.data);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.response?.data?.message || "Something went wrong.",
    });
  }
};
 
 return (
  <>
    <Navbar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
 
    <div
      className={`account-page ${
        sidebarOpen ? "with-sidebar" : "sidebar-collapsed"
      }`}
    >
      <div className="auth-card">
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
 
        <form onSubmit={handleSubmit}>
        {/* NAME FIELD (Register only) */}
{!isLogin && (
  <div className="form-row">
    <label>Full Name</label>
    <input
      type="text"
      value={formData.name}
      placeholder="e.g. John Doe"
      onChange={(e) => {
        setFormData({ ...formData, name: e.target.value });
        if (errors.name) setErrors({ ...errors, name: "" });
      }}
    />
    {errors.name && <small className="error">{errors.name}</small>}
  </div>
)}
 
{/* PHONE FIELD (Register only) */}
{!isLogin && (
  <div className="form-row">
    <label>Phone Number</label>
    <input
      type="tel"
      value={formData.phone}
      placeholder="+1234567890"
      onChange={(e) => {
        const val = e.target.value.replace(/[^0-9+]/g, "");
        setFormData({ ...formData, phone: val });
        if (errors.phone) setErrors({ ...errors, phone: "" });
      }}
    />
    {errors.phone && <small className="error">{errors.phone}</small>}
  </div>
)}
 
{/* EMAIL FIELD */}
<div className="form-row">
  <label>Email</label>
  <input
    type="email"
    value={formData.email}
    placeholder="name@example.com"
    onChange={(e) => {
      setFormData({ ...formData, email: e.target.value });
      if (errors.email) setErrors({ ...errors, email: "" });
    }}
  />
  {errors.email && <small className="error">{errors.email}</small>}
</div>
 
{/* PASSWORD FIELD */}
<div className="form-row">
  <label>Password</label>
  <div className="password-wrapper">
    <input
      type={showPassword ? "text" : "password"}
      value={formData.password}
      placeholder={isLogin ? "Enter your password" : "Min. 8 characters"}
      onChange={(e) => {
        setFormData({ ...formData, password: e.target.value });
        if (errors.password) setErrors({ ...errors, password: "" });
      }}
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
  {errors.password && <small className="error">{errors.password}</small>}
</div>
 
           <button type="submit" className="submit-btn">
  {isLogin ? "Login" : "REGISTER"}
</button>
 
{isLogin && (
  <div className="forgot-password">
    <span onClick={() => navigate("/forgot-password")}>
      Forgot Password?
    </span>
  </div>
)}
        </form>
        <div className="divider">
          <span>OR</span>
        </div>
 
        {/* Google Login */}
       <button
  className="google-btn"
  type="button"
  onClick={() => {
    // This forces the browser to leave your React app
    // and go to your Laravel backend Google route
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google/redirect`;
  }}
>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            style={{ marginRight: "10px" }}
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
 
       <p

  className="toggle-text"

  style={{ cursor: "pointer", textAlign: "center" }}

  onClick={() => setIsLogin(!isLogin)}
>

  {isLogin ? (
<>

      Don't have an account? <span className="toggle-link">Register</span>
</>

  ) : (
<>

      Already have an account? <span className="toggle-link">Login</span>
</>

  )}
</p>
 
     </div>
    </div>
  </>
);
}
 