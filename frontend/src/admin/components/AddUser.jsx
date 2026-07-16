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
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  // Sync state with editingUser prop whenever it changes or modal toggles
  useEffect(() => {
    setPasswordError("");
    setFormError("");
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
    
    if (formError) setFormError("");
    if (passwordError) setPasswordError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");
    setFormError("");

    if (!NAME_RE.test(formData.name.trim())) {
      setFormError("Name must contain only letters, spaces, apostrophes, hyphens, or periods.");
      return;
    }
    if (!EMAIL_RE.test(formData.email.trim())) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (formData.phone && !PHONE_RE.test(formData.phone.trim())) {
      setFormError("Enter a valid phone number.");
      return;
    }

    if (!editingUser && !formData.password) {
      setPasswordError("Password is required.");
      return;
    }

    const payload = { ...formData };
    if (editingUser && !formData.password) {
      delete payload.password;
    }

    if (editingUser) {
      onSave({ ...payload, user_id: editingUser.user_id });
    } else {
      onSave(payload);
    }

    setFormData(initialFormState);
    onClose();
  };

  if (!isOpen) return null;

  const hasNameError = formError && formError.toLowerCase().includes("name");
  const hasEmailError = formError && formError.toLowerCase().includes("email");
  const hasPhoneError = formError && formError.toLowerCase().includes("phone");

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
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-slate-700">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Jane Doe"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-semibold text-slate-800 ${
                  hasNameError 
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" 
                    : "border-slate-200 focus:ring-slate-100 focus:border-slate-300"
                }`}
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-slate-700">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g. jane@example.com"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-semibold text-slate-800 ${
                  hasEmailError 
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" 
                    : "border-slate-200 focus:ring-slate-100 focus:border-slate-300"
                }`}
              />
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. +1234567890"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-semibold text-slate-800 ${
                  hasPhoneError 
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" 
                    : "border-slate-200 focus:ring-slate-100 focus:border-slate-300"
                }`}
              />
            </div>

            {/* System Role Selection */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-slate-700">System Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 font-bold text-slate-700 cursor-pointer"
              >
              
                <option value="manager">Manager</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-slate-700">
                {editingUser ? "New Password (optional)" : "Password"}{" "}
                {!editingUser && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="password"
                name="password"
                required={!editingUser}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Min 8 characters"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-semibold text-slate-800 ${
                  passwordError 
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500" 
                    : "border-slate-200 focus:ring-slate-100 focus:border-slate-300"
                }`}
              />
              {editingUser && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Leave blank to keep the current password.
                </p>
              )}
            </div>

            {/* Account Status Configuration (Password ရဲ့ ညာဘက်ဘေးကို ရောက်သွားပါပြီ) */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-slate-700">Account Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 font-bold text-slate-700 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

          </div>

          {/* Validation Error Messages */}
          {formError && (
            <p className="text-xs font-medium text-rose-500 mt-1.5 ml-1">{formError}</p>
          )}
          {passwordError && (
            <p className="text-xs font-medium text-rose-500 mt-1.5 ml-1">{passwordError}</p>
          )}

          {/* Action Footer */}
          <div className="flex gap-3 justify-end pt-5 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition"
            >
              Cancel
            </button>
          
            <button
              type="submit"
              className="px-6 py-2.5 bg-black hover:bg-slate-900 active:scale-95 text-white text-sm font-semibold rounded-xl transition shadow-sm"
            >
              {editingUser ? "Update Details" : "Save User"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}