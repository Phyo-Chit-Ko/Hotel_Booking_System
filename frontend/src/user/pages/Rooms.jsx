import React, { useState } from "react";
import "./Rooms.css";

export default function Rooms() {
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const roomData = [
    {
      id: 1,
      title: "Superior Room",
      image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop",
      description: "Our Superior Room offers an elegant blend of comfort and modern boutique style, perfect for relaxing after exploring Mandalay.",
      capacity: "1-2 Persons",
      amenities: ["Free Wifi", "Queen Bed", "City View"]
    },
    {
      id: 2,
      title: "Deluxe Suite",
      image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&auto=format&fit=crop",
      description: "The deluxe room at RELAX Hotel is a spacious and luxurious accommodation option featuring premium custom layout finishes.",
      capacity: "1-3 Persons",
      amenities: ["Free Wifi", "King Size Bed", "Breakfast Included"]
    },
    {
      id: 3,
      title: "Superior Executive",
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop",
      description: "Designed for ultimate corporate luxury, the Executive Suite features expansive panoramic layouts alongside VIP processing privileges.",
      capacity: "1-3 Persons",
      amenities: ["High-speed Wifi", "King Bed", "Lounge Access"]
    }
  ];

  const handleBookClick = (room) => {
    setSelectedRoom(room);
    setShowForm(true);
  };

  return (
    <div className="rooms-page">
      <header className="rooms-hero">
        <div className="rooms-hero-overlay"></div>
        <div className="rooms-hero-content">
          <span className="hotel-tagline">RELAX Hotel</span>
          <h1 className="rooms-page-title">Rooms & Suites</h1>
        </div>
      </header>

      <section className="rooms-intro">
        <div className="star-rating-gold">★★★★★</div>
        <span className="sub-brand">RELAX Hotel</span>
        <h2>Luxurious Stay with Modern Amenities</h2>
        <div className="accent-gold-line"></div>
      </section>

      <section className="rooms-grid-container">
        <div className="rooms-grid">
          {roomData.map((room) => (
            <div key={room.id} className="flip-card">
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <div className="book-ribbon">BOOK</div>
                  <img src={room.image} alt={room.title} className="room-img" />
                  <div className="room-image-title">
                    <h3>{room.title}</h3>
                  </div>
                </div>
                <div className="flip-card-back">
                  <h3 className="info-card-title">{room.title}</h3>
                  <p className="info-card-desc">{room.description}</p>
                  <div className="info-card-specs">
                    <div className="spec-item">👥 {room.capacity}</div>
                    <div className="spec-item">📶 {room.amenities[0]}</div>
                    <div className="spec-item">🛏️ {room.amenities[1]}</div>
                    <div className="spec-item">🍳 {room.amenities[2]}</div>
                  </div>
                  <button className="book-now-btn" onClick={() => handleBookClick(room)}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reservation Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="reservation-form">
            <h2>Book {selectedRoom.title}</h2>
            <form onSubmit={(e) => { e.preventDefault(); alert('Booking Submitted!'); setShowForm(false); }}>
              <input type="text" placeholder="Full Name" required />
              <input type="email" placeholder="Email Address" required />
              <input type="tel" placeholder="Phone Number" required />
              <input type="date" required />
              <textarea placeholder="Special Requests (e.g., late check-in, dietary needs)" rows="3"></textarea>
              <button type="submit" className="submit-btn">Submit Reservation</button>
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}