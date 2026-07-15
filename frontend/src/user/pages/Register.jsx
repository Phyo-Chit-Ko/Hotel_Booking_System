import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';
 
export default function Register() {
  const navigate = useNavigate();
 
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
 
  const handleChange = (e) => {
    console.log("Typing:", e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Submitting:", formData);
   
    try {
      await axios.post('http://localhost:8000/api/register', formData);
      alert("Registration Successful!");
      navigate('/login');
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      alert("Registration failed. Check console for details.");
    }
  };
 
  return (
    <div className="account-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister}>
          <input type="text" name="fullName" placeholder="Full Name" required onChange={handleChange} value={formData.fullName} />
          <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} value={formData.email} />
          <input type="password" name="password" placeholder="Password" required onChange={handleChange} value={formData.password} />
         
          <button type="submit" className="submit-btn">Register</button>
        </form>
        <p className="toggle-text" onClick={() => navigate('/login')}>Already have an account? Login</p>
      </div>
    </div>
  );
}
 