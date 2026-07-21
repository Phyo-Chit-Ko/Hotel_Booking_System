import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import AdminLayout from "../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import {
  FaUtensils,
  FaCoins,
  FaClipboardList,
  FaPlus,
  FaEdit,
  FaTimes,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { formatCurrency } from "../../utils/currency";
import { authHeaders as getAuthHeaders } from "../../utils/apiHeaders";

export default function RestaurantManagement() {
  const { user } = useAuth();
  const canWrite = (user?.role || "").toLowerCase() === "manager";
 
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [foodRevenue, setFoodRevenue] = useState(0.0);
 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formItem, setFormItem] = useState({
    item_id: null,
    item_name: "",
    category: "Food",
    price: "",
    status: "Available",
  });
 
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
 
  const API = "http://127.0.0.1:8000/api";
 
  const activeMenuItemsCount = menuItems.filter(
    (item) => item.status === "Available"
  ).length;
 
  useEffect(() => {
    fetchItemsFromDB();
  }, [searchQuery, selectedCategory]);
 
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);
 
  const fetchItemsFromDB = async () => {
    try {
      const response = await fetch(
        `${API}/restaurant-items?search=${encodeURIComponent(
          searchQuery
        )}&category=${encodeURIComponent(selectedCategory)}`,
        {
          method: "GET",
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
        method: "GET",
        headers: getAuthHeaders(),
      });
 
      if (chargesResponse.ok) {
        const chargesData = await chargesResponse.json();
 
        if (
          chargesData.metrics &&
          chargesData.metrics.food_revenue_total !== undefined
        ) {
          setFoodRevenue(Number(chargesData.metrics.food_revenue_total));
        } else if (chargesData.services && Array.isArray(chargesData.services)) {
          const computedFoodRev = chargesData.services
            .filter((item) => item.service_type === "Food")
            .reduce((sum, item) => sum + Number(item.total || 0), 0);
          setFoodRevenue(computedFoodRev);
        }
      }
    } catch (error) {
      console.error(
        "Backend Fetch Failed! Staying on fallback state data:",
        error.message
      );
    }
  };
 
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setFormItem({
      item_id: null,
      item_name: "",
      category: "Food",
      price: "",
      status: "Available",
    });
    setIsFormOpen(true);
  };
 
  const handleOpenEditModal = (item) => {
    setIsEditMode(true);
    setFormItem({
      item_id: item.item_id,
      item_name: item.item_name,
      category: item.category,
      price: item.price.toString(),
      status: item.status,
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
 
      toast.success(
        isEditMode ? "Item updated successfully!" : "Item added successfully!"
      );
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
      toast.error(error.message);
    }
  };
 
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this menu item?",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;

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
 
      toast.success("Item deleted successfully!");
      fetchItemsFromDB();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message);
    }
  };
 
  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(
        `${API}/restaurant-items/${id}/toggle-status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );
 
      if (response.status === 401) {
        throw new Error("You are not authenticated. Please log in again.");
      }
 
      if (!response.ok) {
        throw new Error("Unable to update status.");
      }
 
      fetchItemsFromDB();
    } catch (error) {
      toast.error(error.message);
    }
  };
 
  const totalMenuItems = menuItems.length;
 
  const totalPages = Math.max(1, Math.ceil(menuItems.length / itemsPerPage));
  const paginatedItems = menuItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
 
  return (
    <AdminLayout>
      {/* KPI Stat Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50 text-amber-500 border border-amber-100">
            <FaUtensils className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex flex-col gap-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Total Menu Items
            </p>
            <p className="text-xl font-semibold text-slate-800 leading-tight">
              {totalMenuItems}
            </p>
          </div>
        </div>
 
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50 text-amber-500 border border-amber-100">
            <FaClipboardList className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex flex-col gap-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Active Restaurant Menu
            </p>
            <p className="text-xl font-semibold text-slate-800 leading-tight">
              {activeMenuItemsCount}
            </p>
          </div>
        </div>
 
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-50 text-amber-500 border border-amber-100">
            <FaCoins className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex flex-col gap-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              F&B Room Charge Total
            </p>
            <p className="text-xl font-semibold text-slate-800 leading-tight">
              {formatCurrency(foodRevenue)}
            </p>
          </div>
        </div>
      </div>
 
      {/* Main Container Card Wrapper (Clean, Edge-to-Edge Design) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
       
        {/* Top Control Section — Styled with correct padding */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-6">
          <div className="flex flex-row items-center gap-3">
            {/* SEARCH BAR (Removed focus-within ring) */}
            <div className="relative flex items-center h-10 w-72 bg-white rounded-xl border border-slate-200 transition-all">
              <input
                type="text"
                placeholder="Search item or recipe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent h-full pl-4 pr-10 text-sm text-slate-800 outline-none"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-rose-500 hover:text-rose-700 transition"
                  >
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <FaSearch className="text-slate-400 w-3.5 h-3.5" />
                )}
              </div>
            </div>
 
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {["All", "Food", "Snack", "Drink", "Dessert"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-10 px-4 text-xs font-semibold rounded-xl border whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
 
          {canWrite && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-1.5 h-10 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition rounded-xl shadow-sm"
            >
              <FaPlus className="w-2.5 h-2.5" /> Add New Item
            </button>
          )}
        </div>
 
        {/* Clean Rounded Table Layout Section */}
        <div className="px-6 pb-6">
          <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80">
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Price Base
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right pr-8">
                      Actions
                    </th>
                  </tr>
                </thead>
 
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((item, index) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr
                        key={item.item_id}
                        className="hover:bg-slate-50/40 transition group last:border-0"
                      >
                        {/* ID */}
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                          {rowNumber}
                        </td>
 
                        {/* Item Name */}
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                          {item.item_name}
                        </td>
 
                        {/* Category Badges */}
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              item.category === "Food"
                                ? "bg-amber-50 border-amber-200/60 text-amber-600"
                                : item.category === "Drink"
                                ? "bg-blue-50 border-blue-200/60 text-blue-600"
                                : item.category === "Snack"
                                ? "bg-purple-50 border-purple-200/60 text-purple-600"
                                : item.category === "Dessert"
                                ? "bg-rose-50 border-rose-200/60 text-rose-600"
                                : "bg-slate-50 border-slate-200/60 text-slate-600"
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>
 
                        {/* Price Base */}
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                          {formatCurrency(item.price)}
                        </td>
 
                        {/* Status Pill */}
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleToggleStatus(item.item_id)}
                            disabled={!canWrite}
                            title="Click to toggle status"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                              item.status === "Available"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                                : "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100"
                            } disabled:opacity-80`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${
                                item.status === "Available"
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                              }`}
                            />
                            {item.status}
                          </button>
                        </td>
 
                        {/* Actions */}
                        <td className="px-6 py-4 text-sm text-right pr-8">
                          <div className="flex items-center justify-end gap-2.5">
                            {canWrite && (
                              <>
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="text-slate-400 hover:text-slate-600 transition"
                                  title="Edit Item"
                                >
                                  <FaEdit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.item_id)}
                                  className="text-slate-400 hover:text-rose-600 transition"
                                  title="Delete Item"
                                >
                                  <FaTrash className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {menuItems.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-14">
                        <FaUtensils className="w-7 h-7 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-400">
                          No menu items match the criteria.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
 
        {/* Pagination Controls */}
        {menuItems.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
            <p className="text-xs text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, menuItems.length)} of{" "}
              {menuItems.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
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
                )
              )}
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
 
      {/* MODAL WINDOW */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs"
            onClick={() => setIsFormOpen(false)}
          />
 
          <form
            onSubmit={handleFormSubmit}
            noValidate
            className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <FaUtensils className="text-amber-600" />
                  {isEditMode ? "Modify Menu Item" : "Add New Menu Item"}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {isEditMode
                    ? "Update details inside the core master catalog"
                    : "Append new items into the kitchen management records"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-white border shadow-sm p-2 rounded-xl transition flex items-center justify-center"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
 
            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buffalo Chicken Wings"
                  value={formItem.item_name}
                  onChange={(e) =>
                    setFormItem({ ...formItem, item_name: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition"
                />
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Category
                  </label>
                  <select
                    value={formItem.category}
                    onChange={(e) =>
                      setFormItem({ ...formItem, category: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-semibold text-slate-800 outline-none focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition cursor-pointer"
                  >
                    {["Food", "Snack", "Drink", "Dessert"].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
 
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Price (MMK)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="12.50"
                    value={formItem.price}
                    onChange={(e) =>
                      setFormItem({ ...formItem, price: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-semibold text-slate-800 outline-none focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition"
                  />
                </div>
              </div>
 
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={formItem.status}
                  onChange={(e) =>
                    setFormItem({ ...formItem, status: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-semibold text-slate-800 outline-none focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
 
            <div className="bg-slate-50 px-5 py-3.5 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm active:scale-[0.98]"
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
