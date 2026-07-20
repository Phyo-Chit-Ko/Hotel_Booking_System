import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { NAME_RE, PHONE_RE, EMAIL_RE } from "../../utils/validators";

export default function AddUser({ isOpen, onClose, onSave, editingUser = null }) {
  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    role: "receptionist",
    status: "Active",
    password: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with editingUser prop whenever it changes or modal toggles
  useEffect(() => {
    setErrors({});
    if (editingUser) {
      setFormData({
        name: editingUser.name || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        role: editingUser.role ? editingUser.role.toLowerCase() : "receptionist",
        status: editingUser.status ? editingUser.status.charAt(0).toUpperCase() + editingUser.status.slice(1).toLowerCase() : "Active",
        password: "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [editingUser, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear the field-specific error as soon as the user starts correcting it
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const localErrors = {};

    // 1. Frontend Client-Side Pre-Validation
    if (!NAME_RE.test(formData.name.trim())) {
      localErrors.name = "Name must contain only letters, spaces, apostrophes, hyphens, or periods.";
    }
    if (!EMAIL_RE.test(formData.email.trim())) {
      localErrors.email = "Enter a valid email address.";
    }
    // Your controller requires 'phone' to be present on creation, so let's flag it client-side too
    if (!formData.phone || !formData.phone.trim()) {
      localErrors.phone = "Phone number is required.";
    } else if (!PHONE_RE.test(formData.phone.trim())) {
      localErrors.phone = "Enter a valid phone number.";
    }
    if (!editingUser && !formData.password) {
      localErrors.password = "Password is required.";
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    const payload = { ...formData };
    if (editingUser && !formData.password) {
      delete payload.password;
    }

    // 2. Submit to Parent Component and Catch Asynchronous Backend Errors
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await onSave({ ...payload, user_id: editingUser.user_id });
      } else {
        await onSave(payload);
      }
      
      // If successful, reset and close modal
      setFormData(initialFormState);
      onClose();
    } catch (backendErrors) {
      // If the parent handler catches a 422 error and passes it back, set them here
      if (typeof backendErrors === "object" && backendErrors !== null) {
        setErrors(backendErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 m-4 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 flex justify-between items-center border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {editingUser ? "Edit Staff Account" : "Create Staff Account"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {editingUser ? "Modify user privileges and account metadata parameters." : "Register a new user identity and set access credentials."}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 bg-white shadow-sm border p-2.5 rounded-xl transition flex items-center justify-center"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="name"
                disabled={isSubmitting}
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Jane Doe"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-semibold text-slate-800 ${
                  errors.name 
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" 
                    : "border-slate-200 focus:ring-slate-100 focus:border-slate-300"
                }`}
              />
              {errors.name && (
                <p className="text-xs font-medium text-rose-500 px-1">{errors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                name="email"
                disabled={isSubmitting}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g. jane@example.com"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-semibold text-slate-800 ${
                  errors.email 
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" 
                    : "border-slate-200 focus:ring-slate-100 focus:border-slate-300"
                }`}
              />
              {errors.email && (
                <p className="text-xs font-medium text-rose-500 px-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                disabled={isSubmitting}
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. +1234567890"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-semibold text-slate-800 ${
                  errors.phone 
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" 
                    : "border-slate-200 focus:ring-slate-100 focus:border-slate-300"
                }`}
              />
              {errors.phone && (
                <p className="text-xs font-medium text-rose-500 px-1">{errors.phone}</p>
              )}
            </div>

            {/* System Role Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-semibold text-slate-700">System Role</label>
              <select
                name="role"
                disabled={isSubmitting}
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 font-bold text-slate-700 cursor-pointer"
              >
                <option value="manager">Manager</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
            
            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                {editingUser ? "New Password (optional)" : "Password"}{" "}
                {!editingUser && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="password"
                name="password"
                disabled={isSubmitting}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Min 8 characters"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-semibold text-slate-800 ${
                  errors.password 
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" 
                    : "border-slate-200 focus:ring-slate-100 focus:border-slate-300"
                }`}
              />
              {errors.password ? (
                <p className="text-xs font-medium text-rose-500 px-1">{errors.password}</p>
              ) : (
                editingUser && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Leave blank to keep the current password.
                  </p>
                )
              )}
            </div>

            {/* Account Status Configuration */}
            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-semibold text-slate-700">Account Status</label>
              <select
                name="status"
                disabled={isSubmitting}
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 font-bold text-slate-700 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

          </div>

          {/* Action Footer */}
          <div className="flex gap-3 justify-end pt-5 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition disabled:opacity-50"
            >
              Cancel
            </button>
          
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-black hover:bg-slate-900 active:scale-95 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? "Saving..." : editingUser ? "Update Details" : "Save User"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}