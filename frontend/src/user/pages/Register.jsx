import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { NAME_RE, EMAIL_RE } from '../../utils/validators';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    console.log("Typing:", e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Submitting:", formData);

    if (!NAME_RE.test(formData.fullName.trim())) {
      setFormError('Full name must contain only letters, spaces, apostrophes, hyphens, or periods.');
      return;
    }
    if (!EMAIL_RE.test(formData.email.trim())) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    try {
      await axios.post('/api/register', formData);
      await Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        confirmButtonColor: "#c79b56",
      });
      navigate('/login');
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Registration failed",
        text: error.response?.data?.message || "Please check your details and try again.",
        confirmButtonColor: "#c79b56",
      });
    }
  };
 
  return (
    <div className="account-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister} noValidate>
          <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} value={formData.fullName} />
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} value={formData.email} />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} />
          {formError && <p className="text-xs font-medium" style={{ color: "#e11d48" }}>{formError}</p>}
          <button type="submit" className="submit-btn">Register</button>
        </form>
        <p className="toggle-text" onClick={() => navigate('/login')}>Already have an account? Login</p>
      </div>
    </div>
  );
}
 