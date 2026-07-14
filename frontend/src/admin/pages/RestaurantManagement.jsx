import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

import AdminLayout from "../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import {
  FaUtensils, FaCoins, FaClipboardList, FaPlus,
  FaEdit, FaTimes, FaSearch, FaCircle, FaTrash
} from "react-icons/fa";

export default function RestaurantManagement() {
  const { user } = useAuth();
  const canWrite = (user?.role || "").toLowerCase() === "manager";
  // Default static dataset fallback records
  const [menuItems, setMenuItems] = useState([
    { item_id: 1, item_name: "Ribeye Steak with Garlic Butter", category: "Food", price: 38.50, status: "Available" },
    { item_id: 2, item_name: "Club Sandwich with Fries", category: "Snack", price: 14.00, status: "Available" },
    { item_id: 3, item_name: "Iced Caramel Macchiato", category: "Drink", price: 6.50, status: "Available" },
    { item_id: 4, item_name: "Truffle Parmesan Fries", category: "Snack", price: 9.50, status: "Available" },
    { item_id: 5, item_name: "Fresh Mint Mojito", category: "Drink", price: 8.00, status: "Out of Stock" },
    { item_id: 6, item_name: "Matcha Cheesecake Slice", category: "Dessert", price: 10.50, status: "Available" }
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Modal State Controllers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formItem, setFormItem] = useState({ item_id: null, item_name: "", category: "Food", price: "", status: "Available" });

  useEffect(() => {
    fetchItemsFromDB();
  }, [searchQuery, selectedCategory]);

  // Base URL is already set globally in main.jsx (axios), same pattern used
  // by RoomTypeManagement.jsx / GuestManagement.jsx — no need for a
  // hardcoded host here.
  const fetchItemsFromDB = async () => {
    try {
      const response = await axios.get("/api/restaurant-items", {
        params: { search: searchQuery, category: selectedCategory },
      });

      const data = response.data;
      if (Array.isArray(data)) {
        setMenuItems(data.map((item) => ({ ...item, price: Number(item.price) })));
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error("Backend Error:", error);
      toast.error(error.response?.data?.message || "Failed to connect to the backend server.");
    }
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormItem({ item_id: null, item_name: "", category: "Food", price: "", status: "Available" });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setIsEditMode(true);
    setFormItem({
      item_id: item.item_id,
      item_name: item.item_name,
      category: item.category,
      price: item.price.toString(),
      status: item.status
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      item_name: formItem.item_name,
      category: formItem.category,
      price: parseFloat(formItem.price),
      status: formItem.status,
    };

    try {
      if (isEditMode) {
        await axios.put(`/api/restaurant-items/${formItem.item_id}`, payload);
      } else {
        await axios.post("/api/restaurant-items", payload);
      }

      toast.success(isEditMode ? "Item updated successfully!" : "Item added successfully!");

      setIsFormOpen(false);
      setFormItem({
        item_id: null,
        item_name: "",
        category: "Food",
        price: "",
        status: "Available",
      });

      fetchItemsFromDB();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;

    try {
      await axios.delete(`/api/restaurant-items/${id}`);
      toast.success("Item deleted successfully!");
      fetchItemsFromDB();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`/api/restaurant-items/${id}/toggle-status`);
      fetchItemsFromDB();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update status.");
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      {/* Container wrapper set up to structure viewport content rows seamlessly */}
      <div className="w-full h-[calc(100vh-110px)] flex flex-col gap-5 overflow-hidden p-1">
        
        {/* Top spacer separator border lines */}
        <div className="border-b border-slate-200 shrink-0"></div>

        {/* Analytics Metadata Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-md text-amber-600"><FaUtensils /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Menu Items</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{menuItems.length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-md text-amber-600"><FaClipboardList /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Restaurant Orders</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">2</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-md text-amber-600"><FaCoins /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">F&B Room Charge Total</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">$1,424.50</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Main Interface Layout Area */}
        <div className="w-full flex-1 min-h-0 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col">
          
          {/* Controls Bar: Sequential execution flow across inline elements */}
          <div className="flex flex-col sm:flex-row gap-3 items-center pb-4 shrink-0 w-full">
            
            {/* Search Input field with internal text alignment and right bounds icon placement */}
            <div className="relative w-full sm:w-64 flex items-center">
              <input 
                type="text" 
                placeholder="Search item or recipe..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-4 pr-9 py-1.5 text-xs font-semibold text-slate-600 outline-none focus:border-slate-300 transition"
              />
              <FaSearch className="absolute right-3.5 text-slate-400 text-xs pointer-events-none" />
            </div>

            {/* Filter Category Tabs and Actions button mapped sequentially straight next to filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto sm:ml-auto">
              {["All", "Food", "Snack", "Drink", "Dessert"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border whitespace-nowrap transition ${
                    selectedCategory === cat 
                      ? "bg-[#1E293B] border-slate-900 text-white" 
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}

              {/* + Add New Item Button strictly appended after Dessert filter option element */}
              {canWrite && (
                <button
                  onClick={handleOpenAddModal}
                  className="bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition active:scale-95 ml-1.5 h-[30px]"
                >
                  <FaPlus className="text-[10px]" />
                  <span className="whitespace-nowrap">Add New Item</span>
                </button>
              )}
            </div>

          </div>

          {/* Catalog Data Grid Table Layout render matrix container */}
          <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl min-h-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 sticky top-0 border-b border-slate-200/60 z-10">
                <tr>
                  <th className="p-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Name</th>
                  <th className="p-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="p-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price Base</th>
                  <th className="p-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredItems.map((item) => (
                  <tr key={item.item_id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-3.5 text-xs font-bold text-slate-700">{item.item_name}</td>
                    <td className="p-3.5 text-xs font-semibold text-slate-400">{item.category}</td>
                    <td className="p-3.5 text-xs font-mono font-bold text-slate-700">
  ${Number(item.price).toFixed(2)}
</td>
                    <td className="p-3.5 text-xs">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === "Available" 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                          : "bg-rose-50 border-rose-100 text-rose-500"
                      }`}>
                        <FaCircle className="text-[4px]" />
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-right">
  <div className="flex justify-end items-center gap-2">
    {canWrite ? (
      <>
        {/* Edit Button */}
        <button
          onClick={() => handleOpenEditModal(item)}
          className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition"
          title="Edit Item"
        >
          <FaEdit className="text-xs" />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => handleDelete(item.item_id)}
          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
          title="Delete Item"
        >
          <FaTrash className="text-xs" />
        </button>
      </>
    ) : (
      <span className="text-slate-300 text-xs italic">—</span>
    )}
  </div>
</td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-xs font-semibold text-slate-400">No menu items match the criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pop-up Form Modal View Layer Context wrapper */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          
          <form onSubmit={handleFormSubmit} className="bg-[#FAF9F6] w-full max-w-md rounded-2xl border border-slate-200/60 shadow-xl relative z-10 overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-200/50 bg-white">
              <div>
                <h3 className="text-sm font-black text-slate-800 tracking-tight">
                  {isEditMode ? "Modify Menu Item" : "Add New Menu Item"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isEditMode ? "Update details inside the core master catalog" : "Append new items into the kitchen management records"}
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Item Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Buffalo Chicken Wings" 
                  value={formItem.item_name}
                  onChange={(e) => setFormItem({ ...formItem, item_name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-400 shadow-2xs transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Category</label>
                  <select 
                    value={formItem.category}
                    onChange={(e) => setFormItem({ ...formItem, category: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 shadow-2xs transition cursor-pointer"
                  >
                    {["Food", "Snack", "Drink", "Dessert"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required
                    placeholder="12.50" 
                    value={formItem.price}
                    onChange={(e) => setFormItem({ ...formItem, price: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-slate-800 outline-none focus:border-slate-400 shadow-2xs transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Status</label>
                <select 
                  value={formItem.status}
                  onChange={(e) => setFormItem({ ...formItem, status: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 shadow-2xs transition cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3.5 flex items-center justify-end gap-2 border-t border-slate-200/40">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)} 
                className="text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition active:scale-95"
              >
                {isEditMode ? "Save Changes" : "Log Menu Item"}
              </button>
            </div>

          </form>
        </div>
      )}
    </AdminLayout>
  );
}
