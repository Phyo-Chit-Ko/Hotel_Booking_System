import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure you ran 'npm install axios'
import "./Account.css";
import { useAuth } from "../../context/AuthContext";

export default function Account() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useAuth();

 const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.get("/sanctum/csrf-cookie");

      if (isLogin) {
        const response = await axios.post("/api/login", {
          email: formData.email,
          password: formData.password,
        });

        // Ensure response.data.user contains { name, role, ... }
        if (response.data.success) {
          const userData = response.data.user;
          console.log("Setting user state to:", userData); // DEBUG: Check console
          
          setUser(userData); // This triggers the Navbar update

          const { role } = userData;
          if (role === 'manager') navigate("/admin/dashboard");
          else if (role === 'reception') navigate("/reception-dashboard");
          else navigate("/homepage");
        }
      } else {
        const response = await axios.post("/api/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        if (response.data.success) {
          alert("Account created successfully! Please log in.");
          setIsLogin(true);
        }
      }
    } catch (error) {
  console.log(error);
  console.log(error.response);

  alert(JSON.stringify(error.response?.data || error.message));
}
  };

  return (
    <div className="account-page">
      <div className="auth-card">
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-row">
              <label>Full Name</label>
              <input 
                type="text" 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
          )}

          <div className="form-row">
            <label>Email</label>
            <input 
              type="email" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input 
              type="password" 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>

          <button type="submit" className="submit-btn">
            {isLogin ? "Login" : "REGISTER"}
          </button>
        </form>
        <div className="divider">
          <span>OR</span>
        </div>

        {/* Google Login */}
        <button className="google-btn" type="button">
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
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}