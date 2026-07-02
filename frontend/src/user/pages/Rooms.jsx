import React, { useState } from "react";
import "./Rooms.css";

export default function Rooms() {
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const roomData = [
    { id: 1, title: "Superior Room", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop", description: "Elegant blend of comfort and boutique style.", capacity: "1-2 Persons", amenities: ["Free Wifi", "Queen Bed", "City View"] },
    { id: 2, title: "Deluxe Suite", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&auto=format&fit=crop", description: "Spacious and luxurious with premium finishes.", capacity: "1-3 Persons", amenities: ["Free Wifi", "King Size Bed", "Breakfast Included"] },
    { id: 3, title: "Superior Executive", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop", description: "Designed for corporate luxury with panoramic views.", capacity: "1-3 Persons", amenities: ["High-speed Wifi", "King Bed", "Lounge Access"] }
  ];
  const [formData, setFormData] = useState({
  room_type_id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  total_room: "",
  adult: "",
  child: "",
  nationality: "",
  check_in_date: "",
  check_out_date: "",
  bed_preference: "",      // Ensure this is here
  special_requests: "",    // Ensure this is here
  deposit: "45",
  status: "pending"
});
const [paymentFile, setPaymentFile] = useState(null); // Add this

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData();

  // Explicitly append all fields from state
  Object.keys(formData).forEach(key => data.append(key, formData[key]));
  
  // Explicitly append the file
  if (paymentFile) data.append("deposit_screenshot", paymentFile);
  
  // Explicitly ensure room_type_id is included
  data.append("room_type_id", formData.room_type_id);
  
  // Append all other fields
  Object.keys(formData).forEach(key => {
    if (key !== "room_type_id") data.append(key, formData[key]);
  });

  // 2. Handle File upload specifically
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput && fileInput.files[0]) {
      data.append("screenshot", fileInput.files[0]);
  }

  try {
    const response = await fetch("http://localhost/cob/Hotel-Booking-System/backend/save_booking.php", {
      method: "POST",
      body: data
    });

    if (!response.ok) throw new Error("Server responded with " + response.status);

    const result = await response.json();
    console.log("Success:", result);
    alert(result.message); // This will only show if JSON is valid
    setShowForm(false);
  } catch (err) {
    console.error("Fetch error details:", err); // Look here in your F12 Console!
    alert("Error: " + err.message); // This will show you exactly what's wrong
  }
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

      <section className="rooms-grid-container">
        <div className="rooms-grid">
          {roomData.map((room) => (
            <div key={room.id} className="flip-card">
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <div className="book-ribbon">BOOK</div>
                  <img src={room.image} alt={room.title} className="room-img" />
                  <div className="room-image-title"><h3>{room.title}</h3></div>
                </div>
                <div className="flip-card-back">
  <h3 className="info-card-title">{room.title}</h3>

  <p className="info-card-desc">
    {room.description}
  </p>

  <div className="room-features">
    <div className="feature">
      <span>👥</span>
      <span>{room.capacity}</span>
    </div>

    <div className="feature">
      <span>📶</span>
      <span>{room.amenities[0]}</span>
    </div>

    <div className="feature">
      <span>🛏</span>
      <span>{room.amenities[1]}</span>
    </div>

    <div className="feature">
      <span>🍳</span>
      <span>{room.amenities[2]}</span>
    </div>
  </div>

 <button
  className="book-now-btn"
  onClick={() => {
    setSelectedRoom(room);
    // Update state to include the specific ID of the room
    setFormData(prev => ({ ...prev, room_type_id: room.id })); 
    setShowForm(true);
  }}
>
  BOOK NOW
</button>
</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showForm && (
        <div className="modal-overlay">
          <div className="reservation-form">
            <h2>Book {selectedRoom.title}</h2>
            <form onSubmit={handleSubmit}>
             
               <div className="form-grid">
  <div className="field-group">
    <label>First Name*</label>
    <input 
      type="text" 
      name="first_name" 
      value={formData.first_name} 
      onChange={handleInputChange} 
      required 
    />
  </div>
  <div className="field-group">
    <label>Last Name*</label>
    <input 
      type="text" 
      name="last_name" 
      value={formData.last_name} 
      onChange={handleInputChange} 
      required 
    />
  </div>
                <div className="field-group">
  <label>Email*</label>
  <input 
    type="email" 
    name="email" 
    value={formData.email} 
    onChange={handleInputChange} 
    required 
  />
</div>
                <div className="field-group">
  <label>Phone*</label>
  <input 
    type="tel" 
    name="phone" 
    value={formData.phone} 
    onChange={handleInputChange} 
    required 
  />
</div>
                <div className="field-group">
  <label>Rooms*</label>
  <input 
    type="number" 
    name="total_room" 
    value={formData.total_room} 
    onChange={handleInputChange} 
    required 
  />
</div>
                <div className="field-group">
  <label>Child</label>
  <input 
    type="number" 
    name="child" 
    value={formData.child} 
    onChange={handleInputChange} 
  />
</div>
                <div className="field-group">
  <label>Adult*</label>
  <input 
    type="number" 
    name="adult" 
    value={formData.adult} 
    onChange={handleInputChange} 
    required 
  />
</div>
               <div className="field-group">
  <label>Nationality*</label>
  <input 
    type="text" 
    name="nationality" 
    value={formData.nationality} 
    onChange={handleInputChange} 
    required 
  />
</div>
                <div className="field-group"><label>Deposit</label><input type="text" value="45$" readOnly className="read-only" /></div>
                <div className="field-group">
  <label>Bed Preference*</label>
  <input 
    type="text" 
    name="bed_preference" 
    value={formData.bed_preference} 
    onChange={handleInputChange} 
    required 
  />
</div>
                <div className="field-group"><label>Method*</label>
                  <select required><option value="">Select...</option><option>K-Pay</option><option>Bank</option></select>
                </div>
                <div className="field-group">
  <label>Check In*</label>
  <input 
    type="date" 
    name="check_in_date" 
    value={formData.check_in_date} 
    onChange={handleInputChange} 
    required 
  />
</div>
<div className="field-group">
  <label>Check Out*</label>
  <input 
    type="date" 
    name="check_out_date" 
    value={formData.check_out_date} 
    onChange={handleInputChange} 
    required 
  />
</div>
              </div>
              <div className="field-group"><label>Special Requests</label><textarea 
  name="special_requests" 
  value={formData.special_requests} 
  onChange={handleInputChange} 
></textarea></div>
              <label className="file-upload-btn">
  UPLOAD PAYMENT SCREENSHOT
  <input 
    type="file" 
    hidden 
    onChange={(e) => setPaymentFile(e.target.files[0])} 
  />
</label>
              <div className="form-actions">
    <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>CANCEL</button>
    <button type="submit" className="submit-btn">SUBMIT</button>
  </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}