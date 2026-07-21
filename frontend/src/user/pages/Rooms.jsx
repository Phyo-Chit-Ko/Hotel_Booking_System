import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Rooms.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2"; // Ensure you have this installed
import { formatCurrency } from "../../utils/currency";

const BACKEND_URL = "http://localhost:8000";

// Used only when a room type has no uploaded image yet, so the grid still looks presentable.
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop",
];

// Helper functions to handle dates cleanly in local time zone
function getLocalStatusDates() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    todayStr: formatDate(today),
    tomorrowStr: formatDate(tomorrow),
  };
}

function describeRoom(room) {
  const perks = [];
  if (room.breakfast) perks.push("complimentary breakfast");
  if (room.bathtub) perks.push("a private bathtub");
  const perkText = perks.length ? ` with ${perks.join(" and ")}` : "";
  const guests = room.capacity === 1 ? "1 guest" : `${room.capacity} guests`;
  return `Comfortable accommodation for up to ${guests}${perkText}.`;
}

function computeNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(diff / 86400000));
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
  const [errors, setErrors] = useState({});

  const { todayStr, tomorrowStr } = getLocalStatusDates();

  const QR_CODES = {
    "K-Pay": "/images/18.png",
    Bank: "/images/18.png",
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
              { icon: "👥", label: `${r.capacity} std / ${r.maximum_capacity ?? r.capacity} max guests` },
              { icon: "💵", label: `${formatCurrency(r.base_price, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / night` },
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
              capacity: r.capacity,
              maximumCapacity: r.maximum_capacity ?? r.capacity,
              basePrice: Number(r.base_price) || 0,
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
    check_in_date: todayStr,     // Default to today
    check_out_date: tomorrowStr, // Default to tomorrow
    special_requests: "",
    payment_method: "",
    room_type_id: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // If check-in date changes and becomes greater than or equal to current check-out date, 
      // automatically move checkout to the next day relative to the new check-in date.
      if (name === "check_in_date") {
        if (!updated.check_out_date || updated.check_out_date <= value) {
          const checkInDateObj = new Date(value);
          checkInDateObj.setDate(checkInDateObj.getDate() + 1);
          
          const yyyy = checkInDateObj.getFullYear();
          const mm = String(checkInDateObj.getMonth() + 1).padStart(2, "0");
          const dd = String(checkInDateObj.getDate()).padStart(2, "0");
          updated.check_out_date = `${yyyy}-${mm}-${dd}`;
        }
      }
      return updated;
    });

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPaymentFile(file);
    if (errors.payment_screenshot) {
      setErrors((prev) => ({ ...prev, payment_screenshot: "" }));
    }

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
      check_in_date: todayStr,
      check_out_date: tomorrowStr,
      special_requests: "",
      payment_method: "",
      room_type_id: "",
    });
    setPaymentFile(null);
    setFilePreview(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = "First name is required.";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[0-9+\-\s()]{6,20}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid phone number.";
    }

    if (!formData.adult || Number(formData.adult) < 1) {
      newErrors.adult = "At least 1 adult is required.";
    }

    if (formData.child !== "" && Number(formData.child) < 0) {
      newErrors.child = "Cannot be negative.";
    }

    if (!formData.total_room || Number(formData.total_room) < 1) {
      newErrors.total_room = "At least 1 room is required.";
    } else {
      const totalGuests = (Number(formData.adult) || 0) + (Number(formData.child) || 0);
      const maxCap = selectedRoom?.maximumCapacity || Infinity;
      const rooms = Number(formData.total_room) || 1;

      if (totalGuests > maxCap * rooms) {
        newErrors.total_room = rooms === 1
          ? "Total person is more than room's maximum capacity, please choose more than 1 (total rooms) room or reduce total guests."
          : `Total guests (${totalGuests}) exceed the combined maximum capacity (${maxCap * rooms}) for ${rooms} rooms. Please add more rooms or reduce guests.`;
      }
    }

    if (!formData.bed_preference) {
      newErrors.bed_preference = "Please select a bed preference.";
    }

    if (!formData.check_in_date) {
      newErrors.check_in_date = "Check-in date is required.";
    }

    if (!formData.check_out_date) {
      newErrors.check_out_date = "Check-out date is required.";
    } else if (formData.check_in_date && formData.check_out_date <= formData.check_in_date) {
      newErrors.check_out_date = "Check-out must be after check-in.";
    }

    if (!formData.payment_method) {
      newErrors.payment_method = "Please select a payment method.";
    }

    if (!paymentFile) {
      newErrors.payment_screenshot = "Payment screenshot is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAvailability = async () => {
    if (!formData.check_in_date || !formData.check_out_date || !selectedRoom) return true;
    try {
      const res = await axios.get("/api/rooms/available", {
        params: { check_in: formData.check_in_date, check_out: formData.check_out_date },
      });
      const availableOfType = (res.data.rooms || []).filter(
        (r) => r.room_type_id === selectedRoom.id
      );
      if (availableOfType.length < Number(formData.total_room || 1)) {
        Swal.fire({
          icon: "info",
          title: "We're so sorry!",
          text: `Only ${availableOfType.length} ${selectedRoom.title} room(s) are available for the dates you selected. Please choose different dates or a different room type.`,
        });
        return false;
      }
      return true;
    } catch {
      return true; // fail-open — let the backend re-validate at submit time
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!(await checkAvailability())) return;

    const nights = computeNights(formData.check_in_date, formData.check_out_date);
    const totalRooms = Number(formData.total_room) || 0;
    const depositAmount = (nights * totalRooms * (selectedRoom?.basePrice || 0)) / 2;

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, key === "child" && value === "" ? 0 : value);
    });

    data.append("deposit", depositAmount.toFixed(2));
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
      Swal.fire({
        icon: "success",
        title: "Booking saved successfully!",
        text: result.message || "",
      });
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("Fetch error details:", err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Determine the minimum allowed date for checkout based on what check-in is selected.
  // Must be at least 1 day after check-in, or tomorrow (if check-in isn't filled yet).
  let minCheckoutDate = tomorrowStr;
  if (formData.check_in_date) {
    const nextDay = new Date(formData.check_in_date);
    nextDay.setDate(nextDay.getDate() + 1);
    const yyyy = nextDay.getFullYear();
    const mm = String(nextDay.getMonth() + 1).padStart(2, "0");
    const dd = String(nextDay.getDate()).padStart(2, "0");
    minCheckoutDate = `${yyyy}-${mm}-${dd}`;
  }

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
                          check_in_date: todayStr,     // Ensure defaults reset on open
                          check_out_date: tomorrowStr, // Ensure defaults reset on open
                        }));
                        setErrors({});
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
            <form onSubmit={handleSubmit} noValidate>
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
                      />
                      {errors.first_name && <p className="field-error">{errors.first_name}</p>}
                    </div>
                    <div className="field-group">
                      <label>Last Name*</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                      />
                      {errors.last_name && <p className="field-error">{errors.last_name}</p>}
                    </div>
                    <div className="field-group">
                      <label>Email*</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      {errors.email && <p className="field-error">{errors.email}</p>}
                    </div>
                    <div className="field-group">
                      <label>Phone*</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                      {errors.phone && <p className="field-error">{errors.phone}</p>}
                    </div>
                    <div className="field-group">
                      <label>Adult*</label>
                      <input
                        type="number"
                        name="adult"
                        min="1"
                        value={formData.adult}
                        onChange={handleInputChange}
                      />
                      {errors.adult && <p className="field-error">{errors.adult}</p>}
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
                      {errors.child && <p className="field-error">{errors.child}</p>}
                    </div>
                    <div className="field-group">
                      <label>Total Rooms*</label>
                      <input
                        type="number"
                        name="total_room"
                        min="1"
                        value={formData.total_room}
                        onChange={handleInputChange}
                      />
                      {errors.total_room && <p className="field-error">{errors.total_room}</p>}
                    </div>
                    <div className="field-group">
                      <label>Bed Preference*</label>
                      <select
                        name="bed_preference"
                        value={formData.bed_preference}
                        onChange={handleInputChange}
                      >
                        <option value="">Select...</option>
                        <option value="King Bed">King Bed</option>
                        <option value="Twin Bed">Twin Bed</option>
                      </select>
                      {errors.bed_preference && <p className="field-error">{errors.bed_preference}</p>}
                    </div>
                    <div className="field-group">
                      <label>Check In*</label>
                      <input
                        type="date"
                        name="check_in_date"
                        min={todayStr} // Disables past days
                        value={formData.check_in_date}
                        onChange={handleInputChange}
                      />
                      {errors.check_in_date && <p className="field-error">{errors.check_in_date}</p>}
                    </div>
                    <div className="field-group">
                      <label>Check Out*</label>
                      <input
                        type="date"
                        name="check_out_date"
                        min={minCheckoutDate} // Disables past days & today (or days before check-in)
                        value={formData.check_out_date}
                        onChange={handleInputChange}
                      />
                      {errors.check_out_date && <p className="field-error">{errors.check_out_date}</p>}
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
                    <label>Deposit (50% of Room Charges)</label>
                    <input
                      type="text"
                      value={formatCurrency((computeNights(formData.check_in_date, formData.check_out_date) * (Number(formData.total_room) || 0) * (selectedRoom?.basePrice || 0)) / 2)}
                      readOnly
                      className="read-only"
                    />
                    {computeNights(formData.check_in_date, formData.check_out_date) > 0 && Number(formData.total_room) > 0 && (
                      <p className="field-hint">
                        {formData.total_room} room(s) × {computeNights(formData.check_in_date, formData.check_out_date)} night(s) × {formatCurrency(selectedRoom?.basePrice)} ÷ 2
                      </p>
                    )}
                  </div>
                  <div className="field-group">
                    <label>Method*</label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleInputChange}
                    >
                      <option value="">Select...</option>
                      <option value="K-Pay">K-Pay</option>
                      <option value="Bank">CB-Pay</option>
                    </select>
                    {errors.payment_method && <p className="field-error">{errors.payment_method}</p>}
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
                    {errors.payment_screenshot && <p className="field-error">{errors.payment_screenshot}</p>}
                  </div>
                </div>
              </div>

              <div className="form-actions-row">
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