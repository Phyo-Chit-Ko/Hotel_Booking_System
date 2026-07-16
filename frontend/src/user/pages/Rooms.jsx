import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Rooms.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2"; // Ensure you have this installed

const BACKEND_URL = "http://localhost:8000";

// Used only when a room type has no uploaded image yet, so the grid still looks presentable.
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop",
];

function describeRoom(room) {
  const perks = [];
  if (room.breakfast) perks.push("complimentary breakfast");
  if (room.bathtub) perks.push("a private bathtub");
  const perkText = perks.length ? ` with ${perks.join(" and ")}` : "";
  const guests = room.capacity === 1 ? "1 guest" : `${room.capacity} guests`;
  return `Comfortable accommodation for up to ${guests}${perkText}.`;
}

export default function Rooms() {
  const navigate = useNavigate(); // Hook for navigation
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [roomData, setRoomData] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState(false);

  const QR_CODES = {
    "K-Pay": "/images/176.jpg",
    Bank: "/images/178.jpg",
  };

  useEffect(() => {
    let cancelled = false;
    axios.get("/api/room-types")
      .then((res) => {
        if (cancelled) return;
        const mapped = res.data
          .filter((r) => r.status === "Active")
          .map((r, idx) => {
            const features = [
              { icon: "👥", label: r.capacity === 1 ? "1 Guest" : `${r.capacity} Guests` },
              { icon: "💵", label: `$${Number(r.base_price).toFixed(0)} / night` },
            ];
            if (r.breakfast) features.push({ icon: "🍳", label: "Free Breakfast" });
            if (r.bathtub) features.push({ icon: "🛁", label: "Luxury Bathtub" });

            return {
              id: r.room_type_id,
              title: r.name,
              image: r.image
                ? `${BACKEND_URL}/storage/${r.image}`
                : FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length],
              description: describeRoom(r),
              features,
            };
          });
        setRoomData(mapped);
      })
      .catch((error) => {
        console.error("Error fetching room types:", error);
        if (!cancelled) setRoomsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRooms(false);
      });
    return () => { cancelled = true; };
  }, []);

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

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, key === "child" && value === "" ? 0 : value);
    });

    data.append("user_id", user.user_id);
    data.append("payment_screenshot", paymentFile);

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/api/bookings", {
        method: "POST",
        headers: {
          "Accept": "application/json",
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join("\n");
          throw new Error(errorMessages);
        }
        throw new Error(result.message || "Server responded with status: " + response.status);
      }

      console.log("Success:", result);
      alert(result.message || "Booking saved successfully!");
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("Fetch error details:", err);
      alert("Submission Failed:\n" + err.message);
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
        {isLoadingRooms ? (
          <p className="rooms-status-text">Loading rooms...</p>
        ) : roomsError ? (
          <p className="rooms-status-text">
            Couldn't load rooms right now. Please try again shortly.
          </p>
        ) : roomData.length === 0 ? (
          <p className="rooms-status-text">No rooms are available at the moment.</p>
        ) : (
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
                      {room.features.map((feature) => (
                        <div className="feature" key={feature.label}>
                          <span>{feature.icon}</span>
                          <span>{feature.label}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      className="book-now-btn"
                      onClick={() => {
                        if (!user) {
                          Swal.fire({
                            icon: "warning",
                            title: "Login Required",
                            text: "Please login before booking a room.",
                            confirmButtonText: "Go to Login"
                          });
                          navigate("/account");
                          return;
                        }
                        setSelectedRoom(room);
                        setFormData((prev) => ({
                          ...prev,
                          room_type_id: room.id,
                          email: user.email || "",
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
        )}
      </section>

      {showForm && (
        <div className="modal-overlay">
          <div className="reservation-form">
            <h2>Book {selectedRoom?.title}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-columns">
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

                  <div className="field-group">
                    <label>Payment Screenshot*</label>
                    {!paymentFile ? (
                      <label className="file-dropzone">
                        <span className="file-dropzone-icon">📤</span>
                        <span className="file-dropzone-text">Click or drag to upload</span>
                        <span className="file-dropzone-hint">PNG / JPG, up to 5MB</span>
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
                          <span className="file-preview-name">{paymentFile.name}</span>
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
                <button type="submit" className="room-submit-btn" disabled={submitting}>
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