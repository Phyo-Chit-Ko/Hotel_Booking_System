import React from 'react';
import './Contact.css';

export default function Contact() {
  return (
    <div className="contact-page">
      {/* Contact Hero Image */}
      <div className="contact-hero">
        <img src="/images/16.jpg" alt="Contact Us" className="hero-img" />
        <div className="hero-overlay">
          <h1>Get In Touch</h1>
        </div>
      </div>

      <div className="contact-container">
        {/* Left Side: Paragraph */}
        <div className="contact-description">
          <h3>Your Experience Matters</h3>
          <p>
            At Relax Hotel, we strive to provide the best service in Mandalay. 
            Whether you are booking a stay, hosting an event, or have questions 
            about our amenities, our dedicated team is here to assist you. 
            We look forward to welcoming you soon.
          </p>
        </div>

        {/* Right Side: Contact Details */}
        <div className="contact-details">
          <div className="info-item">
            <p><strong>Reservation</strong></p>
            <p>+959 980 683 177</p>
          </div>
          <div className="info-item">
            <p><strong>Email Info</strong></p>
            <p>RelaxHotel@gmail.com</p>
          </div>
          <div className="info-item">
            <p><strong>Address</strong></p>
            <p>73rd Street, 106*107,<br /> Chanmytharzi Tsp, Mandalay, Union of Myanmar.</p>
          </div>
        </div>
      </div>
        
      {/* Google Map */}
      <div className="map-container">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3778.6083595561085!2d96.09697967527633!3d21.975765655956793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30cb6d864190c741%3A0xc665121b6d0e6571!2sMingalar%20Mandalay%20Hotel!5e0!3m2!1sen!2smm!4v1718175000000!5m2!1sen!2smm" 
          width="100%" 
          height="400" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy"
          title="Location"
        ></iframe>
      </div>
    </div>
  );
}