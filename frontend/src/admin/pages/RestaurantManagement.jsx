import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { 
  FaUtensils, FaCoins, FaClipboardList, FaPlus, 
  FaEdit, FaTrashAlt, FaCheckCircle, FaTimes, 
  FaSearch, FaCircle
} from "react-icons/fa";

export default function RestaurantManagement() {
  // Master state mapping the updated core categories
  const [menuItems, setMenuItems] = useState([
    { item_id: 1, item_name: "Ribeye Steak with Garlic Butter", category: "Food", price: 38.50, status: "Available" },
    { item_id: 2, item_name: "Club Sandwich with Fries", category: "Snack", price: 14.00, status: "Available" },
    { item_id: 3, item_name: "Iced Caramel Macchiato", category: "Drink", price: 6.50, status: "Available" },
    { item_id: 4, item_name: "Truffle Parmesan Fries", category: "Snack", price: 9.50, status: "Available" },
    { item_id: 5, item_name: "Fresh Mint Mojito", category: "Drink", price: 8.00, status: "Out of Stock" },
    { item_id: 6, item_name: "Matcha Cheesecake Slice", category: "Dessert", price: 10.50, status: "Available" }
  ]);

  const [activeOrders, setActiveOrders] = useState([
    { order_id: 4001, service_id: 902, table_or_room: "Room 201", total_amount: "$52.99", status: "Preparing", time: "12m ago" },
    { order_id: 4002, service_id: 905, table_or_room: "Table 4", total_amount: "$26.50", status: "Ready", time: "4m ago" }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form initialization updated to reflect standard groups
  const [formItem, setFormItem] = useState({ item_name: "", category: "Food", price: "", status: "Available" });

  const handleAddItem = (e) => {
    e.preventDefault();
    const newItem = {
      item_id: menuItems.length + 1,
      ...formItem,
      price: parseFloat(formItem.price) || 0
    };
    setMenuItems([...menuItems, newItem]);
    setIsFormOpen(false);
    setFormItem({ item_name: "", category: "Food", price: "", status: "Available" });
  };

  const toggleStatus = (id) => {
    setMenuItems(menuItems.map(item => 
      item.item_id === id 
        ? { ...item, status: item.status === "Available" ? "Out of Stock" : "Available" } 
        : item
    ));
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      {/* Viewport Lock Wrapper: Completely prevents full-page scrolling layout issues */}
      <div className="w-full h-[calc(100vh-110px)] flex flex-col gap-5 overflow-hidden p-1">
        
        {/* 1. Control Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Restaurant Operations</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Manage culinary menus, item pricing matrices, and live room orders</p>
          </div>
          
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            <FaPlus className="text-xs" />
            <span>Add New Item</span>
          </button>
        </div>

        {/* 2. Restaurant Performance Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-xl text-amber-600"><FaUtensils /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Menu Items</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">{menuItems.length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-xl text-amber-600"><FaClipboardList /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Restaurant Orders</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">{activeOrders.length}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100 text-xl text-amber-600"><FaCoins /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">F&B Room Charge Total</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">$1,424.50</h3>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Main Operational Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
          
          {/* LEFT & CENTER INTERFACE: Menu Catalog Grid & Pricing Manager */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm lg:col-span-2 flex flex-col min-h-0">
            
            {/* Search and Updated Category Filters Panel */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pb-4 shrink-0">
              <div className="relative w-full sm:w-72">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input 
                  type="text" 
                  placeholder="Search item or recipe..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-400 transition"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {["All", "Food", "Snack", "Drink", "Dessert"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border whitespace-nowrap transition ${
                      selectedCategory === cat 
                        ? "bg-slate-900 border-slate-900 text-white shadow-xs" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Structured Table Container matching the Restaurant_Item schema layout */}
            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 min-h-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 border-b border-slate-200 shadow-xs z-10">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Price Base</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/40">
                  {filteredItems.map((item) => (
                    <tr key={item.item_id} className="hover:bg-white transition-colors">
                      <td className="p-4 text-sm font-bold text-slate-800">{item.item_name}</td>
                      <td className="p-4 text-sm font-semibold text-slate-500">{item.category}</td>
                      <td className="p-4 text-sm font-mono font-bold text-slate-900">${item.price.toFixed(2)}</td>
                      <td className="p-4 text-sm">
                        <button 
                          onClick={() => toggleStatus(item.item_id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition border ${
                            item.status === "Available" 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                              : "bg-rose-50 border-rose-100 text-rose-700"
                          }`}
                        >
                          <FaCircle className="text-[6px]" />
                          {item.status}
                        </button>
                      </td>
                      <td className="p-4 text-sm text-right space-x-2">
                        <button className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition bg-white inline-flex shadow-xs">
                          <FaEdit className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-sm font-semibold text-slate-400">No menu items match the filter parameters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* RIGHT PANEL: Live Order Fulfillment Window */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between min-h-0">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="shrink-0 pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Live Services Dispatch</h3>
                <p className="text-xs text-slate-400 mt-0.5">Active kitchen tickets assigned to property bookings</p>
              </div>

              {/* Localized Scrolling Feed */}
              <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3.5 min-h-0 scrollbar-none">
                {activeOrders.map((order) => (
                  <div key={order.order_id} className="p-3.5 border border-slate-200 bg-slate-50/50 rounded-xl flex flex-col gap-3 relative group">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-400">TICKET #{order.order_id}</span>
                        <h4 className="text-sm font-black text-slate-800 mt-0.5">{order.table_or_room}</h4>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                        order.status === "Ready" ? "bg-amber-500 text-white" : "bg-slate-900 text-white"
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-400 font-mono font-medium">{order.time}</span>
                      <span className="text-sm font-black text-slate-900 font-mono">{order.total_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full text-center text-xs font-bold text-slate-700 border border-slate-200 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition mt-4 shrink-0">
              View Order History Ledger
            </button>
          </div>

        </div>
      </div>

      {/* 4. Overlay Form Modal Layer: Add New Restaurant_Item with clean categories */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          
          <form onSubmit={handleAddItem} className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-md font-bold text-slate-900">Add New Menu Entity</h3>
                <p className="text-xs text-slate-400 mt-0.5">Appends values to the Restaurant_Item master records</p>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><FaTimes className="text-sm" /></button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Item Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Buffalo Chicken Wings" 
                  value={formItem.item_name}
                  onChange={(e) => setFormItem({ ...formItem, item_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                  <select 
                    value={formItem.category}
                    onChange={(e) => setFormItem({ ...formItem, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-slate-400 transition cursor-pointer"
                  >
                    {["Food", "Snack", "Drink", "Dessert"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required
                    placeholder="12.50" 
                    value={formItem.price}
                    onChange={(e) => setFormItem({ ...formItem, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-800 outline-none focus:border-slate-400 transition"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-4 flex items-center justify-end gap-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-4 py-2">Cancel</button>
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm">
                Commit to Catalog
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}