import React from 'react';
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
  FaImages,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

/**
 * Sidebar visibility is shared with UserRoutes (sidebarOpen/setSidebarOpen)
 * so the page content's margin can react to it too — not just this
 * component's own on-screen state. Desktop gets an edge tab that
 * shows/hides the rail and reclaims the width for content; mobile keeps
 * the off-canvas drawer + hamburger, wired to the same boolean.
 */
export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, setUser } = useAuth(); // 2. Access user and setter

  const toggleMenu = () => setSidebarOpen((v) => !v);

  // Auto-close only makes sense for the mobile drawer — on desktop the
  // sidebar should stay put after clicking a link.
  const closeMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 992) {
      setSidebarOpen(false);
    }
  };

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
        <button className={`burger-menu-btn ${sidebarOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
        </button>
      </div>

      {/* Desktop-only edge tab — shows/hides the rail without affecting
          the mobile drawer, which is driven by the hamburger above. */}
      <button
        type="button"
        className={`sidebar-edge-toggle ${sidebarOpen ? '' : 'collapsed'}`}
        onClick={toggleMenu}
        title={sidebarOpen ? 'Hide menu' : 'Show menu'}
      >
        {sidebarOpen ? <FaChevronLeft size={11} /> : <FaChevronRight size={11} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-hidden'}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <span>RH</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">Relax Hotel</span>
            <span className="brand-subtitle">Boutique &amp; Resort</span>
          </div>
        </div>

        <div className="sidebar-divider" />

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
            <NavLink to="/profile" className="account-link" onClick={closeMenu}>
              <FaUserCircle className="nav-icon" />
              <span>My Account</span>
            </NavLink>
          ) : (
            <NavLink to="/account" className="account-link" onClick={closeMenu}>
              <FaSignInAlt className="nav-icon" />
              <span>Account</span>
            </NavLink>
          )}
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={closeMenu}></div>}
    </>
  );
}
