import { useState } from "react";
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaGlobe, FaDollarSign, FaBed, FaWallet, FaRegCommentDots, FaCloudUploadAlt } from "react-icons/fa";

export default function BookingModal({ isOpen, onClose, selectedRoom }) {
  if (!isOpen) return null;

  // Optional placeholder handler since state bindings aren't requested yet
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Booking Submitted!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 p-6 flex justify-between items-center border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Book {selectedRoom?.title || "Your Stay"}
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
                <input type="text" required placeholder="John Doe" className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address*</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="email" required placeholder="example@mail.com" className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number*</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="tel" required placeholder="+95 9..." className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nationality*</label>
                <div className="relative">
                  <FaGlobe className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="text" required placeholder="e.g. Myanmar" className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bed Preference</label>
                <div className="relative">
                  <FaBed className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="text" placeholder="e.g. King Bed, High Floor" className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
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
                  <input type="date" required className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Check-Out Date*</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="date" required className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rooms*</label>
                <input type="number" required defaultValue="1" min="1" className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Adults*</label>
                <input type="number" required defaultValue="1" min="1" className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Children</label>
                <input type="number" defaultValue="0" min="0" className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
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
                  <select required className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none">
                    <option value="">Select method...</option>
                    <option value="kpay">K-Pay</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Required Deposit</label>
                <div className="relative">
                  <FaDollarSign className="absolute left-4 top-3.5 text-slate-500" />
                  <input type="text" value="45$" readOnly className="pl-11 pr-4 py-2.5 bg-slate-100/80 font-medium border border-slate-200 text-slate-600 rounded-xl w-full text-sm cursor-not-allowed outline-none" />
                </div>
              </div>
            </div>

            {/* Upload Box Design Replacement */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Receipt Screenshot*</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/20 rounded-2xl p-4 cursor-pointer group transition">
                <FaCloudUploadAlt className="text-2xl text-slate-400 group-hover:text-blue-500 mb-1 transition" />
                <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-600 transition">UPLOAD SCREENSHOT</span>
                <input type="file" required className="hidden" />
              </label>
            </div>
          </div>

          {/* Section: Requests */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Special Requests</label>
            <div className="relative">
              <FaRegCommentDots className="absolute left-4 top-3.5 text-slate-400" />
              <textarea rows="2" placeholder="Dietary restrictions, early check-in instructions, etc..." className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"></textarea>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition">
              CANCEL
            </button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition">
              SUBMIT RESERVATION
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}