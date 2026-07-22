import { useState, useEffect } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaGlobe, FaMoneyBillWave, FaBed, FaWallet, FaRegCommentDots, FaCloudUploadAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { formatCurrency } from "../../utils/currency";

export default function BookingModal({ isOpen, onClose, selectedRoom }) {
  // 1. Initialize state for all form fields
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    bedPreference: "",
    checkIn: "",
    checkOut: "",
    rooms: "1",
    adults: "1",
    children: "0",
    paymentMethod: "",
    specialRequests: ""
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if we are editing an existing booking or creating a new one
  const isEditMode = !!(selectedRoom?.booking_id || selectedRoom?.raw_id);

  // Pre-fill fields if we are opening an existing booking to edit
  useEffect(() => {
    if (isOpen && selectedRoom) {
      setFormData({
        fullName: selectedRoom.first_name ? `${selectedRoom.first_name} ${selectedRoom.last_name || ""}`.trim() : "",
        email: selectedRoom.email || "",
        phone: selectedRoom.phone || "",
        nationality: selectedRoom.nationality || "",
        bedPreference: selectedRoom.bed_preference || "",
        checkIn: selectedRoom.checkIn || selectedRoom.check_in_date || "",
        checkOut: selectedRoom.checkOut || selectedRoom.check_out_date || "",
        rooms: selectedRoom.total_room || selectedRoom.rooms || "1",
        adults: selectedRoom.adult || selectedRoom.adults || "1",
        children: selectedRoom.child || selectedRoom.children || "0",
        paymentMethod: selectedRoom.payment_method || "",
        specialRequests: selectedRoom.special_requests || ""
      });
      setReceiptFile(null); // Reset uploaded file track
    }
  }, [isOpen, selectedRoom]);

  if (!isOpen) return null;

  // Generic handler to update text/number inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for file upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  // 2. Updated Submit Handler to talk to Laravel API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToSend = new FormData();
      
      // Split full name into first and last name for Laravel validation rules
      const nameParts = formData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "Guest";

      // CRUCIAL STEP FOR LARAVEL EDITS: 
      if (isEditMode) {
        dataToSend.append('_method', 'PUT');
      }

      // Map frontend state to backend database validation expectations
      dataToSend.append('first_name', firstName);
      dataToSend.append('last_name', lastName);
      dataToSend.append('email', formData.email);
      dataToSend.append('phone', formData.phone);
      dataToSend.append('adult', formData.adults);
      dataToSend.append('child', formData.children);
      dataToSend.append('total_room', formData.rooms);
      dataToSend.append('bed_preference', formData.bedPreference || "Standard");
      dataToSend.append('check_in_date', formData.checkIn);
      dataToSend.append('check_out_date', formData.checkOut);
      dataToSend.append('special_requests', formData.specialRequests || "");
      dataToSend.append('payment_method', formData.paymentMethod);
      dataToSend.append('room_type_id', selectedRoom?.room_type_id || 1); 

      // Attach file only if uploaded (Required for store, optional for update)
      if (receiptFile) {
        dataToSend.append('payment_screenshot', receiptFile);
      }

      // Determine Endpoint URL based on Create or Edit context
      const bookingId = selectedRoom?.booking_id || selectedRoom?.raw_id;
      
      // fetch() ignores axios.defaults.baseURL, so it needs the backend origin explicitly.
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const url = isEditMode ? `${baseUrl}/api/bookings/${bookingId}` : `${baseUrl}/api/bookings`;

      const response = await fetch(url, {
        method: "POST", // Always POST when transporting multi-part files via Form Data
        headers: {
          "Accept": "application/json" // Force Laravel to return clean JSON validation messages instead of HTML pages
        },
        body: dataToSend, 
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save data entry.");
      }

      Swal.fire({
        icon: "success",
        title: isEditMode ? "Booking updated successfully!" : "Booking saved successfully!",
        confirmButtonColor: "#c79b56",
      });
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.message || "Something went wrong while communicating with the server.",
        confirmButtonColor: "#c79b56",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 p-6 flex justify-between items-center border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {isEditMode ? `Edit Booking (ID: ${selectedRoom?.id || selectedRoom?.booking_id})` : `Book ${selectedRoom?.title || "Your Stay"}`}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Please fill out the details below to complete your reservation securement.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border p-2.5 rounded-xl transition">
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5 overflow-y-auto">
          
          {/* Section: Guest Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">Guest Information</h3>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name*</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-3.5 text-slate-400" />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="John Doe" className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address*</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="example@mail.com" className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number*</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+95 9..." className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nationality*</label>
                <div className="relative">
                  <FaGlobe className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} required placeholder="e.g. Myanmar" className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bed Preference</label>
                <div className="relative">
                  <FaBed className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="text" name="bedPreference" value={formData.bedPreference} onChange={handleChange} placeholder="e.g. King Bed, High Floor" className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section: Booking & Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">Stay & Rooms Setup</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Check-In Date*</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} required className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Check-Out Date*</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} required className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rooms*</label>
                {/* FIXED: Added missing name attribute */}
                <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} required min="1" className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Adults*</label>
                {/* FIXED: Added missing name attribute */}
                <input type="number" name="adults" value={formData.adults} onChange={handleChange} required min="1" className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Children</label>
                {/* FIXED: Added missing name attribute */}
                <input type="number" name="children" value={formData.children} onChange={handleChange} min="0" className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section: Payment & Verification */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method*</label>
                <div className="relative">
                  <FaWallet className="absolute left-4 top-3.5 text-slate-400" />
                  {/* FIXED: Added missing name attribute */}
                  <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none">
                    <option value="">Select method...</option>
                    <option value="kpay">K-Pay</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Required Deposit</label>
                <div className="relative">
                  <FaMoneyBillWave className="absolute left-4 top-3.5 text-slate-500" />
                  <input type="text" value={formatCurrency(45000)} readOnly className="pl-11 pr-4 py-2.5 bg-slate-100/80 font-medium border border-slate-200 text-slate-600 rounded-xl w-full text-sm cursor-not-allowed outline-none" />
                </div>
              </div>
            </div>

            {/* Upload Box */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Payment Receipt Screenshot{isEditMode ? "" : "*"}
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/20 rounded-2xl p-4 cursor-pointer group transition">
                <FaCloudUploadAlt className="text-2xl text-slate-400 group-hover:text-blue-500 mb-1 transition" />
                <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-600 transition max-w-xs truncate">
                  {receiptFile ? receiptFile.name.toUpperCase() : (isEditMode ? "CHANGE RECEIPT (OPTIONAL)" : "UPLOAD SCREENSHOT")}
                </span>
                <input type="file" required={!isEditMode} onChange={handleFileChange} accept="image/*" className="hidden" />
              </label>
            </div>
          </div>

          {/* Section: Requests */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Special Requests</label>
            <div className="relative">
              <FaRegCommentDots className="absolute left-4 top-3.5 text-slate-400" />
              <textarea name="specialRequests" value={formData.specialRequests} onChange={handleChange} rows="2" placeholder="Dietary restrictions, early check-in instructions, etc..." className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"></textarea>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 flex-shrink-0">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition disabled:opacity-50">
              CANCEL
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50">
              {isSubmitting ? "PROCESSING..." : (isEditMode ? "UPDATE RESERVATION" : "SUBMIT RESERVATION")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}