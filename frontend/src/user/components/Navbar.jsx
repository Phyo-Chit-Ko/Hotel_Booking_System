import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
// Use three dots to go up two levels
import { useAuth } from "../../context/AuthContext";
import './Navbar.css';
import {
  FaHome,
  FaInfoCircle,
  FaBed,
  FaUtensils,
  FaEnvelope,
  FaUserCircle,
  FaSignInAlt,
  FaImages
} from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser } = useAuth(); // 2. Access user and setter

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    setUser(null);                   // 1. Clear State
    localStorage.removeItem('user'); // 2. Clear Storage
    closeMenu();
    window.location.reload();        // 3. Force UI refresh
  };

  return (
    <>
      <div className="mobile-header">
        <div className="mobile-logo-zone">
          <span className="mobile-brand-title">RELAX HOTEL</span>
        </div>
        <button className={`burger-menu-btn ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
        </button>
      </div>

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/images/1.png" alt="Hotel Logo" className="brand-logo" />
          <span className="brand-title">RELAX HOTEL</span>
        </div>

       <nav className="sidebar-nav">
  <ul className="sidebar-menu">
    <li>
      <NavLink to="/" end onClick={closeMenu}>
        <FaHome className="nav-icon" />
        <span>Home</span>
      </NavLink>
    </li>

    <li>
      <NavLink to="/about" onClick={closeMenu}>
        <FaInfoCircle className="nav-icon" />
        <span>About</span>
      </NavLink>
    </li>

    <li>
      <NavLink to="/rooms" onClick={closeMenu}>
        <FaBed className="nav-icon" />
        <span>Rooms</span>
      </NavLink>
    </li>

    <li>
      <NavLink to="/gallery" onClick={closeMenu}>
        <FaImages className="nav-icon" />
        <span>Gallery</span>
      </NavLink>
    </li>

    <li>
      <NavLink to="/restaurant" onClick={closeMenu}>
        <FaUtensils className="nav-icon" />
        <span>Restaurant</span>
      </NavLink>
    </li>

    <li>
      <NavLink to="/contact" onClick={closeMenu}>
        <FaEnvelope className="nav-icon" />
        <span>Contact Us</span>
      </NavLink>
    </li>
  </ul>
</nav>

        {/* 3. Conditional Rendering for Account / Profile */}
       <div className="sidebar-footer">
  {user ? (
    <>
      <NavLink
        to="/profile"
        className="account-link"
        onClick={closeMenu}
      >
        👤 My Account
      </NavLink>
    </>
  ) : (
    <NavLink
      to="/account"
      className="account-link"
      onClick={closeMenu}
    >
      👤 Login / Register
    </NavLink>
  )}
</div>
      </aside>

      {isOpen && <div className="sidebar-backdrop" onClick={closeMenu}></div>}
    </>
  );
} 