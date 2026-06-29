import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close the drawer automatically when a user clicks a link
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar: Only visible on small screens */}
      <div className="mobile-header">
        <div className="mobile-logo-zone">
          <span className="mobile-brand-title">RELAX HOTEL</span>
        </div>
        <button 
          className={`burger-menu-btn ${isOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
        </button>
      </div>

      {/* Main Sidebar Container */}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        
        {/* Brand Identity Top Header */}
        <div className="sidebar-brand">
          <div className="logo-container">
            {/* Replace with your gold asset logo paths if available */}
            <img src="/images/1.png" alt="Hotel Logo" className="brand-logo" />
          </div>
          <span className="brand-title">RELAX HOTEL</span>
          <span className="brand-subtitle">A LUXURIOUS STAY</span>
        </div>

        {/* Vertical Navigation Links */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            <li>
              <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={closeMenu}>About</NavLink>
            </li>
            <li>
              <NavLink to="/rooms" onClick={closeMenu}>Rooms</NavLink>
            </li>
            <li>
              <NavLink to="/gallery" onClick={closeMenu}>Gallery</NavLink>
            </li>
            <li>
              <NavLink to="/restaurant" onClick={closeMenu}>Restaurant</NavLink>
            </li>
            <li>
              <NavLink to="/contact" onClick={closeMenu}>Contact Us</NavLink>
            </li>
          </ul>
        </nav>

        {/* Footer & Account Link Profile Zone */}
        <div className="sidebar-footer">
          <NavLink to="/account" className="account-link" onClick={closeMenu}>
            👤 Account
          </NavLink>
        </div>

      </aside>

      {/* Dark tint backdrop overlay for mobile view mode */}
      {isOpen && <div className="sidebar-backdrop" onClick={closeMenu}></div>}
    </>
  );
}