import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        {/* About Section */}
        <div className="footer-column">
          <h3>RELAX HOTEL</h3>
          <p>Experience the perfect blend of modern luxury and traditional Mandalay hospitality. Your journey to relaxation begins here.</p>
        </div>

        {/* Links Section */}
        <div className="footer-column">
          <h3>EXPLORE</h3>
          <ul>
            <li><a href="/rooms">Rooms & Suites</a></li>
            <li><a href="/restaurant">Dining</a></li>
            <li><a href="/gallery">Gallery</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-column">
          <h3>CONTACT</h3>
          <p>73rd Street, Mandalay, Myanmar</p>
          <p>+959 980 683 177</p>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Relax Hotel Mandalay. All Rights Reserved.</p>
      </div>
    </footer>
  );
}