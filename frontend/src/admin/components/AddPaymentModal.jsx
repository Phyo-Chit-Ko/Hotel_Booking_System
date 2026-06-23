import React, { useState, useRef } from "react";
import { FaTimes, FaMoneyBillWave, FaHashtag, FaCalendarAlt, FaFileAlt, FaCloudUploadAlt } from "react-icons/fa";

export default function AddPaymentModal({ isOpen, onClose, onSave }) {
  // Fix 1: Use a unique key or ref to clear the file input programmatically upon reset
  const fileInputRef = useRef(null);

  const initialFormState = {
    reservation_id: "",
    amount: "",
    payment_method: "Cash",
    payment_proof: null, 
    description: "",
    date: new Date().toISOString().split("T")[0],
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "payment_proof") {
      setFormData((prev) => ({
        ...prev,
        payment_proof: files[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        // Fix 2: Automatically discard proof if user switches back to Cash/Card mid-form filling
        ...(name === "payment_method" && !value.includes("Mobile Payment") ? { payment_proof: null } : {})
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Pass clean data up
    onSave(formData);

    // Reset everything safely
    setFormData(initialFormState);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Fixes the native file UI bug!
    }
    
    onClose();
  };

  if (!isOpen) return null;

  const isMobilePayment = formData.payment_method.includes("Mobile Payment");

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 bg-slate-50 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add Payment</h2>
            <p className="text-xs text-slate-500 mt-0.5">Record a new payment transaction.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Reservation ID */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Reservation ID</label>
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <FaHashtag className="absolute left-4 text-slate-400" size={14} />
                <input
                  type="number"
                  name="reservation_id"
                  value={formData.reservation_id}
                  onChange={handleChange}
                  placeholder="e.g. 1042"
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-slate-800 outline-none"
                  required
                />
              </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Amount (USD)</label>
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <span className="absolute left-4 font-bold text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full bg-transparent pl-9 pr-4 py-3 text-sm font-semibold text-amber-600 outline-none"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Payment Method</label>
              <div className="bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full bg-transparent px-4 py-3 text-sm text-slate-700 outline-none font-medium cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Payment">Mobile Payment (KBZPay / WavePay)</option>
                </select>
              </div>
            </div>

            {/* Payment Date */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Payment Date</label>
              <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
                <FaCalendarAlt className="absolute left-4 text-slate-400" size={14} />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-slate-700 outline-none font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Conditional Image Upload */}
          {isMobilePayment && (
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Upload Payment Screenshot <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100/70 border-slate-300 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <FaCloudUploadAlt className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 font-medium">
                      {formData.payment_proof ? (
                        <span className="text-amber-600 font-semibold">{formData.payment_proof.name}</span>
                      ) : (
                        <span>Click to upload receipt screenshot</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG or JPEG up to 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="payment_proof"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    required={isMobilePayment} // Mandatory only if Mobile Pay is picked
                  />
                </label>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Notes / Description</label>
            <div className="relative flex items-start bg-slate-50 rounded-xl border border-slate-200/80 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500">
              <FaFileAlt className="absolute left-4 top-4 text-slate-400" size={14} />
              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any internal payment details here..."
                className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-slate-800 outline-none resize-none min-h-[80px]"
              />
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <FaMoneyBillWave size={14} />
              Save Payment
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}