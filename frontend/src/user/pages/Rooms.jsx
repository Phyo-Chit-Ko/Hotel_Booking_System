import React, { useState } from "react";
import "./Rooms.css";

export default function Rooms() {
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const QR_CODES = {
    "K-Pay": "/images/176.jpg",
    Bank: "/images/178.jpg",
  };

  const roomData = [
    {
      id: 1,
      title: "Superior Room",
      image:
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop",
      description: "Elegant blend of comfort and boutique style.",
      capacity: "1-2 Persons",
      amenities: ["Free Wifi", "Queen Bed", "City View"],
    },
    {
      id: 2,
      title: "Deluxe Suite",
      image:
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&auto=format&fit=crop",
      description: "Spacious and luxurious with premium finishes.",
      capacity: "1-3 Persons",
      amenities: ["Free Wifi", "King Size Bed", "Breakfast Included"],
    },
    {
      id: 3,
      title: "Superior Executive",
      image:
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop",
      description: "Designed for corporate luxury with panoramic views.",
      capacity: "1-3 Persons",
      amenities: ["High-speed Wifi", "King Bed", "Lounge Access"],
    },
  ];

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    adult: "",
    child: "",
    total_room: "",
    bed_preference: "",
    check_in_date: "",
    check_out_date: "",
    special_requests: "",
    payment_method: "",
    room_type_id: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPaymentFile(file);

    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setPaymentFile(null);
    setFilePreview(null);
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      adult: "",
      child: "",
      total_room: "",
      bed_preference: "",
      check_in_date: "",
      check_out_date: "",
      special_requests: "",
      payment_method: "",
      room_type_id: "",
    });
    setPaymentFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentFile) {
      alert("Please upload a payment screenshot.");
      return;
    }

    const data = new FormData();

    // Send every form field once, matching the bookings table columns
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    // File field name matches the migration column: deposit_screenshot
    data.append("deposit_screenshot", paymentFile);

    setSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost/cob/Hotel-Booking-System/backend/save_booking.php",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Server responded with " + response.status);
      }
      console.log("Success:", result);
      alert(result.message);
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("Fetch error details:", err);
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
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
                  <div className="room-image-title">
                    <h3>{room.title}</h3>
                  </div>
                </div>
                <div className="flip-card-back">
                  <h3 className="info-card-title">{room.title}</h3>

                  <p className="info-card-desc">{room.description}</p>

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
                      setFormData((prev) => ({
                        ...prev,
                        room_type_id: room.id,
                      }));
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
              <div className="form-columns">
                {/* LEFT COLUMN — guest & stay details */}
                <div className="form-col form-col-main">
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
                      <label>Adult*</label>
                      <input
                        type="number"
                        name="adult"
                        min="1"
                        value={formData.adult}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Child</label>
                      <input
                        type="number"
                        name="child"
                        min="0"
                        value={formData.child}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="field-group">
                      <label>Total Rooms*</label>
                      <input
                        type="number"
                        name="total_room"
                        min="1"
                        value={formData.total_room}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Bed Preference*</label>
                      <select
                        name="bed_preference"
                        value={formData.bed_preference}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select...</option>
                        <option value="King Bed">King Bed</option>
                        <option value="Twin Bed">Twin Bed</option>
                      </select>
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

                  <div className="field-group">
                    <label>Special Requests</label>
                    <textarea
                      name="special_requests"
                      value={formData.special_requests}
                      onChange={handleInputChange}
                      rows={3}
                    ></textarea>
                  </div>
                </div>

                {/* RIGHT COLUMN — payment */}
                <div className="form-col form-col-payment">
                  <div className="field-group">
                    <label>Deposit</label>
                    <input type="text" value="45$" readOnly className="read-only" />
                  </div>

                  <div className="field-group">
                    <label>Method*</label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="K-Pay">K-Pay</option>
                      <option value="Bank">Bank</option>
                    </select>
                  </div>

                  {/* QR code appears once a payment method is chosen */}
                  {formData.payment_method && QR_CODES[formData.payment_method] && (
                    <div className="qr-payment-box">
                      <p className="qr-payment-label">
                        Scan to pay via {formData.payment_method}
                      </p>
                      <img
                        src={QR_CODES[formData.payment_method]}
                        alt={`${formData.payment_method} QR code`}
                        className="qr-payment-img"
                      />
                    </div>
                  )}

                  {/* Realistic file upload with preview */}
                  <div className="field-group">
                    <label>Payment Screenshot*</label>

                    {!paymentFile ? (
                      <label className="file-dropzone">
                        <span className="file-dropzone-icon">📤</span>
                        <span className="file-dropzone-text">
                          Click or drag to upload
                        </span>
                        <span className="file-dropzone-hint">
                          PNG / JPG, up to 5MB
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleFileChange}
                        />
                      </label>
                    ) : (
                      <div className="file-preview">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Payment screenshot preview"
                            className="file-preview-thumb"
                          />
                        ) : (
                          <div className="file-preview-icon">📄</div>
                        )}
                        <div className="file-preview-info">
                          <span className="file-preview-name">
                            {paymentFile.name}
                          </span>
                          <span className="file-preview-size">
                            {(paymentFile.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <button
                          type="button"
                          className="file-preview-remove"
                          onClick={handleRemoveFile}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  CANCEL
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? "SUBMITTING..." : "SUBMIT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
