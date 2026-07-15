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

  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [foodRevenue, setFoodRevenue] = useState(0.0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formItem, setFormItem] = useState({ item_id: null, item_name: "", category: "Food", price: "", status: "Available" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API = "http://127.0.0.1:8000/api";

  const activeMenuItemsCount = menuItems.filter(item => item.status === "Available").length;

  // ✅ Central helper: always attach the bearer token from sessionStorage
  const getAuthHeaders = (extra = {}) => {
    const token = sessionStorage.getItem("auth_token");
    return {
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  };

  useEffect(() => {
    fetchItemsFromDB();
  }, [searchQuery, selectedCategory]);

  // Reset to page 1 whenever the filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const fetchItemsFromDB = async () => {
    try {
      const response = await fetch(
        `${API}/restaurant-items?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMenuItems(data);

      const chargesResponse = await fetch(`${API}/services`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (chargesResponse.ok) {
        const chargesData = await chargesResponse.json();

        if (chargesData.metrics && chargesData.metrics.food_revenue_total !== undefined) {
          setFoodRevenue(Number(chargesData.metrics.food_revenue_total));
        } else if (chargesData.services && Array.isArray(chargesData.services)) {
          const computedFoodRev = chargesData.services
            .filter((item) => item.service_type === "Food")
            .reduce((sum, item) => sum + Number(item.total || 0), 0);
          setFoodRevenue(computedFoodRev);
        }
      }
    } catch (error) {
      console.error("Backend Fetch Failed! Staying on fallback state data:", error.message);
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

    const url = isEditMode
      ? `${API}/restaurant-items/${formItem.item_id}`
      : `${API}/restaurant-items`;

    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          item_name: formItem.item_name,
          category: formItem.category,
          price: parseFloat(formItem.price),
          status: formItem.status,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(result.message || "Operation failed.");
      }

      alert(isEditMode ? "Item updated successfully!" : "Item added successfully!");
      setIsFormOpen(false);
      setFormItem({ item_id: null, item_name: "", category: "Food", price: "", status: "Available" });
      fetchItemsFromDB();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;

    try {
      const response = await fetch(`${API}/restaurant-items/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || "Delete failed");
      }

      alert("Item deleted successfully!");
      fetchItemsFromDB();
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${API}/restaurant-items/${id}/toggle-status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        throw new Error("You are not authenticated. Please log in again.");
      }

      if (!response.ok) {
        throw new Error("Unable to update status.");
      }

      fetchItemsFromDB();
    } catch (error) {
      alert(error.message);
    }
  };

  const totalMenuItems = menuItems.length;
  const activeItemsCount = menuItems.filter((item) => item.status === "Available").length;

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(menuItems.length / itemsPerPage));
  const paginatedItems = menuItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="w-full h-[calc(100vh-110px)] flex flex-col gap-5 overflow-hidden p-1">
        <div className="border-b border-slate-200 shrink-0"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-md text-amber-600"><FaUtensils /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Menu Items</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{totalMenuItems}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-md text-amber-600"><FaClipboardList /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Restaurant Menu</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{activeMenuItemsCount}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-md text-amber-600"><FaCoins /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">F&B Room Charge Total</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  ${foodRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex-1 min-h-0 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row gap-3 items-center pb-4 shrink-0 w-full">
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

              <button
                onClick={handleOpenAddModal}
                className="bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition active:scale-95 ml-1.5 h-[30px]"
              >
                <FaPlus className="text-[10px]" />
                <span className="whitespace-nowrap">Add New Item</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl min-h-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 sticky top-0 border-b border-slate-200/60 z-10">
                <tr>
                  <th className="p-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="p-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Name</th>
                  <th className="p-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="p-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price Base</th>
                  <th className="p-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedItems.map((item, index) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={item.item_id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-3.5 text-xs font-bold text-slate-700">{rowNumber}</td>
                      <td className="p-3.5 text-xs font-bold text-slate-700">{item.item_name}</td>
                      <td className="p-3.5 text-xs font-semibold text-slate-400">{item.category}</td>
                      <td className="p-3.5 text-xs font-mono font-bold text-slate-700">
                        ${Number(item.price).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-xs">
                        <button
                          onClick={() => handleToggleStatus(item.item_id)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition transform active:scale-95 ${
                            item.status === "Available"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                              : "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100"
                          }`}
                        >
                          <FaCircle className="text-[4px]" />
                          {item.status}
                        </button>
                      </td>
                      <td className="p-3.5 text-xs text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition"
                            title="Edit Item"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.item_id)}
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                            title="Delete Item"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {menuItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-xs font-semibold text-slate-400">No menu items match the criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {menuItems.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-4 shrink-0">
              <p className="text-xs text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1}
                –{Math.min(currentPage * itemsPerPage, menuItems.length)} of {menuItems.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-xs font-semibold rounded-lg border transition ${
                      page === currentPage
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
                className="h-11 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition active:scale-95"
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
